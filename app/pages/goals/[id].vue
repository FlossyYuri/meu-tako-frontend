<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/goals"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para metas
      </NuxtLink>
    </div>

    <Card v-if="goal">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ goal.title }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDisplayDate(goal.start_date) }} - {{ formatDisplayDate(goal.end_date) }}
            </p>
          </div>
          <Badge :variant="goal.is_active ? 'success' : 'default'">
            {{ goal.is_active ? 'Ativa' : 'Inativa' }}
          </Badge>
        </div>
      </template>

      <div class="space-y-8">
        <!-- Progresso -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Progresso</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(currentAmount) }} / {{ formatCurrency(goal.target_amount) }}
              ({{ progressPercent }}%)
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(100, progressPercent)}%` }"
            />
          </div>
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Restante: {{ formatCurrency(Math.max(goal.target_amount - currentAmount, 0)) }}
            <span v-if="progress?.days_remaining !== undefined"> • {{ progress?.days_remaining }} dia(s) restantes</span>
          </div>
        </div>

        <!-- Contribuir -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-3">Contribuir para a meta</h3>
          <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="onContribute">
            <Input
              v-model="contribution"
              type="number"
              placeholder="Valor da contribuição"
              :error="contributionError"
              step="0.01"
              min="0.01"
            />
            <Button
              type="submit"
              variant="primary"
              :loading="goalsStore.isLoading"
              :disabled="!canContribute"
              icon="lucide:plus"
            >
              Contribuir
            </Button>
          </form>
        </div>

        <!-- Edição -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-4">Editar meta</h3>
          <form class="space-y-4" @submit.prevent="onSave">
            <Input v-model="form.title" label="Título" :error="errors.title" required />
            <Input v-model="form.description" label="Descrição (opcional)" />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input v-model="form.target_amount" type="number" label="Valor alvo" step="0.01" min="0.01" :error="errors.target_amount" />
              <div>
                <label class="label">Categoria de Despesa (opcional)</label>
                <select v-model="form.expense_category_id" class="input">
                  <option value="">Sem categoria</option>
                  <option
                    v-for="c in categoriesStore.expenseCategories"
                    :key="c.category_id"
                    :value="c.category_id"
                  >
                    {{ c.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input v-model="form.start_date" type="date" label="Início" :error="errors.start_date" />
              <Input v-model="form.end_date" type="date" label="Fim" :error="errors.end_date" />
            </div>

            <div class="flex flex-wrap gap-3">
              <Button type="submit" variant="primary" :loading="goalsStore.isLoading" icon="lucide:save">
                Salvar alterações
              </Button>
              <Button variant="error" icon="lucide:trash-2" @click="onDelete">
                Excluir meta
              </Button>
            </div>

            <div v-if="goalsStore.error" class="text-center">
              <p class="text-sm text-error-600 dark:text-error-400">
                {{ goalsStore.error }}
              </p>
            </div>
          </form>
        </div>
      </div>
    </Card>

    <div v-else class="py-12">
      <LoadingSpinner center text="Carregando meta..." />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const goalsStore = useGoalsStore()
const categoriesStore = useCategoriesStore()
const { formatCurrency, formatDisplayDate, calculatePercentage } = useApi()
const { success, error: showError } = useNotifications()

const goal = ref<import('~/types').Goal | null>(null)
const progress = ref<import('~/types').GoalProgress | null>(null)

const form = reactive({
  title: '',
  description: '',
  target_amount: '',
  start_date: '',
  end_date: '',
  expense_category_id: ''
})

const errors = reactive({
  title: '',
  target_amount: '',
  start_date: '',
  end_date: ''
})

const contribution = ref('')
const contributionError = ref('')

const currentAmount = computed(() => goal.value?.current_amount ?? progress.value?.current_amount ?? 0)
const progressPercent = computed(() => {
  if (progress.value?.percentage !== undefined) return Math.round(progress.value.percentage)
  if (!goal.value) return 0
  return calculatePercentage(currentAmount.value, goal.value.target_amount)
})

const canContribute = computed(() => {
  const val = parseFloat(contribution.value)
  return !!contribution.value && !isNaN(val) && val > 0 && !contributionError.value
})

const load = async () => {
  const data = await goalsStore.getGoalById(id)
  goal.value = data
  form.title = data.title
  form.description = data.description || ''
  form.target_amount = String(data.target_amount)
  form.start_date = data.start_date
  form.end_date = data.end_date
  form.expense_category_id = (data as any).expense_category_id || ''

  try {
    progress.value = await goalsStore.getGoalProgress(id)
  } catch {
    progress.value = null
  }
}

const validateEdit = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true
  if (!form.title.trim()) { errors.title = 'Título é obrigatório'; ok = false }
  if (form.target_amount) {
    const val = parseFloat(form.target_amount)
    if (isNaN(val) || val <= 0) { errors.target_amount = 'Valor alvo inválido'; ok = false }
  }
  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
    errors.end_date = 'Término não pode ser antes do início'
    ok = false
  }
  return ok
}

const onSave = async () => {
  if (!validateEdit()) return
  try {
    await goalsStore.updateGoal(id, {
      title: form.title.trim() || undefined,
      description: form.description?.trim() || undefined,
      target_amount: form.target_amount ? parseFloat(form.target_amount) : undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      expense_category_id: form.expense_category_id || undefined
    })
    success('Meta atualizada com sucesso')
    await load()
  } catch (err: any) {
    showError('Erro ao salvar meta', err?.message)
  }
}

const onContribute = async () => {
  contributionError.value = ''
  const val = parseFloat(contribution.value)
  if (!contribution.value || isNaN(val) || val <= 0) {
    contributionError.value = 'Informe um valor válido'
    return
  }
  try {
    await goalsStore.contributeToGoal(id, { amount: val })
    success('Contribuição registrada!')
    contribution.value = ''
    await load()
  } catch (err: any) {
    showError('Erro ao contribuir', err?.message)
  }
}

const onDelete = async () => {
  if (!confirm('Tem certeza que deseja excluir esta meta?')) return
  try {
    await goalsStore.deleteGoal(id)
    success('Meta excluída')
    await navigateTo('/goals')
  } catch (err: any) {
    showError('Erro ao excluir meta', err?.message)
  }
}

onMounted(async () => {
  try {
    await categoriesStore.fetchExpenseCategories(true)
  } catch {}
  try {
    await load()
  } catch (err: any) {
    showError('Erro ao carregar meta', err?.message)
  }
})

watch(() => form.title, () => { if (errors.title) errors.title = '' })
watch(() => form.target_amount, () => { if (errors.target_amount) errors.target_amount = '' })
watch(() => form.start_date, () => { if (errors.start_date) errors.start_date = '' })
watch(() => form.end_date, () => { if (errors.end_date) errors.end_date = '' })
watch(contribution, () => { if (contributionError.value) contributionError.value = '' })
</script>