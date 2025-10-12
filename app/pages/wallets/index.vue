<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Carteiras
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie suas carteiras e saldos
        </p>
      </div>
      <Button to="/wallets/new" variant="primary" icon="lucide:plus">
        Nova Carteira
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="walletsStore.isLoading" class="flex justify-center py-12">
      <LoadingSpinner text="Carregando carteiras..." />
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
      <Button to="/wallets/new" variant="primary" icon="lucide:plus">
        Criar Primeira Carteira
      </Button>
    </div>

    <!-- Wallets Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="wallet in walletsStore.wallets"
        :key="wallet.wallet_id"
        class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        @click="selectWallet(wallet)"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"
              >
                <Icon name="lucide:wallet" class="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ wallet.wallet_name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDisplayDate(wallet.created_at) }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Badge v-if="wallet.is_default" variant="success" size="sm">
                Padrão
              </Badge>
              <div class="relative">
                <button
                  class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click.stop="toggleWalletMenu(wallet)"
                >
                  <Icon
                    name="lucide:more-horizontal"
                    class="w-4 h-4 text-gray-500"
                  />
                </button>

                <!-- Dropdown Menu -->
                <Transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-if="selectedWalletMenu === wallet.wallet_id"
                    class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                  >
                    <div class="py-1">
                      <button
                        class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        @click="editWallet(wallet)"
                      >
                        <Icon name="lucide:edit" class="w-4 h-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        v-if="!wallet.is_default"
                        class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        @click="setAsDefault(wallet)"
                      >
                        <Icon name="lucide:star" class="w-4 h-4" />
                        <span>Definir como padrão</span>
                      </button>

                      <button
                        v-if="!wallet.is_default"
                        class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                        @click="deleteWallet(wallet)"
                      >
                        <Icon name="lucide:trash-2" class="w-4 h-4" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Saldo atual</span
              >
              <span class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(wallet.balance) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400"
                >Última atualização</span
              >
              <span class="text-gray-700 dark:text-gray-300">
                {{ formatRelativeTime(wallet.updated_at) }}
              </span>
            </div>
          </div>
        </div>
      </Card>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const walletsStore = useWalletsStore()
const { formatCurrency, formatDisplayDate, formatRelativeTime } = useApi()
const { success, error: showError } = useNotifications()

// State
const selectedWalletMenu = ref<string | null>(null)

// Methods
const selectWallet = (wallet: any) => {
  walletsStore.setCurrentWallet(wallet)
  navigateTo(`/wallets/${wallet.wallet_id}`)
}

const toggleWalletMenu = (wallet: any) => {
  selectedWalletMenu.value = selectedWalletMenu.value === wallet.wallet_id ? null : wallet.wallet_id
}

const editWallet = (wallet: any) => {
  selectedWalletMenu.value = null
  navigateTo(`/wallets/${wallet.wallet_id}/edit`)
}

const setAsDefault = async (wallet: any) => {
  try {
    selectedWalletMenu.value = null
    await walletsStore.setDefaultWallet(wallet.wallet_id)
    success('Carteira definida como padrão')
  } catch (error) {
    showError('Erro ao definir carteira padrão')
  }
}

const deleteWallet = async (wallet: any) => {
  if (confirm(`Tem certeza que deseja excluir a carteira "${wallet.wallet_name}"?`)) {
    try {
      selectedWalletMenu.value = null
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

// Close menu when clicking outside
onClickOutside(document.body, () => {
  selectedWalletMenu.value = null
})
</script>
