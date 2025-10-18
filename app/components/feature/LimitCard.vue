<template>
  <Card class="hover:shadow-md transition-shadow duration-200 relative">
    <!-- Floating Options Button -->
    <div class="absolute top-4 right-4 z-10">
      <ActionDropdown>
        <ActionItem
          label="Visualizar"
          icon="lucide:eye"
          @click="$emit('view', limit)"
        />
        <ActionItem
          label="Editar"
          icon="lucide:edit"
          @click="$emit('edit', limit)"
        />
        <ActionItem
          label="Excluir"
          icon="lucide:trash-2"
          variant="danger"
          @click="$emit('delete', limit)"
        />
      </ActionDropdown>
    </div>

    <div class="flex items-start">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            :style="{ backgroundColor: category?.color || '#6B7280' }"
          >
            <Icon
              :name="category?.icon || 'lucide:tag'"
              class="w-4 h-4 text-white"
            />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ category?.name || 'Categoria' }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDisplayDate(limit.start_date) }} -
              {{ formatDisplayDate(limit.end_date) }}
            </p>
          </div>
        </div>

        <div v-if="limit.description" class="mb-3">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ limit.description }}
          </p>
        </div>

        <!-- Progress bar -->
        <div v-if="safeStatus" class="mb-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">Uso</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(safeStatus.used) }} /
              {{ formatCurrency(safeStatus.limit_amount) }}
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="getProgressBarClass(safeStatus)"
              :style="{ width: `${Math.min(100, safeStatus.percentage)}%` }"
            />
          </div>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ safeStatus.percentage.toFixed(1) }}% usado
              <span
                v-if="safeStatus.isExceeded"
                class="text-error-500 font-semibold ml-1"
              >
                (EXCEDIDO)
              </span>
              <span
                v-else-if="safeStatus.isNearLimit"
                class="text-warning-500 font-semibold ml-1"
              >
                (PRÓXIMO DO LIMITE)
              </span>
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Restante: {{ formatCurrency(safeStatus.remaining) }}
            </span>
          </div>
        </div>

        <!-- Fallback when status is not available -->
        <div v-else-if="status === null || status === undefined" class="mb-3">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Carregando status...
          </div>
        </div>

        <!-- Status badge -->
        <div class="flex items-center gap-2">
          <Badge :variant="getStatusVariant(limit)">
            {{ getStatusText(limit) }}
          </Badge>
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            {{ formatCurrency(limit.limit_amount) }}
          </span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
// Vue imports are auto-imported in Nuxt
import type { Limit, LimitStatus, Category } from '../../types'
import { useApi } from '../../composables/useApi'

interface Props {
  limit: Limit
  status?: LimitStatus | null
  category?: Category | null
}

interface Emits {
  view: [limit: Limit]
  edit: [limit: Limit]
  delete: [limit: Limit]
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { formatCurrency, formatDisplayDate } = useApi()

// Safe status computed property
const safeStatus = computed(() => {
  if (!props.status) return null
  return {
    limit_amount: parseFloat(props.status.limit.limit_amount) || 0,
    used: props.status.totalSpent || 0,
    remaining: props.status.remainingAmount || 0,
    percentage: props.status.percentageUsed || 0,
    isExceeded: props.status.isExceeded || false,
    isNearLimit: props.status.isNearLimit || false
  }
})

const getProgressBarClass = (status: { isExceeded: boolean; isNearLimit: boolean; percentage: number }) => {
  if (status.isExceeded) return 'bg-error-500'
  if (status.isNearLimit) return 'bg-warning-500'
  if (status.percentage >= 60) return 'bg-yellow-500'
  return 'bg-primary-500'
}

const getStatusVariant = (limit: Limit) => {
  const now = new Date()
  const startDate = new Date(limit.start_date)
  const endDate = new Date(limit.end_date)

  if (now < startDate) return 'info'
  if (now > endDate) return 'default'
  return 'success'
}

const getStatusText = (limit: Limit) => {
  const now = new Date()
  const startDate = new Date(limit.start_date)
  const endDate = new Date(limit.end_date)

  if (now < startDate) return 'Não iniciado'
  if (now > endDate) return 'Finalizado'
  return 'Ativo'
}
</script>
