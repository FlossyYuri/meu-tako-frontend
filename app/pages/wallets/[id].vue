<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="mb-2">
      <NuxtLink
        to="/wallets"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para carteiras
      </NuxtLink>
    </div>

    <div v-if="walletsStore.isLoading && !wallet">
      <LoadingSpinner center text="Carregando carteira..." />
    </div>

    <WalletDetails
      v-else-if="wallet"
      :wallet="wallet"
      @edit="openEditModal"
      @set-default="onSetDefault"
      @delete="onDelete"
    />

    <div v-else class="text-center py-12">
      <Icon name="lucide:wallet" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">Carteira não encontrada.</p>
    </div>

    <!-- Edit Wallet Modal -->
    <WalletEditModal
      v-model:is-open="showEditModal"
      :wallet-id="id"
      :wallet-name="wallet?.wallet_name || ''"
      :loading="walletsStore.isLoading"
      @submit="onUpdateWallet"
      @close="closeEditModal"
    />
  </div>
</template>

<script setup lang="ts">
import WalletDetails from '~/components/feature/WalletDetails.vue'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const walletsStore = useWalletsStore()
const { success, error: showError } = useNotifications()

// Modal state
const showEditModal = ref(false)

const wallet = computed(() => walletsStore.getWalletById(id) || walletsStore.currentWallet)

const load = async () => {
  try {
    // se não existe em memória, buscar do backend
    if (!wallet.value || wallet.value.wallet_id !== id) {
      await walletsStore.fetchWalletById(id)
    }
  } catch (err: any) {
    showError('Erro ao carregar carteira', err?.message)
  }
}

const openEditModal = (walletId?: string) => {
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const onUpdateWallet = async (name: string) => {
  try {
    walletsStore.clearError()
    await walletsStore.updateWallet(id, { wallet_name: name })
    success('Carteira atualizada com sucesso!')
    closeEditModal()
  } catch (err: any) {
    showError('Erro ao atualizar carteira', err?.message || 'Tente novamente mais tarde')
  }
}

const onSetDefault = async () => {
  try {
    await walletsStore.setDefaultWallet(id)
    success('Carteira definida como padrão')
  } catch (err: any) {
    showError('Erro ao definir carteira padrão', err?.message)
  }
}

const onDelete = async () => {
  if (!confirm('Tem certeza que deseja excluir esta carteira?')) return
  try {
    await walletsStore.deleteWallet(id)
    success('Carteira excluída com sucesso')
    await navigateTo('/wallets')
  } catch (err: any) {
    showError('Erro ao excluir carteira', err?.message)
  }
}

onMounted(load)
</script>
