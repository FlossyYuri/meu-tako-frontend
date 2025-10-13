<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/limits"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para limites
      </NuxtLink>
    </div>

    <Card v-if="limit">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              Limite
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ categoryName }} • {{ formatDisplayDate(limit?.start_date) }} -
              {{ formatDisplayDate(limit?.end_date) }}
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
              {{ formatCurrency(status?.totalSpent || 0) }} /
              {{ formatCurrency(parseFloat(status?.limit?.limit_amount || '0')) }}
              ({{ status?.percentageUsed || 0 }}%)
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="getProgressBarClass(status)"
              :style="{ width: `${Math.min(100, status?.percentageUsed || 0)}%` }"
            />
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Restante: {{ formatCurrency(status?.remainingAmount || 0) }}
            <span
              v-if="status?.isExceeded"
              class="text-error-500 font-semibold ml-1"
            >
              (EXCEDIDO)
            </span>
            <span
              v-else-if="status?.isNearLimit"
              class="text-warning-500 font-semibold ml-1"
            >
              (PRÓXIMO DO LIMITE)
            </span>
          </p>
        </div>

        <!-- Form edição -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Editar Limite
          </h3>
          <LimitForm
            :initial-data="formData"
            :categories="categoriesStore.expenseCategories"
            :is-loading="limitsStore.isLoading"
            :error="limitsStore.error"
            @submit="onSave"
            @cancel="navigateTo('/limits')"
          />

          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="error"
              icon="lucide:trash-2"
              :loading="limitsStore.isLoading"
              @click="onDelete"
            >
              Excluir Limite
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <div v-else class="py-12">
      <LoadingSpinner center text="Carregando limite..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Limit, LimitStatus, CreateLimitRequest, UpdateLimitRequest } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const limitsStore = useLimitsStore()
const categoriesStore = useCategoriesStore()
const { formatCurrency, formatDisplayDate } = useApi()
const { success, error: showError } = useNotifications()

const limit = ref<Limit | null>(null)
const status = ref<LimitStatus | null>(null)

const formData = computed(() => {
  if (!limit.value) return {}

  return {
    limit_id: limit.value.limit_id,
    expense_category_id: limit.value.expense_category_id,
    limit_amount: limit.value.limit_amount,
    start_date: limit.value.start_date,
    end_date: limit.value.end_date,
    description: limit.value.description || ''
  }
})

const categoryName = computed(() =>
  categoriesStore.getExpenseCategoryById(limit.value?.expense_category_id || '')?.name || 'Categoria'
)

const statusText = computed(() => `${status.value?.percentageUsed || 0}% usado`)

const getProgressBarClass = (status: LimitStatus | null) => {
  if (!status) return 'bg-primary-600'
  if (status.isExceeded) return 'bg-error-500'
  if (status.isNearLimit) return 'bg-warning-500'
  if (status.percentageUsed >= 60) return 'bg-yellow-500'
  return 'bg-primary-600'
}

const load = async () => {
  const data = await limitsStore.getLimitById(id)
  limit.value = data
  status.value = await limitsStore.getLimitStatus(id)
}

const onSave = async (data: CreateLimitRequest | UpdateLimitRequest) => {
  try {
    await limitsStore.updateLimit(id, {
      expense_category_id: data.expense_category_id || undefined,
      limit_amount: data.limit_amount,
      start_date: data.start_date,
      end_date: data.end_date,
      description: data.description || undefined
    })
    success('Limite atualizado com sucesso')
    await load()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    showError('Erro ao salvar limite', errorMessage)
  }
}

const onDelete = async () => {
  if (!confirm('Tem certeza que deseja excluir este limite?')) return
  try {
    await limitsStore.deleteLimit(id)
    success('Limite excluído')
    await navigateTo('/limits')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    showError('Erro ao excluir limite', errorMessage)
  }
}

onMounted(async () => {
  try {
    await categoriesStore.fetchExpenseCategories(false)
    await load()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    showError('Erro ao carregar limite', errorMessage)
  }
})
</script>
