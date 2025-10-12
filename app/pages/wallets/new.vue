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

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Wallet Name -->
        <div>
          <Input
            v-model="form.wallet_name"
            type="text"
            label="Nome da carteira"
            placeholder="Ex: Carteira Principal"
            :error="errors.wallet_name"
            required
            autocomplete="off"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            full-width
            @click="navigateTo('/wallets')"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            :loading="walletsStore.isLoading"
            :disabled="!isFormValid"
            full-width
          >
            Criar Carteira
          </Button>
        </div>

        <!-- Error Message -->
        <div v-if="walletsStore.error" class="text-center">
          <p class="text-sm text-error-600 dark:text-error-400">
            {{ walletsStore.error }}
          </p>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const walletsStore = useWalletsStore()
const { success, error: showError } = useNotifications()

// Form state
const form = reactive({
  wallet_name: ''
})

const errors = reactive({
  wallet_name: ''
})

// Computed
const isFormValid = computed(() => {
  return form.wallet_name.trim() && !errors.wallet_name
})

// Methods
const validateForm = () => {
  errors.wallet_name = ''

  if (!form.wallet_name.trim()) {
    errors.wallet_name = 'Nome da carteira é obrigatório'
    return false
  }

  if (form.wallet_name.trim().length < 2) {
    errors.wallet_name = 'Nome deve ter pelo menos 2 caracteres'
    return false
  }

  if (form.wallet_name.trim().length > 50) {
    errors.wallet_name = 'Nome deve ter no máximo 50 caracteres'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    walletsStore.clearError()

    await walletsStore.createWallet({
      wallet_name: form.wallet_name.trim()
    })

    success('Carteira criada com sucesso!')
    await navigateTo('/wallets')
  } catch (err: any) {
    showError('Erro ao criar carteira', err.message || 'Tente novamente mais tarde')
  }
}

// Clear errors when user types
watch(() => form.wallet_name, () => {
  if (errors.wallet_name) errors.wallet_name = ''
})
</script>
