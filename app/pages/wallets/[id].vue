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
      @edit="goEdit"
      @set-default="onSetDefault"
      @delete="onDelete"
    />

    <div v-else class="text-center py-12">
      <Icon name="lucide:wallet" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">
        Carteira não encontrada.
      </p>
    </div>
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

const goEdit = () => navigateTo(`/wallets/${id}/edit`)

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