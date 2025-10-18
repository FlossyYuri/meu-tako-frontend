<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- New Password -->
    <div>
      <Input
        v-model="form.password"
        type="password"
        label="Nova senha"
        placeholder="Mínimo 6 caracteres"
        :error="errors.password"
        required
        autocomplete="new-password"
      />
    </div>

    <!-- Confirm Password -->
    <div>
      <Input
        v-model="form.confirmPassword"
        type="password"
        label="Confirmar nova senha"
        placeholder="Digite a senha novamente"
        :error="errors.confirmPassword"
        required
        autocomplete="new-password"
      />
    </div>

    <!-- Submit Button -->
    <div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        :loading="authStore.isLoading"
        :disabled="!isFormValid"
        full-width
      >
        Redefinir Senha
      </Button>
    </div>

    <!-- Error Message -->
    <div v-if="authStore.error" class="text-center">
      <p class="text-sm text-error-600 dark:text-error-400">
        {{ authStore.error }}
      </p>
    </div>
  </form>

  <!-- Footer content -->
  <div class="mt-6 text-center">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      Lembrou da senha?
      <NuxtLink
        to="/auth/login"
        class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
      >
        Fazer login
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const authStore = useAuthStore()
const { success, error: showError } = useNotifications()
const route = useRoute()

// Form state
const form = reactive({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

// Get token from query params
const token = computed(() => route.query.token as string)

// Computed
const isFormValid = computed(() => {
  return form.password && form.confirmPassword && !errors.password && !errors.confirmPassword
})

// Methods
const validateForm = () => {
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.password) {
    errors.password = 'Senha é obrigatória'
    return false
  }

  if (form.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres'
    return false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirmação de senha é obrigatória'
    return false
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Senhas não coincidem'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  if (!token.value) {
    showError('Token inválido', 'Token de redefinição não encontrado')
    return
  }

  try {
    authStore.clearError()

    await authStore.resetPassword(token.value, form.password)

    success('Senha redefinida com sucesso!')
    await navigateTo('/auth/login')
  } catch (err: any) {
    showError('Erro ao redefinir senha', err.message || 'Token inválido ou expirado')
  }
}

// Clear errors when user types
watch(() => form.password, () => {
  if (errors.password) errors.password = ''
  if (errors.confirmPassword && form.confirmPassword) {
    errors.confirmPassword = ''
  }
})

watch(() => form.confirmPassword, () => {
  if (errors.confirmPassword) errors.confirmPassword = ''
})

// Check if token exists on mount
onMounted(() => {
  if (!token.value) {
    showError('Token inválido', 'Link de redefinição inválido')
    navigateTo('/auth/forgot-password')
  }
})
</script>
