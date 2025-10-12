<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Transações
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie suas receitas e despesas
        </p>
      </div>
      <div class="flex space-x-3">
        <Button
          to="/transactions/new?type=income"
          variant="success"
          icon="lucide:plus"
        >
          Receita
        </Button>
        <Button
          to="/transactions/new?type=expense"
          variant="error"
          icon="lucide:minus"
        >
          Despesa
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Date Range -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Período
            </label>
            <select
              v-model="filters.period"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos</option>
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
              <option value="year">Este ano</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Tipo
            </label>
            <select
              v-model="filters.type"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
              <option value="transfer">Transferências</option>
            </select>
          </div>

          <!-- Wallet Filter -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Carteira
            </label>
            <select
              v-model="filters.wallet_id"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todas</option>
              <option
                v-for="wallet in walletsStore.wallets"
                :key="wallet.wallet_id"
                :value="wallet.wallet_id"
              >
                {{ wallet.wallet_name }}
              </option>
            </select>
          </div>

          <!-- Search -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Buscar
            </label>
            <Input
              v-model="filters.search"
              type="search"
              placeholder="Descrição..."
              icon="lucide:search"
            />
          </div>
        </div>
      </div>
    </Card>

    <!-- Loading State -->
    <div v-if="transactionsStore.isLoading" class="flex justify-center py-12">
      <LoadingSpinner text="Carregando transações..." />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredTransactions.length === 0"
      class="text-center py-12"
    >
      <Icon
        name="lucide:credit-card"
        class="w-16 h-16 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhuma transação encontrada
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Comece adicionando sua primeira transação
      </p>
      <div class="flex justify-center space-x-3">
        <Button
          to="/transactions/new?type=income"
          variant="success"
          icon="lucide:plus"
        >
          Adicionar Receita
        </Button>
        <Button
          to="/transactions/new?type=expense"
          variant="error"
          icon="lucide:minus"
        >
          Adicionar Despesa
        </Button>
      </div>
    </div>

    <!-- Transactions List -->
    <div v-else class="space-y-4">
      <div
        v-for="transaction in paginatedTransactions"
        :key="transaction.transaction_id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              class="p-3 rounded-lg"
              :class="getTransactionIconClass(transaction.type)"
            >
              <Icon
                :name="getTransactionIcon(transaction.type)"
                class="w-5 h-5"
              />
            </div>

            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ transaction.description || 'Transação' }}
              </h3>
              <div
                class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <span>{{ formatDisplayDate(transaction.date) }}</span>
                <span>•</span>
                <span>{{ getWalletName(transaction.wallet_id) }}</span>
                <span v-if="transaction.category">•</span>
                <span
                  v-if="transaction.category"
                  >{{ transaction.category.name }}</span
                >
              </div>
            </div>
          </div>

          <div class="text-right">
            <p
              class="text-lg font-semibold"
              :class="getTransactionAmountClass(transaction.type)"
            >
              {{ getTransactionAmountPrefix(transaction.type)

              }}{{ formatCurrency(transaction.amount) }}
            </p>
            <div class="flex items-center space-x-2 mt-1">
              <Badge
                :variant="getTransactionBadgeVariant(transaction.type)"
                size="sm"
              >
                {{ getTransactionTypeLabel(transaction.type) }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Mostrando {{ startItem }} a {{ endItem }} de {{ totalItems }} transações
      </div>

      <div class="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage = 1"
        >
          Primeira
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Próxima
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >
          Última
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()
const { formatCurrency, formatDisplayDate } = useApi()

// State
const filters = reactive({
  period: 'all',
  type: '',
  wallet_id: '',
  search: ''
})

const currentPage = ref(1)
const itemsPerPage = 10

// Computed
const filteredTransactions = computed(() => {
  let filtered = transactionsStore.transactions

  // Apply filters
  if (filters.type) {
    filtered = filtered.filter(t => t.type === filters.type)
  }

  if (filters.wallet_id) {
    filtered = filtered.filter(t => t.wallet_id === filters.wallet_id)
  }

  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(t =>
      t.description?.toLowerCase().includes(search) ||
      t.category?.name.toLowerCase().includes(search)
    )
  }

  // Apply date filter
  if (filters.period !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date)

      switch (filters.period) {
        case 'today':
          return transactionDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return transactionDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1)
          return transactionDate >= monthAgo
        case 'year':
          const yearAgo = new Date(today.getFullYear(), 0, 1)
          return transactionDate >= yearAgo
        default:
          return true
      }
    })
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const totalItems = computed(() => filteredTransactions.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))
const startItem = computed(() => (currentPage.value - 1) * itemsPerPage + 1)
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, totalItems.value))

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTransactions.value.slice(start, end)
})

// Methods
const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'income':
      return 'lucide:arrow-up'
    case 'expense':
      return 'lucide:arrow-down'
    case 'transfer':
      return 'lucide:arrow-right-left'
    default:
      return 'lucide:credit-card'
  }
}

const getTransactionIconClass = (type: string) => {
  switch (type) {
    case 'income':
      return 'bg-success-100 text-success-600'
    case 'expense':
      return 'bg-error-100 text-error-600'
    case 'transfer':
      return 'bg-primary-100 text-primary-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getTransactionAmountClass = (type: string) => {
  switch (type) {
    case 'income':
      return 'text-success-600'
    case 'expense':
      return 'text-error-600'
    case 'transfer':
      return 'text-primary-600'
    default:
      return 'text-gray-900 dark:text-white'
  }
}

const getTransactionAmountPrefix = (type: string) => {
  switch (type) {
    case 'income':
      return '+'
    case 'expense':
      return '-'
    case 'transfer':
      return ''
    default:
      return ''
  }
}

const getTransactionBadgeVariant = (type: string) => {
  switch (type) {
    case 'income':
      return 'success'
    case 'expense':
      return 'error'
    case 'transfer':
      return 'info'
    default:
      return 'default'
  }
}

const getTransactionTypeLabel = (type: string) => {
  switch (type) {
    case 'income':
      return 'Receita'
    case 'expense':
      return 'Despesa'
    case 'transfer':
      return 'Transferência'
    default:
      return 'Transação'
  }
}

const getWalletName = (walletId: string) => {
  const wallet = walletsStore.wallets.find(w => w.wallet_id === walletId)
  return wallet?.wallet_name || 'Carteira não encontrada'
}

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      walletsStore.fetchWallets(),
      transactionsStore.fetchTransactions()
    ])
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
})

// Reset page when filters change
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })
</script>
