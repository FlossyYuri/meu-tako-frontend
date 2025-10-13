<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/goals"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para metas
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Nova Meta</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Defina uma nova meta financeira e acompanhe seu progresso
        </p>
      </template>

      <form class="space-y-6" @submit.prevent="onSubmit">
        <div>
          <Input
            v-model="form.title"
            type="text"
            label="Título"
            placeholder="Ex.: Férias na Europa"
            :error="errors.title"
            required
          />
        </div>

        <div>
          <Input
            v-model="form.description"
            type="text"
            label="Descrição (opcional)"
            placeholder="Ex.: Economizar para viajar"
          />
        </div>

        <div>
          <Input
            v-model="form.target_amount"
            type="number"
            label="Valor alvo"
            placeholder="0,00"
            :error="errors.target_amount"
            required
            step="0.01"
            min="0.01"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            v-model="form.start_date"
            type="date"
            label="Data de início"
            :error="errors.start_date"
            required
          />
          <Input
            v-model="form.end_date"
            type="date"
            label="Data de término"
            :error="errors.end_date"
            required
          />
        </div>

        <div>
          <label class="label">Categoria de Despesa (opcional)</label>
          <select
            v-model="form.expense_category_id"
            class="input"
          >
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

        <div class="flex gap-3">
          <Button type="button" variant="outline" @click="navigateTo('/goals')">Cancelar</Button>
          <Button
            type="submit"
            variant="primary"
            :loading="goalsStore.isLoading"
            :disabled="!isValid"
          >
            Criar Meta
          </Button>
        </div>

        <div v-if="goalsStore.error" class="text-center">
          <p class="text-sm text-error-600 dark:text-error-400">
            {{ goalsStore.error }}
          </p>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const goalsStore = useGoalsStore()
const categoriesStore = useCategoriesStore()
const { success, error: showError } = useNotifications()

const today = new Date()
const defaultStart = today.toISOString().split('T')[0]
const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  .toISOString().split('T')[0]

const form = reactive({
  title: '',
  description: '',
  target_amount: '',
  start_date: defaultStart,
  end_date: defaultEnd,
  expense_category_id: ''
})

const errors = reactive({
  title: '',
  target_amount: '',
  start_date: '',
  end_date: ''
})

const isValid = computed(() => {
  return !!form.title.trim() &&
    !!form.target_amount &&
    !!form.start_date &&
    !!form.end_date &&
    !errors.title &&
    !errors.target_amount &&
    !errors.start_date &&
    !errors.end_date
})

const validate = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true
  if (!form.title.trim()) { errors.title = 'Título é obrigatório'; ok = false }
  const val = parseFloat(form.target_amount)
  if (!form.target_amount || isNaN(val) || val <= 0) {
    errors.target_amount = 'Valor alvo deve ser maior que zero'
    ok = false
  }
  if (!form.start_date) { errors.start_date = 'Data de início é obrigatória'; ok = false }
  if (!form.end_date) { errors.end_date = 'Data de término é obrigatória'; ok = false }
  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
    errors.end_date = 'Término não pode ser antes do início'
    ok = false
  }
  return ok
}

const onSubmit = async () => {
  if (!validate()) return
  try {
    await goalsStore.createGoal({
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      target_amount: parseFloat(form.target_amount),
      start_date: form.start_date,
      end_date: form.end_date,
      expense_category_id: form.expense_category_id || undefined
    })
    success('Meta criada com sucesso!')
    await navigateTo('/goals')
  } catch (err: any) {
    showError('Erro ao criar meta', err?.message)
  }
}

onMounted(async () => {
  try {
    // Carregar categorias de despesa (apenas ativas)
    await categoriesStore.fetchExpenseCategories(true)
  } catch {}
})

watch(() => form.title, () => { if (errors.title) errors.title = '' })
watch(() => form.target_amount, () => { if (errors.target_amount) errors.target_amount = '' })
watch(() => form.start_date, () => { if (errors.start_date) errors.start_date = '' })
watch(() => form.end_date, () => { if (errors.end_date) errors.end_date = '' })
</script>