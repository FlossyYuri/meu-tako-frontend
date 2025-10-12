<template>
  <div class="space-y-6">
    <PageHeader title="Limites de Despesa" subtitle="Defina e acompanhe limites por categoria">
      <template #actions>
        <Button to="/limits/new" variant="primary" icon="lucide:plus">Novo Limite</Button>
      </template>
    </PageHeader>

    <Card>
      <template #header>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Limites</h2>
      </template>

      <div v-if="limitsStore.isLoading" class="p-6">
        <LoadingSpinner text="Carregando limites..." />
      </div>

      <div v-else-if="limitsStore.limits.length === 0" class="p-6 text-center">
        <Icon name="lucide:shield" class="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500 dark:text-gray-400">Nenhum limite configurado</p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="l in limitsStore.limits" :key="l.limit_id" class="p-4 flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ getCategoryName(l.expense_category_id) }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDisplayDate(l.start_date) }} - {{ formatDisplayDate(l.end_date) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(l.amount) }}</span>
            <Button :to="`/limits/${l.limit_id}`" size="sm" variant="outline" icon="lucide:eye">Ver</Button>
            <Button size="sm" variant="error" icon="lucide:trash-2" @click="onDelete(l.limit_id)">Excluir</Button>
          </div>
        </div>
      </div>
    </Card>

    <div v-if="limitsStore.error" class="text-center text-error-600 dark:text-error-400">
      {{ limitsStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const limitsStore = useLimitsStore()
const categoriesStore = useCategoriesStore()
const { formatCurrency, formatDisplayDate } = useApi()
const { success, error: showError } = useNotifications()

const getCategoryName = (id: string) =>
  categoriesStore.getExpenseCategoryById(id)?.name || 'Categoria'

const onDelete = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir este limite?')) return
  try {
    await limitsStore.deleteLimit(id)
    success('Limite excluído')
  } catch (err: any) {
    showError('Erro ao excluir limite', err?.message)
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      categoriesStore.fetchExpenseCategories(false),
      limitsStore.fetchLimits()
    ])
  } catch {}
})
</script>