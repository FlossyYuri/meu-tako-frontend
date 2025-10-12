<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink to="/limits" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para limites
      </NuxtLink>
    </div>

    <Card v-if="limit">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Limite</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ categoryName }} • {{ formatDisplayDate(form.start_date) }} - {{ formatDisplayDate(form.end_date) }}
            </p>
          </div>
          <Badge variant="info">{{ statusText }}</Badge>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Status/progresso -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Uso</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(status?.used || 0) }} / {{ formatCurrency(status?.limit_amount || 0) }}
              ({{ status?.percentage || 0 }}%)
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                 :style="{ width: `${Math.min(100, status?.percentage || 0)}%` }" />
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Restante: {{ formatCurrency(status?.remaining || 0) }}
          </p>
        </div>

        <!-- Form edição -->
        <form class="space-y-4" @submit.prevent="onSave">
          <div>
            <label class="label">Categoria</label>
            <select v-model="form.expense_category_id" class="input">
              <option v-for="c in categoriesStore.expenseCategories" :key="c.category_id" :value="c.category_id">{{ c.name }}</option>
            </select>
          </div>

          <Input v-model="form.amount" type="number" label="Valor do limite" step="0.01" min="0.01" :error="errors.amount" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input v-model="form.start_date" type="date" label="Início" :error="errors.start_date" />
            <Input v-model="form.end_date" type="date" label="Fim" :error="errors.end_date" />
          </div>

          <Input v-model="form.description" type="text" label="Descrição" />

          <div class="flex flex-wrap gap-3">
            <Button type="submit" variant="primary" :loading="limitsStore.isLoading" icon="lucide:save">Salvar</Button>
            <Button variant="error" icon="lucide:trash-2" @click="onDelete">Excluir</Button>
          </div>
        </form>
      </div>
    </Card>

    <div v-else class="py-12">
      <LoadingSpinner center text="Carregando limite..." />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const limitsStore = useLimitsStore()
const categoriesStore = useCategoriesStore()
const { formatCurrency, formatDisplayDate } = useApi()
const { success, error: showError } = useNotifications()

const limit = ref<import('~/types').Limit | null>(null)
const status = ref<import('~/types').LimitStatus | null>(null)

const form = reactive({
  expense_category_id: '',
  amount: '',
  start_date: '',
  end_date: '',
  description: ''
})

const errors = reactive({
  amount: '',
  start_date: '',
  end_date: ''
})

const categoryName = computed(() =>
  categoriesStore.getExpenseCategoryById(form.expense_category_id)?.name || 'Categoria'
)

const statusText = computed(() => `${status.value?.percentage || 0}% usado`)

const load = async () => {
  const data = await limitsStore.getLimitById(id)
  limit.value = data
  form.expense_category_id = data.expense_category_id
  form.amount = String(data.amount)
  form.start_date = data.start_date
  form.end_date = data.end_date
  form.description = (data as any).description || '' // description pode ser opcional

  status.value = await limitsStore.getLimitStatus(id)
}

const validate = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true
  const val = parseFloat(form.amount)
  if (!form.amount || isNaN(val) || val <= 0) { errors.amount = 'Valor inválido'; ok = false }
  if (!form.start_date) { errors.start_date = 'Data inicial é obrigatória'; ok = false }
  if (!form.end_date) { errors.end_date = 'Data final é obrigatória'; ok = false }
  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
    errors.end_date = 'Data final não pode ser anterior à inicial'; ok = false
  }
  return ok
}

const onSave = async () => {
  if (!validate()) return
  try {
    await limitsStore.updateLimit(id, {
      expense_category_id: form.expense_category_id || undefined,
      amount: parseFloat(form.amount),
      start_date: form.start_date,
      end_date: form.end_date,
      description: form.description || undefined
    })
    success('Limite atualizado')
    await load()
  } catch (err: any) {
    showError('Erro ao salvar limite', err?.message)
  }
}

const onDelete = async () => {
  if (!confirm('Tem certeza que deseja excluir este limite?')) return
  try {
    await limitsStore.deleteLimit(id)
    success('Limite excluído')
    await navigateTo('/limits')
  } catch (err: any) {
    showError('Erro ao excluir limite', err?.message)
  }
}

onMounted(async () => {
  try {
    await categoriesStore.fetchExpenseCategories(false)
    await load()
  } catch (err: any) {
    showError('Erro ao carregar limite', err?.message)
  }
})
</script>