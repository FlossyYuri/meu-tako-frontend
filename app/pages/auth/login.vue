<template>
  <div>
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Email -->
      <div>
        <Input
          v-model="form.email"
          type="email"
          label="E-mail"
          placeholder="seu@email.com"
          :error="errors.email"
          required
          autocomplete="email"
        />
      </div>

      <!-- Password -->
      <div>
        <Input
          v-model="form.password"
          type="password"
          label="Senha"
          placeholder="Sua senha"
          :error="errors.password"
          required
          autocomplete="current-password"
        />
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            v-model="form.remember"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label
            for="remember-me"
            class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            Lembrar de mim
          </label>
        </div>

        <NuxtLink
          to="/auth/forgot-password"
          class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          Esqueceu a senha?
        </NuxtLink>
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
          Entrar
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
        Não tem uma conta?
        <NuxtLink
          to="/auth/register"
          class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          Criar conta
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const authStore = useAuthStore()
const { success, error: showError } = useNotifications()

// Form state
const form = reactive({
  email: '',
  password: '',
  remember: false
})

const errors = reactive({
  email: '',
  password: ''
})

// Computed
const isFormValid = computed(() => {
  return form.email && form.password && !errors.email && !errors.password
})

// Methods
const validateForm = () => {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'E-mail é obrigatório'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'E-mail inválido'
    return false
  }

  if (!form.password) {
    errors.password = 'Senha é obrigatória'
    return false
  }

  if (form.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    authStore.clearError()

    await authStore.login({
      email: form.email,
      password: form.password
    })

    success('Login realizado com sucesso!')
    await navigateTo('/')
  } catch (err: any) {
    showError('Erro ao fazer login', err.message || 'Verifique suas credenciais e tente novamente')
  }
}

// Clear errors when user types
watch(() => form.email, () => {
  if (errors.email) errors.email = ''
})

watch(() => form.password, () => {
  if (errors.password) errors.password = ''
})
</script>
