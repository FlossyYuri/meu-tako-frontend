<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <PageHeader title="Perfil" subtitle="Gerencie suas informações pessoais">
      <template #actions>
        <Button to="/settings" variant="outline" icon="lucide:settings">
          Configurações
        </Button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Info -->
      <div class="lg:col-span-1">
        <Card>
          <div class="p-6 text-center">
            <div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {{ authStore.userInitials }}
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ authStore.user?.name }}
            </h2>
            <p class="text-gray-500 dark:text-gray-400">
              {{ authStore.user?.email }}
            </p>
            <p v-if="authStore.user?.whatsapp" class="text-gray-500 dark:text-gray-400 mt-1">
              {{ authStore.user.whatsapp }}
            </p>
          </div>
        </Card>
      </div>

      <!-- Account Stats -->
      <div class="lg:col-span-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card class="p-6">
            <div class="flex items-center">
              <div class="p-2 bg-primary-100 rounded-lg">
                <Icon name="lucide:wallet" class="w-6 h-6 text-primary-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Carteiras
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ walletsStore.wallets.length }}
                </p>
              </div>
            </div>
          </Card>

          <Card class="p-6">
            <div class="flex items-center">
              <div class="p-2 bg-success-100 rounded-lg">
                <Icon name="lucide:target" class="w-6 h-6 text-success-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Metas Ativas
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  3
                </p>
              </div>
            </div>
          </Card>

          <Card class="p-6">
            <div class="flex items-center">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <Icon name="lucide:credit-card" class="w-6 h-6 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transações
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ transactionsStore.transactions.length }}
                </p>
              </div>
            </div>
          </Card>

          <Card class="p-6">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg">
                <Icon name="lucide:calendar" class="w-6 h-6 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Membro desde
                </p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ formatDisplayDate(authStore.user?.created_at || '') }}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <Card>
      <template #header>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Atividade Recente
        </h2>
      </template>

      <div v-if="transactionsStore.isLoading" class="p-6">
        <LoadingSpinner text="Carregando atividade..." />
      </div>

      <div v-else-if="transactionsStore.recentTransactions.length === 0" class="p-6 text-center">
        <Icon name="lucide:activity" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">
          Nenhuma atividade recente
        </p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <TransactionItem
          v-for="tx in transactionsStore.recentTransactions.slice(0, 5)"
          :key="tx.transaction_id"
          :transaction="tx"
          :wallet-name="getWalletName(tx.wallet_id)"
          :show-wallet="true"
          :show-category="!!tx.category"
          variant="list"
        />
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()
const { formatDisplayDate } = useApi()

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
    console.error('Erro ao carregar dados do perfil:', error)
  }
})
</script>