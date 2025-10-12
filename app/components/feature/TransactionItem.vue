<template>
  <component
    :is="wrapperTag"
    :class="containerClasses"
    @click="handleClick"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="p-2 rounded-lg" :class="iconBgClass">
          <Icon :name="iconName" class="w-5 h-5" />
        </div>
        <div>
          <p class="font-medium text-gray-900 dark:text-white">
            {{ transaction.description || 'Transação' }}
          </p>
          <div
            class="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <span>{{ formatDisplayDate(transaction.date) }}</span>
            <span v-if="showWallet" class="hidden sm:inline">•</span>
            <span v-if="showWallet" class="hidden sm:inline">
              {{ walletNameComputed }}
            </span>
            <template v-if="showCategory && transaction.category">
              <span>•</span>
              <span>{{ transaction.category.name }}</span>
            </template>
          </div>
        </div>
      </div>

      <div class="text-right">
        <p class="font-semibold" :class="amountClass">
          {{ amountPrefix }}{{ formatCurrency(transaction.amount) }}
        </p>
        <Badge
          v-if="!compact"
          :variant="badgeVariant"
          size="sm"
          class="mt-1 inline-block"
        >
          {{ typeLabel }}
        </Badge>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { Transaction } from '~/types';

interface Props {
  transaction: Transaction
  showCategory?: boolean
  showWallet?: boolean
  walletName?: string
  compact?: boolean
  clickable?: boolean
  variant?: 'list' | 'card'
}

const props = withDefaults(defineProps<Props>(), {
  showCategory: true,
  showWallet: false,
  compact: false,
  clickable: false,
  variant: 'list',
})

const emit = defineEmits<{
  select: [tx: Transaction]
}>()

const { formatCurrency, formatDisplayDate } = useApi()

const wrapperTag = computed(() => props.variant === 'card' ? 'div' : 'div')

const containerClasses = computed(() => {
  const base = 'transition-colors duration-200'
  const padding = props.variant === 'card' ? 'p-4' : 'p-4'
  const surface = props.variant === 'card'
    ? 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md'
    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
  const cursor = props.clickable ? 'cursor-pointer' : ''
  return [base, padding, surface, cursor].join(' ')
})

const iconName = computed(() => {
  switch (props.transaction.type) {
    case 'income':
      return 'lucide:arrow-up'
    case 'expense':
      return 'lucide:arrow-down'
    case 'transfer':
      return 'lucide:arrow-right-left'
    default:
      return 'lucide:credit-card'
  }
})

const iconBgClass = computed(() => {
  switch (props.transaction.type) {
    case 'income':
      return 'bg-success-100 text-success-600'
    case 'expense':
      return 'bg-error-100 text-error-600'
    case 'transfer':
      return 'bg-primary-100 text-primary-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
})

const amountClass = computed(() => {
  switch (props.transaction.type) {
    case 'income':
      return 'text-success-600'
    case 'expense':
      return 'text-error-600'
    case 'transfer':
      return 'text-primary-600'
    default:
      return 'text-gray-900 dark:text-white'
  }
})

const amountPrefix = computed(() => {
  switch (props.transaction.type) {
    case 'income':
      return '+'
    case 'expense':
      return '-'
    default:
      return ''
  }
})

const typeLabel = computed(() => {
  switch (props.transaction.type) {
    case 'income':
      return 'Receita'
    case 'expense':
      return 'Despesa'
    case 'transfer':
      return 'Transferência'
    default:
      return 'Transação'
  }
})

const badgeVariant = computed(() => {
  switch (props.transaction.type) {
    case 'income':
      return 'success'
    case 'expense':
      return 'error'
    case 'transfer':
      return 'info'
    default:
      return 'default'
  }
})

const walletNameComputed = computed(() => props.walletName || 'Carteira')

const handleClick = () => {
  if (props.clickable) emit('select', props.transaction)
}
</script>