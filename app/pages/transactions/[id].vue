<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/transactions"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para transações
      </NuxtLink>
    </div>

    <Card v-if="tx">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg" :class="iconBgClass">
              <Icon :name="iconName" class="w-5 h-5" />
            </div>
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ title }}
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatDateTime(tx.date) }}
              </p>
            </div>
          </div>
          <Badge :variant="badgeVariant">
            {{ typeLabel }}
          </Badge>
        </div>
      </template>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">Valor</p>
            <p class="text-2xl font-bold" :class="amountClass">
              {{ amountPrefix }}{{ formatCurrency(tx.amount) }}
            </p>
          </div>

          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">Carteira</p>
            <p class="text-lg font-medium text-gray-900 dark:text-white">
              {{ walletName }}
            </p>
          </div>
        </div>

        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Categoria</p>
          <p class="text-lg font-medium text-gray-900 dark:text-white">
            {{ tx.category?.name || '—' }}
          </p>
        </div>

        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Descrição</p>
          <p class="text-gray-900 dark:text-white">
            {{ tx.description || '—' }}
          </p>
        </div>
      </div>
    </Card>

    <div v-else class="py-12">
      <LoadingSpinner center text="Carregando transação..." />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const transactionsStore = useTransactionsStore()
const walletsStore = useWalletsStore()
const { formatCurrency, formatDateTime } = useApi()

const tx = ref<import('~/types').Transaction | null>(null)

const load = async () => {
  const data = await transactionsStore.fetchTransactionById(id)
  tx.value = data
}

const walletName = computed(() => {
  if (!tx.value) return ''
  const w = walletsStore.wallets.find(w => w.wallet_id === tx.value!.wallet_id)
  return w?.wallet_name || 'Carteira'
})

const iconName = computed(() => {
  if (!tx.value) return 'lucide:credit-card'
  return tx.value.type === 'income'
    ? 'lucide:arrow-up'
    : tx.value.type === 'expense'
      ? 'lucide:arrow-down'
      : 'lucide:arrow-right-left'
})

const iconBgClass = computed(() => {
  if (!tx.value) return 'bg-gray-100 text-gray-600'
  switch (tx.value.type) {
    case 'income': return 'bg-success-100 text-success-600'
    case 'expense': return 'bg-error-100 text-error-600'
    case 'transfer': return 'bg-primary-100 text-primary-600'
    default: return 'bg-gray-100 text-gray-600'
  }
})

const amountClass = computed(() => {
  if (!tx.value) return 'text-gray-900 dark:text-white'
  switch (tx.value.type) {
    case 'income': return 'text-success-600'
    case 'expense': return 'text-error-600'
    case 'transfer': return 'text-primary-600'
    default: return 'text-gray-900 dark:text-white'
  }
})

const amountPrefix = computed(() => {
  if (!tx.value) return ''
  return tx.value.type === 'income' ? '+' : tx.value.type === 'expense' ? '-' : ''
})

const typeLabel = computed(() => {
  if (!tx.value) return 'Transação'
  return tx.value.type === 'income'
    ? 'Receita'
    : tx.value.type === 'expense'
      ? 'Despesa'
      : 'Transferência'
})

const title = computed(() => tx.value?.description || 'Transação')

onMounted(async () => {
  try {
    if (!walletsStore.wallets.length) await walletsStore.fetchWallets()
    await load()
  } catch (err) {
    console.error('Erro ao carregar transação', err)
  }
})
</script>