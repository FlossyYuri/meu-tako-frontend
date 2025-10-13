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
  // Transação pode vir com amount string, e nested amount também
  const tAmount = Number((props.transaction as any).amount)
  if (!isNaN(tAmount)) return tAmount
  // fallback a nested
  const eAmount = Number((props.transaction as any).expense?.amount)
  if (!isNaN(eAmount)) return props.transaction.type === 'expense' ? -Math.abs(eAmount) : eAmount
  const iAmount = Number((props.transaction as any).income?.amount)
  if (!isNaN(iAmount)) return props.transaction.type === 'income' ? Math.abs(iAmount) : iAmount
  return 0
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
    (props.transaction as any).description ||
    (props.transaction as any).expense?.description ||
    (props.transaction as any).income?.description ||
    typeLabel.value
  )
})

const resolvedDate = computed<string>(() => {
  // Preferir a data da própria transação; se inválida, usar nested
  const tDate = (props.transaction as any).date
  const tFormatted = formatDisplayDate(tDate)
  if (tFormatted !== 'Data inválida' && tFormatted) return tFormatted

  const eDate = (props.transaction as any).expense?.date
  if (eDate) {
    const f = formatDisplayDate(eDate)
    if (f !== 'Data inválida') return f
  }

  const iDate = (props.transaction as any).income?.date
  if (iDate) {
    const f = formatDisplayDate(iDate)
    if (f !== 'Data inválida') return f
  }

  // Fallback para created_at se houver
  const created = (props.transaction as any).created_at
  if (created) {
    const f = formatDisplayDate(created)
    if (f !== 'Data inválida') return f
  }
  return '—'
})

const formattedDate = computed(() => resolvedDate.value)

const walletLabel = computed(() => {
  if (!props.showWallet) return ''
  const inlineWallet = (props.transaction as any).wallet?.wallet_name
  if (inlineWallet) return inlineWallet
  if (props.walletName) return props.walletName
  const w = walletsStore.wallets.find(w => w.wallet_id === props.transaction.wallet_id)
  return w?.wallet_name || ''
})

const categoryLabel = computed(() => {
  if (!props.showCategory) return ''
  const cat = (props.transaction as any).category
  if (cat?.name) return cat.name
  // tentar deduzir via stores
  const eCatId = (props.transaction as any).expense?.expense_category_id
  if (eCatId) return categoriesStore.getExpenseCategoryById(eCatId)?.name || ''
  const iCatId = (props.transaction as any).income?.income_category_id
  if (iCatId) return categoriesStore.getIncomeCategoryById(iCatId)?.name || ''
  return ''
})

const statusLabel = computed(() => {
  const e = (props.transaction as any).expense
  if (e && typeof e.paid === 'boolean') return e.paid ? 'Pago' : 'Pendente'
  const i = (props.transaction as any).income
  if (i && typeof i.received === 'boolean') return i.received ? 'Recebido' : 'Pendente'
  return ''
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
