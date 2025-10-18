<template>
  <component :is="wrapperTag" :class="containerClasses" @click="handleClick">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2.5">
        <div class="p-1.5 rounded-lg" :class="iconBgClass">
          <Icon :name="iconName" class="w-4 h-4" />
        </div>
        <div>
          <p class="font-medium text-gray-900 dark:text-white">
            {{ titleText }}
          </p>
          <div
            class="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <span>{{ formattedDate }}</span>
            <span v-if="walletLabel">•</span>
            <span v-if="walletLabel">{{ walletLabel }}</span>
            <template v-if="categoryLabel">
              <span>•</span>
              <span>{{ categoryLabel }}</span>
            </template>
            <template v-if="statusLabel">
              <span>•</span>
              <Badge
                :variant="statusVariant"
                size="sm"
                >{{ statusLabel }}</Badge
              >
            </template>
          </div>
        </div>
      </div>

      <div class="text-right">
        <p class="font-semibold" :class="amountClass">
          {{ amountPrefix }}{{ displayAmount }}
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

const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const { formatCurrency, formatDisplayDate, formatDateTime } = useApi()

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
    case 'income': return 'lucide:arrow-up'
    case 'expense': return 'lucide:arrow-down'
    case 'transfer': return 'lucide:arrow-right-left'
    default: return 'lucide:credit-card'
  }
})

const iconBgClass = computed(() => {
  switch (props.transaction.type) {
    case 'income': return 'bg-success-100 text-success-600'
    case 'expense': return 'bg-error-100 text-error-600'
    case 'transfer': return 'bg-primary-100 text-primary-600'
    default: return 'bg-gray-100 text-gray-600'
  }
})

const amountClass = computed(() => {
  switch (props.transaction.type) {
    case 'income': return 'text-success-600'
    case 'expense': return 'text-error-600'
    case 'transfer': return 'text-primary-600'
    default: return 'text-gray-900 dark:text-white'
  }
})

const rawAmount = computed(() => {
  // Try to get amount from nested structure first
  if (props.transaction.expense?.amount) {
    const amount = parseFloat(props.transaction.expense.amount);
    return props.transaction.type === 'expense' ? -Math.abs(amount) : amount;
  }
  if (props.transaction.income?.amount) {
    const amount = parseFloat(props.transaction.income.amount);
    return props.transaction.type === 'income' ? Math.abs(amount) : amount;
  }
  // Fallback to main amount
  const tAmount = parseFloat(props.transaction.amount.toString());
  return isNaN(tAmount) ? 0 : tAmount;
})

const displayAmount = computed(() => formatCurrency(Math.abs(rawAmount.value)))

const amountPrefix = computed(() => {
  switch (props.transaction.type) {
    case 'income': return '+'
    case 'expense': return '-'
    default: return ''
  }
})

const typeLabel = computed(() => {
  switch (props.transaction.type) {
    case 'income': return 'Receita'
    case 'expense': return 'Despesa'
    case 'transfer': return 'Transferência'
    default: return 'Transação'
  }
})

const badgeVariant = computed(() => {
  switch (props.transaction.type) {
    case 'income': return 'success'
    case 'expense': return 'error'
    case 'transfer': return 'info'
    default: return 'default'
  }
})

const titleText = computed(() => {
  return (
    props.transaction.expense?.description ||
    props.transaction.income?.description ||
    typeLabel.value
  )
})

const resolvedDate = computed<string>(() => {
  // Try nested dates first
  if (props.transaction.expense?.date) {
    const f = formatDisplayDate(props.transaction.expense.date);
    if (f !== 'Data inválida') return f;
  }

  if (props.transaction.income?.date) {
    const f = formatDisplayDate(props.transaction.income.date);
    if (f !== 'Data inválida') return f;
  }

  // Fallback to main date
  const tFormatted = formatDisplayDate(props.transaction.date);
  if (tFormatted !== 'Data inválida' && tFormatted) return tFormatted;

  // Final fallback to created_at
  const created = props.transaction.created_at;
  if (created) {
    const f = formatDisplayDate(created);
    if (f !== 'Data inválida') return f;
  }
  return '—';
})

const formattedDate = computed(() => resolvedDate.value)

const walletLabel = computed(() => {
  if (!props.showWallet) return ''
  if (props.transaction.wallet?.wallet_name) return props.transaction.wallet.wallet_name
  if (props.walletName) return props.walletName
  const w = walletsStore.wallets.find(w => w.wallet_id === props.transaction.wallet_id)
  return w?.wallet_name || ''
})

const categoryLabel = computed(() => {
  if (!props.showCategory) return ''

  // Try to get category from nested structure
  const eCatId = props.transaction.expense?.expense_category_id;
  if (eCatId) return categoriesStore.getExpenseCategoryById(eCatId)?.name || '';

  const iCatId = props.transaction.income?.income_category_id;
  if (iCatId) return categoriesStore.getIncomeCategoryById(iCatId)?.name || '';

  return '';
})

const statusLabel = computed(() => {
  if (props.transaction.expense && typeof props.transaction.expense.paid === 'boolean') {
    return props.transaction.expense.paid ? 'Pago' : 'Pendente';
  }
  if (props.transaction.income && typeof props.transaction.income.received === 'boolean') {
    return props.transaction.income.received ? 'Recebido' : 'Pendente';
  }
  return '';
})

const statusVariant = computed(() => {
  if (statusLabel.value === 'Pago' || statusLabel.value === 'Recebido') return 'success'
  if (statusLabel.value === 'Pendente') return 'warning'
  return 'default'
})

const handleClick = () => {
  if (props.clickable) emit('select', props.transaction)
}
</script>
