<template>
  <Modal
    :is-open="isOpen"
    title="Status do Limite"
    size="lg"
    @update:is-open="emit('update:isOpen', $event)"
  >
    <!-- Informações da Categoria -->
    <div
      v-if="categoryInfo"
      class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: categoryInfo.color || '#6B7280' }"
        >
          <Icon
            :name="categoryInfo.icon || 'lucide:tag'"
            class="w-5 h-5 text-white"
          />
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ categoryInfo.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ categoryInfo.description || 'Sem descrição' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-8">
      <LoadingSpinner center text="Carregando status do limite..." />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-8 text-center">
      <Icon
        name="lucide:alert-circle"
        class="w-10 h-10 text-red-500 mx-auto mb-2"
      />
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Status Content -->
    <div v-else-if="status" class="space-y-6">
      <!-- Progress Bar -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progresso do limite
          </span>
          <span class="text-sm font-semibold" :class="getStatusTextColor()">
            {{ status.percentageUsed.toFixed(1) }}% usado
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            class="h-3 rounded-full transition-all duration-300"
            :class="getProgressBarClass()"
            :style="{ width: `${Math.min(status.percentageUsed, 100)}%` }"
          />
        </div>
      </div>

      <!-- Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Valor do Limite -->
        <Card>
          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:target" class="w-5 h-5 text-blue-500" />
              <h4 class="font-medium text-gray-900 dark:text-white">
                Limite definido
              </h4>
            </div>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ formatCurrency(status.limit.limit_amount) }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Período: {{ formatDate(status.limit.start_date) }} até
              {{ formatDate(status.limit.end_date) }}
            </p>
          </div>
        </Card>

        <!-- Valor Gasto -->
        <Card>
          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:credit-card" class="w-5 h-5 text-orange-500" />
              <h4 class="font-medium text-gray-900 dark:text-white">
                Valor gasto
              </h4>
            </div>
            <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {{ formatCurrency(status.totalSpent) }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ status.transactionCount || 0 }} transações
            </p>
          </div>
        </Card>

        <!-- Valor Restante -->
        <Card>
          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:wallet" class="w-5 h-5 text-green-500" />
              <h4 class="font-medium text-gray-900 dark:text-white">
                Valor restante
              </h4>
            </div>
            <p class="text-2xl font-bold" :class="getRemainingAmountColor()">
              {{ formatCurrency(status.remainingAmount) }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ getRemainingDays() }} dias restantes
            </p>
          </div>
        </Card>

        <!-- Status -->
        <Card>
          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon
                :name="getStatusIcon()"
                class="w-5 h-5"
                :class="getStatusIconColor()"
              />
              <h4 class="font-medium text-gray-900 dark:text-white">Status</h4>
            </div>
            <div class="space-y-2">
              <Badge
                :variant="getStatusBadgeVariant()"
                size="lg"
                class="text-sm"
              >
                {{ getStatusText() }}
              </Badge>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ getStatusDescription() }}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Alertas -->
      <div v-if="status.isExceeded || status.isNearLimit" class="space-y-3">
        <div
          v-if="status.isExceeded"
          class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div class="flex items-center gap-2">
            <Icon name="lucide:alert-triangle" class="w-5 h-5 text-red-500" />
            <h4 class="font-medium text-red-800 dark:text-red-200">
              Limite excedido!
            </h4>
          </div>
          <p class="text-sm text-red-700 dark:text-red-300 mt-1">
            Você ultrapassou o limite em
            {{ formatCurrency(Math.abs(status.remainingAmount)) }}.
          </p>
        </div>

        <div
          v-else-if="status.isNearLimit"
          class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div class="flex items-center gap-2">
            <Icon name="lucide:alert-circle" class="w-5 h-5 text-yellow-500" />
            <h4 class="font-medium text-yellow-800 dark:text-yellow-200">
              Próximo do limite
            </h4>
          </div>
          <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Você está próximo de atingir o limite. Cuidado com os gastos!
          </p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        @click="emit('update:isOpen', false)"
      >
        Fechar
      </Button>
      <Button
        v-if="status"
        variant="primary"
        icon="lucide:edit"
        @click="openEditLimit"
      >
        Editar limite
      </Button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import type { LimitStatus } from '~/types'

