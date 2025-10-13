<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader title="Carteiras" subtitle="Gerencie suas carteiras e saldos">
      <template #actions>
        <Button @click="openCreateModal" variant="primary" icon="lucide:plus">
          Nova Carteira
        </Button>
      </template>
    </PageHeader>

    <!-- Loading State with Skeletons -->
    <div
      v-if="walletsStore.isLoading"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <Card v-for="i in 6" :key="i" class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <Skeleton width="2.5rem" height="2.5rem" rounded="lg" />
            <div>
              <Skeleton width="10rem" height="1rem" className="mb-2" />
              <Skeleton width="6rem" height="0.75rem" />
            </div>
          </div>
          <Skeleton width="5rem" height="1.75rem" rounded="full" />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Skeleton width="6rem" height="0.875rem" />
            <Skeleton width="8rem" height="1.5rem" />
          </div>
          <div class="flex items-center justify-between">
            <Skeleton width="7rem" height="0.875rem" />
            <Skeleton width="5rem" height="0.875rem" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="walletsStore.wallets.length === 0"
      class="text-center py-12"
    >
      <Icon name="lucide:wallet" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhuma carteira encontrada
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Crie sua primeira carteira para começar a gerenciar suas finanças
      </p>
      <Button @click="openCreateModal" variant="primary" icon="lucide:plus">
        Criar Primeira Carteira
      </Button>
    </div>

    <!-- Wallets Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <WalletCard
        v-for="wallet in walletsStore.wallets"
        :key="wallet.wallet_id"
        :wallet="wallet"
        @select="onSelect"
        @view="onView"
        @set-default="onSetDefault"
        @delete="onDelete"
      />
    </div>

    <!-- Total Balance Summary -->
    <Card
      v-if="walletsStore.wallets.length > 0"
      class="bg-gradient-to-r from-primary-600 to-primary-700 text-white"
    >
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

    <div
      v-if="walletsStore.error"
      class="text-center text-error-600 dark:text-error-400"
    >
      {{ walletsStore.error }}
    </div>

    <!-- Create Wallet Modal -->
    <WalletCreateModal
      v-model:is-open="showCreateModal"
      :loading="walletsStore.isLoading"
      @submit="onCreateWallet"
      @close="closeCreateModal"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const walletsStore = useWalletsStore()
const { formatCurrency } = useApi()
const { success, error: showError } = useNotifications()

// Modal state
const showCreateModal = ref(false)

const onSelect = (wallet: any) => {
  walletsStore.setCurrentWallet(wallet)
  navigateTo(`/wallets/${wallet.wallet_id}`)
}

const onView = (wallet: any) => {
  navigateTo(`/wallets/${wallet.wallet_id}`)
}

// Modal functions
const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const onCreateWallet = async (name: string) => {
  try {
    walletsStore.clearError()
    await walletsStore.createWallet({ wallet_name: name })
    success('Carteira criada com sucesso!')
    closeCreateModal()
  } catch (err: any) {
    showError('Erro ao criar carteira', err?.message || 'Tente novamente mais tarde')
  }
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
