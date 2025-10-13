<template>
  <div class="max-w-md mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/wallets"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para carteiras
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Nova Carteira
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Crie uma nova carteira para organizar suas finanças
        </p>
      </template>

      <WalletForm
        submitLabel="Criar Carteira"
        :loading="walletsStore.isLoading"
        @cancel="navigateTo('/wallets')"
        @submit="onCreate"
      />

      <template #footer>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Você poderá definir esta carteira como padrão depois de criada.
        </p>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import WalletForm from '~/components/feature/WalletForm.vue'

definePageMeta({
  middleware: 'auth'
})

const walletsStore = useWalletsStore()
const { success, error: showError } = useNotifications()

const onCreate = async (name: string) => {
  try {
    walletsStore.clearError()
    await walletsStore.createWallet({ wallet_name: name })
    success('Carteira criada com sucesso!')
    await navigateTo('/wallets')
  } catch (err: any) {
    showError('Erro ao criar carteira', err?.message || 'Tente novamente mais tarde')
  }
}
</script>