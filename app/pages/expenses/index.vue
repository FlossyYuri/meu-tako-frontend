<template>
  <div class="space-y-6">
    <PageHeader title="Despesas" subtitle="Gerencie suas despesas">
      <template #actions>
        <Button to="/expenses/new" variant="error" icon="lucide:minus"
          >Nova Despesa</Button
        >
      </template>
    </PageHeader>

    <!-- Filtros -->
    <Card>
      <div class="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="label">Período</label>
          <select v-model="filters.period" class="input">
            <option value="all">Todos</option>
            <option value="today">Hoje</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mês</option>
            <option value="year">Este ano</option>
          </select>
        </div>

        <div>
          <label class="label">Carteira</label>
          <select v-model="filters.wallet_id" class="input">
            <option value="">Todas</option>
            <option
              v-for="w in walletsStore.wallets"
              :key="w.wallet_id"
              :value="w.wallet_id"
            >
              {{ w.wallet_name }}
            </option>
          </select>
        </div>

        <div>
          <label class="label">Categoria</label>
          <select v-model="filters.category_id" class="input">
            <option value="">Todas</option>
            <option
              v-for="c in categoriesStore.expenseCategories"
              :key="c.category_id"
              :value="c.category_id"
            >
              {{ c.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="label">Status</label>
          <select v-model="filters.paid" class="input">
            <option value="">Todas</option>
            <option value="true">Pagas</option>
            <option value="false">Pendentes</option>
          </select>
        </div>

        <div>
          <label class="label">Buscar</label>
          <Input
            v-model="filters.search"
            type="search"
            placeholder="Descrição..."
            icon="lucide:search"
          />
        </div>
      </div>
    </Card>

    <!-- Loading -->
    <div v-if="transactionsStore.isLoading" class="py-12 flex justify-center">
      <LoadingSpinner text="Carregando despesas..." />
    </div>

    <!-- Empty -->
    <div v-else-if="pagedExpenses.length === 0" class="text-center py-12">
      <Icon
        name="lucide:credit-card"
        class="w-16 h-16 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhuma despesa encontrada
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Comece adicionando sua primeira despesa
      </p>
      <Button to="/expenses/new" variant="error" icon="lucide:minus"
        >Adicionar Despesa</Button
      >
    </div>

    <!-- Lista -->
    <div v-else class="space-y-3">
      <div
        v-for="e in pagedExpenses"
        :key="e.expense_id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-error-100 text-error-600">
              <Icon name="lucide:arrow-down" class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ e.description || 'Despesa' }}
              </p>
              <div
                class="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-2"
              >
                <span>{{ formatDisplayDate(e.date) }}</span>
                <span v-if="getCategoryName(e.expense_category_id)"
                  >• {{ getCategoryName(e.expense_category_id) }}</span
                >
                <span>• {{ getWalletName(e.wallet_id) }}</span>
              </div>
            </div>
          </div>

          <div class="text-right">
            <p class="font-semibold text-error-600">
              -{{ formatCurrency(e.amount) }}
            </p>
            <Badge
              :variant="e.paid ? 'success' : 'warning'"
              size="sm"
              class="mt-1"
            >
              {{ e.paid ? 'Pago' : 'Pendente' }}
            </Badge>
          </div>
        </div>

        <!-- Desktop: Show buttons directly -->
        <div class="mt-3 hidden md:flex items-center justify-end gap-2">
          <Button
            :to="`/expenses/${e.expense_id}`"
            variant="outline"
            size="sm"
            icon="lucide:eye"
            >Ver</Button
          >
          <Button
            v-if="!e.paid"
            variant="success"
            size="sm"
            icon="lucide:check"
            @click="onMarkPaid(e.expense_id)"
          >
            Marcar como pago
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon="lucide:edit"
            :to="`/expenses/${e.expense_id}`"
          >
            Editar
          </Button>
          <Button
            variant="error"
            size="sm"
            icon="lucide:trash-2"
            @click="onDelete(e.expense_id)"
          >
            Excluir
          </Button>
        </div>

        <!-- Mobile: Show dropdown -->
        <div class="mt-3 md:hidden flex items-center justify-end">
          <ActionDropdown>
            <ActionItem
              label="Ver"
              icon="lucide:eye"
              @click="$router.push(`/expenses/${e.expense_id}`)"
            />
            <ActionItem
              v-if="!e.paid"
              label="Marcar como pago"
              icon="lucide:check"
              variant="success"
              @click="onMarkPaid(e.expense_id)"
            />
            <ActionItem
              label="Editar"
              icon="lucide:edit"
              @click="$router.push(`/expenses/${e.expense_id}`)"
            />
            <ActionItem
              label="Excluir"
              icon="lucide:trash-2"
              variant="danger"
              @click="onDelete(e.expense_id)"
            />
          </ActionDropdown>
        </div>
      </div>
    </div>

    <!-- Paginação -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Mostrando {{ startItem }} a {{ endItem }} de {{ totalItems }} despesas
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="page === 1"
          @click="page = 1"
          >Primeira</Button
        >
        <Button
          variant="outline"
          size="sm"
          :disabled="page === 1"
          @click="page--"
          >Anterior</Button
        >
        <Button
          variant="outline"
          size="sm"
          :disabled="page === totalPages"
          @click="page++"
          >Próxima</Button
        >
        <Button
          variant="outline"
          size="sm"
          :disabled="page === totalPages"
          @click="page = totalPages"
          >Última</Button
        >
      </div>
    </div>

    <div
      v-if="transactionsStore.error"
      class="text-center text-error-600 dark:text-error-400"
    >
      {{ transactionsStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const transactionsStore = useTransactionsStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const { formatCurrency, formatDisplayDate } = useApi()
const { success, error: showError } = useNotifications()

const filters = reactive({
  period: 'all',
  wallet_id: '',
  category_id: '',
  paid: '',
  search: ''
})

const page = ref(1)
const perPage = 10

const filtered = computed(() => {
  let list = transactionsStore.expenses

  if (filters.wallet_id) list = list.filter(e => e.wallet_id === filters.wallet_id)
  if (filters.category_id) list = list.filter(e => e.expense_category_id === filters.category_id)
  if (filters.paid !== '') list = list.filter(e => String(e.paid) === filters.paid)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(e => (e.description || '').toLowerCase().includes(q))
  }

  if (filters.period !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    list = list.filter(e => {
      const dt = new Date(e.date)
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

const totalItems = computed(() => filtered.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage))
const startItem = computed(() => (page.value - 1) * perPage + 1)
const endItem = computed(() => Math.min(page.value * perPage, totalItems.value))
const pagedExpenses = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const getWalletName = (id: string) => walletsStore.wallets.find(w => w.wallet_id === id)?.wallet_name || 'Carteira'
const getCategoryName = (id: string) => categoriesStore.expenseCategories.find(c => c.category_id === id)?.name || ''

const onMarkPaid = async (expenseId: string) => {
  try {
    await transactionsStore.markExpenseAsPaid(expenseId)
    success('Despesa marcada como paga')
  } catch (err: any) {
    showError('Erro ao marcar como paga', err?.message)
  }
}

const onDelete = async (expenseId: string) => {
  if (!confirm('Tem certeza que deseja excluir esta despesa?')) return
  try {
    await transactionsStore.deleteExpense(expenseId)
    success('Despesa excluída com sucesso')
  } catch (err: any) {
    showError('Erro ao excluir despesa', err?.message)
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      walletsStore.fetchWallets(),
      categoriesStore.fetchExpenseCategories(true),
      transactionsStore.fetchExpenses()
    ])
  } catch (err) {
    // handled via store error + UI
  }
})

watch(filters, () => { page.value = 1 }, { deep: true })
</script>
