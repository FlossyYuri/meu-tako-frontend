<template>
  <div class="max-w-md mx-auto">
    <div class="mb-6">
      <NuxtLink
        :to="`/wallets/${id}`"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para detalhes
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Editar Carteira
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Atualize o nome da carteira
        </p>
      </template>

      <WalletForm
        :walletName="walletName"
        :loading="walletsStore.isLoading"
        submitLabel="Salvar alterações"
        @cancel="navigateTo(`/wallets/${id}`)"
        @submit="onSubmit"
      />

      <template #footer>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          ID: <span class="font-mono">{{ id }}</span>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import WalletForm from '~/components/feature/WalletForm.vue'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const walletsStore = useWalletsStore()
const { success, error: showError } = useNotifications()

const walletName = computed(() => walletsStore.getWalletById(id)?.wallet_name || '')

const load = async () => {
  try {
    if (!walletsStore.getWalletById(id)) {
      await walletsStore.fetchWalletById(id)
    }
  } catch (err: any) {
    showError('Erro ao carregar carteira', err?.message)
  }
}

const onSubmit = async (name: string) => {
  try {
    await walletsStore.updateWallet(id, { wallet_name: name })
    success('Carteira atualizada com sucesso')
    await navigateTo(`/wallets/${id}`)
  } catch (err: any) {
    showError('Erro ao atualizar carteira', err?.message)
  }
}

onMounted(load)
</script>