interface Props {
  isOpen: boolean
  expenseCategoryId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'editLimit': [categoryId: string]
}>()

const limitsStore = useLimitsStore()
const categoriesStore = useCategoriesStore()
const { formatCurrency } = useCurrency()

const isLoading = ref(false)
const error = ref<string | null>(null)
const status = ref<LimitStatus | null>(null)

const categoryInfo = computed(() => {
  return categoriesStore.expenseCategories.find(c => c.category_id === props.expenseCategoryId)
})

const currentLimit = computed(() => {
  return limitsStore.limits.find(l => l.expense_category_id === props.expenseCategoryId)
})

watch(() => props.isOpen, async (open) => {
  if (open && props.expenseCategoryId) {
    await loadStatus()
  }
})

const loadStatus = async () => {
  if (!currentLimit.value) {
    error.value = 'Nenhum limite encontrado para esta categoria'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    status.value = await limitsStore.getLimitStatus(currentLimit.value.limit_id)
  } catch (err: any) {
    error.value = err?.message || 'Erro ao carregar status do limite'
  } finally {
    isLoading.value = false
  }
}

const getProgressBarClass = () => {
  if (!status.value) return 'bg-gray-400'
  if (status.value.isExceeded) return 'bg-red-500'
  if (status.value.isNearLimit) return 'bg-yellow-500'
  if (status.value.percentageUsed >= 60) return 'bg-orange-500'
  return 'bg-blue-500'
}

const getStatusTextColor = () => {
  if (!status.value) return 'text-gray-600'
  if (status.value.isExceeded) return 'text-red-600'
  if (status.value.isNearLimit) return 'text-yellow-600'
  return 'text-blue-600'
}

const getRemainingAmountColor = () => {
  if (!status.value) return 'text-gray-600'
  if (status.value.isExceeded) return 'text-red-600'
  if (status.value.isNearLimit) return 'text-yellow-600'
  return 'text-green-600'
}

const getStatusIcon = () => {
  if (!status.value) return 'lucide:help-circle'
  if (status.value.isExceeded) return 'lucide:alert-triangle'
  if (status.value.isNearLimit) return 'lucide:alert-circle'
  return 'lucide:check-circle'
}

const getStatusIconColor = () => {
  if (!status.value) return 'text-gray-500'
  if (status.value.isExceeded) return 'text-red-500'
  if (status.value.isNearLimit) return 'text-yellow-500'
  return 'text-green-500'
}

const getStatusBadgeVariant = () => {
  if (!status.value) return 'secondary'
  if (status.value.isExceeded) return 'error'
  if (status.value.isNearLimit) return 'warning'
  return 'success'
}

const getStatusText = () => {
  if (!status.value) return 'Desconhecido'
  if (status.value.isExceeded) return 'Excedido'
  if (status.value.isNearLimit) return 'Próximo do limite'
  return 'Dentro do limite'
}

const getStatusDescription = () => {
  if (!status.value) return 'Status não disponível'
  if (status.value.isExceeded) return 'Limite foi ultrapassado'
  if (status.value.isNearLimit) return 'Cuidado! Próximo do limite'
  return 'Gastos dentro do limite'
}

const getRemainingDays = () => {
  if (!status.value) return 0
  const endDate = new Date(status.value.limit.end_date)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const formatDate = (dateString: string) => {
  if (!dateString || dateString.trim() === '') return 'Data não disponível'

  // Tentar diferentes formatos de data
  let date: Date

  // Se já é um objeto Date válido
  if (typeof dateString === 'object' && dateString instanceof Date && !isNaN(dateString.getTime())) {
    date = dateString
  } else {
    // Tentar criar um novo Date
    date = new Date(dateString)

    // Se falhar, tentar parsear como ISO
    if (isNaN(date.getTime())) {
      // Tentar formatos comuns
      const isoDate = dateString.replace(/[^\d-]/g, '-')
      date = new Date(isoDate)
    }
  }

  if (isNaN(date.getTime())) return 'Data inválida'

  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const openEditLimit = () => {
  emit('editLimit', props.expenseCategoryId)
  emit('update:isOpen', false)
}
</script>
