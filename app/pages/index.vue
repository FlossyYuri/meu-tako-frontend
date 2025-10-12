<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div
      class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">
            Olá, {{ authStore.user?.name?.split(' ')[0] }}! 👋
          </h1>
          <p class="text-primary-100 mt-1">
            Aqui está um resumo das suas finanças
          </p>
        </div>
        <div class="hidden sm:block">
          <Icon name="lucide:trending-up" class="w-12 h-12 text-primary-200" />
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-2 bg-success-100 rounded-lg">
            <Icon name="lucide:arrow-up" class="w-6 h-6 text-success-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Receitas
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(transactionsStore.monthlyIncome) }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-2 bg-error-100 rounded-lg">
            <Icon name="lucide:arrow-down" class="w-6 h-6 text-error-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Despesas
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(transactionsStore.monthlyExpense) }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <Icon name="lucide:wallet" class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Saldo Total
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(walletsStore.totalBalance) }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <Icon name="lucide:target" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Metas Ativas
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ activeGoalsCount }}
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Transactions -->
      <div class="lg:col-span-2">
        <Card>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Transações Recentes
              </h2>
              <NuxtLink
                to="/transactions"
                class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Ver todas
              </NuxtLink>
            </div>
          </template>

          <div v-if="transactionsStore.isLoading" class="p-6">
            <LoadingSpinner text="Carregando transações..." />
          </div>

          <div
            v-else-if="transactionsStore.recentTransactions.length === 0"
            class="p-6 text-center"
          >
            <Icon
              name="lucide:credit-card"
              class="w-12 h-12 text-gray-400 mx-auto mb-4"
            />
            <p class="text-gray-500 dark:text-gray-400">
              Nenhuma transação encontrada
            </p>
            <Button to="/transactions/new" variant="primary" class="mt-4">
              Adicionar transação
            </Button>
          </div>

          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="transaction in transactionsStore.recentTransactions.slice(0, 5)"
              :key="transaction.transaction_id"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    class="p-2 rounded-lg"
                    :class="getTransactionIconClass(transaction.type)"
                  >
                    <Icon
                      :name="getTransactionIcon(transaction.type)"
                      class="w-5 h-5"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ transaction.description || 'Transação' }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatDisplayDate(transaction.date) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    class="font-semibold"
                    :class="getTransactionAmountClass(transaction.type)"
                  >
                    {{ getTransactionAmountPrefix(transaction.type)

                    }}{{ formatCurrency(transaction.amount) }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ transaction.category?.name || 'Sem categoria' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Quick Actions & Wallets -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <Card>
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ações Rápidas
            </h2>
          </template>

          <div class="space-y-3">
            <Button
              to="/transactions/new?type=income"
              variant="success"
              full-width
              icon="lucide:plus"
            >
              Adicionar Receita
            </Button>

            <Button
              to="/transactions/new?type=expense"
              variant="error"
              full-width
              icon="lucide:minus"
            >
              Adicionar Despesa
            </Button>

            <Button
              to="/transactions/transfer"
              variant="outline"
              full-width
              icon="lucide:arrow-right-left"
            >
              Transferir
            </Button>

            <Button
              to="/goals/new"
              variant="outline"
              full-width
              icon="lucide:target"
            >
              Nova Meta
            </Button>
          </div>
        </Card>

        <!-- Wallets Summary -->
        <Card>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Carteiras
              </h2>
              <NuxtLink
                to="/wallets"
                class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Gerenciar
              </NuxtLink>
            </div>
          </template>

          <div v-if="walletsStore.isLoading" class="p-4">
            <LoadingSpinner size="sm" />
          </div>

          <div
            v-else-if="walletsStore.wallets.length === 0"
            class="p-4 text-center"
          >
            <Icon
              name="lucide:wallet"
              class="w-8 h-8 text-gray-400 mx-auto mb-2"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma carteira
            </p>
            <Button to="/wallets/new" variant="primary" size="sm" class="mt-2">
              Criar carteira
            </Button>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="wallet in walletsStore.wallets.slice(0, 3)"
              :key="wallet.wallet_id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-primary-500 rounded-full" />
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ wallet.wallet_name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ wallet.is_default ? 'Padrão' : '' }}
                  </p>
                </div>
              </div>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ formatCurrency(wallet.balance) }}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()
const { formatCurrency, formatDisplayDate } = useApi()

// State
const activeGoalsCount = ref(0)

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

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      walletsStore.fetchWallets(),
      transactionsStore.fetchTransactions(),
      transactionsStore.fetchIncomes(),
      transactionsStore.fetchExpenses()
    ])
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
  }
})
</script>
