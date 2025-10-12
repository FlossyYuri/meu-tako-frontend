<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader title="Carteiras" subtitle="Gerencie suas carteiras e saldos">
      <template #actions>
        <Button to="/wallets/new" variant="primary" icon="lucide:plus">
          Nova Carteira
        </Button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <div v-if="walletsStore.isLoading" class="flex justify-center py-12">
      <LoadingSpinner text="Carregando carteiras..." />
    </div>

    <!-- Empty State -->
    <div v-else-if="walletsStore.wallets.length === 0" class="text-center py-12">
      <Icon name="lucide:wallet" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhuma carteira encontrada
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Crie sua primeira carteira para começar a gerenciar suas finanças
      </p>
      <Button to="/wallets/new" variant="primary" icon="lucide:plus">
        Criar Primeira Carteira
      </Button>
    </div>

    <!-- Wallets Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <WalletCard
        v-for="wallet in walletsStore.wallets"
        :key="wallet.wallet_id"
        :wallet="wallet"
        @select="onSelect"
        @edit="onEdit"
        @set-default="onSetDefault"
        @delete="onDelete"
      />
    </div>

    <!-- Total Balance Summary -->
    <Card v-if="walletsStore.wallets.length > 0" class="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">Saldo Total</h3>
            <p class="text-primary-100">Todas as carteiras</p>
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold">
              {{ formatCurrency(walletsStore.totalBalance) }}
            </p>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const walletsStore = useWalletsStore()
const { formatCurrency } = useApi()
const { success, error: showError } = useNotifications()

const onSelect = (wallet: any) => {
  walletsStore.setCurrentWallet(wallet)
  navigateTo(`/wallets/${wallet.wallet_id}`)
}

const onEdit = (wallet: any) => {
  navigateTo(`/wallets/${wallet.wallet_id}/edit`)
}

const onSetDefault = async (wallet: any) => {
  try {
    await walletsStore.setDefaultWallet(wallet.wallet_id)
    success('Carteira definida como padrão')
  } catch (error) {
    showError('Erro ao definir carteira padrão')
  }
}

const onDelete = async (wallet: any) => {
  if (confirm(`Tem certeza que deseja excluir a carteira "${wallet.wallet_name}"?`)) {
    try {
      await walletsStore.deleteWallet(wallet.wallet_id)
      success('Carteira excluída com sucesso')
    } catch (error) {
      showError('Erro ao excluir carteira')
    }
  }
}

// Load wallets on mount
onMounted(async () => {
  try {
    await walletsStore.fetchWallets()
  } catch (error) {
    showError('Erro ao carregar carteiras')
  }
})
</script>