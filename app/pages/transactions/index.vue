<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader title="Transações" subtitle="Gerencie suas receitas, despesas e transferências">
      <template #actions>
        <Button to="/transactions/transfer" variant="outline" icon="lucide:arrow-right-left">
          Transferir
        </Button>
      </template>
    </PageHeader>

    <!-- Filters -->
    <TransactionFilters v-model="filters" />

    <!-- Loading State -->
    <div v-if="transactionsStore.isLoading" class="flex justify-center py-12">
      <LoadingSpinner text="Carregando transações..." />
    </div>

    <!-- Transactions List -->
    <TransactionList
      v-else
      :transactions="paginatedTransactions"
      :show-wallet="true"
      :show-category="true"
      variant="card"
      :clickable="true"
    />

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Mostrando {{ startItem }} a {{ endItem }} de {{ totalItems }} transações
      </div>

      <div class="flex space-x-2">
        <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="currentPage = 1">
          Primeira
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="currentPage--">
          Anterior
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage === totalPages" @click="currentPage++">
          Próxima
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage === totalPages" @click="currentPage = totalPages">
          Última
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TransactionFilters from '~/components/feature/TransactionFilters.vue'
import TransactionList from '~/components/feature/TransactionList.vue'

definePageMeta({
  middleware: 'auth'
})

const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()

// State
const filters = reactive({
  period: 'all',
  type: '',
  wallet_id: '',
  search: ''
})

const currentPage = ref(1)
const itemsPerPage = 10

// Computed base (reaproveita store.filteredTransactions como base e aplica filtros extras de período/consulta)
const filteredTransactions = computed(() => {
  let list = [...transactionsStore.transactions]

  // filtros básicos
  if (filters.type) list = list.filter(t => t.type === filters.type)
  if (filters.wallet_id) list = list.filter(t => t.wallet_id === filters.wallet_id)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(t =>
      (t.description || '').toLowerCase().includes(q) ||
      (t.category?.name || '').toLowerCase().includes(q)
    )
  }

  // filtro de período
  if (filters.period !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    list = list.filter(t => {
      const dt = new Date(t.date)
      switch (filters.period) {
        case 'today': return dt >= today
        case 'week': return dt >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        case 'month': return dt >= new Date(today.getFullYear(), today.getMonth(), 1)
        case 'year': return dt >= new Date(today.getFullYear(), 0, 1)
        default: return true
      }
    })
  }

  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const totalItems = computed(() => filteredTransactions.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))
const startItem = computed(() => (currentPage.value - 1) * itemsPerPage + 1)
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, totalItems.value))
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTransactions.value.slice(start, start + itemsPerPage)
})

// Init
onMounted(async () => {
  try {
    await Promise.all([
      walletsStore.fetchWallets(),
      transactionsStore.fetchTransactions()
    ])
  } catch (error) {
    // Erros já tratados na store/UI
  }
})

// Reset page when filters change
watch(filters, () => { currentPage.value = 1 }, { deep: true })
</script>