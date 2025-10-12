<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Name -->
    <div>
      <Input
        v-model="form.name"
        type="text"
        label="Nome completo"
        placeholder="Seu nome completo"
        :error="errors.name"
        required
        autocomplete="name"
      />
    </div>

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

    <!-- WhatsApp -->
    <div>
      <Input
        v-model="form.whatsapp"
        type="tel"
        label="WhatsApp (opcional)"
        placeholder="+258840000000"
        :error="errors.whatsapp"
        hint="Formato: +258840000000"
        autocomplete="tel"
      />
    </div>

    <!-- Password -->
    <div>
      <Input
        v-model="form.password"
        type="password"
        label="Senha"
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
        label="Confirmar senha"
        placeholder="Digite a senha novamente"
        :error="errors.confirmPassword"
        required
        autocomplete="new-password"
      />
    </div>

    <!-- Terms Agreement -->
    <div class="flex items-start">
      <div class="flex items-center h-5">
        <input
          id="terms"
          v-model="form.acceptTerms"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          required
        />
      </div>
      <div class="ml-3 text-sm">
        <label for="terms" class="text-gray-700 dark:text-gray-300">
          Eu aceito os
          <a
            href="#"
            class="text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Termos de Uso
          </a>
          e a
          <a
            href="#"
            class="text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Política de Privacidade
          </a>
        </label>
      </div>
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
        Criar conta
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
      Já tem uma conta?
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

// Form state
const form = reactive({
  name: '',
  email: '',
  whatsapp: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  name: '',
  email: '',
  whatsapp: '',
  password: '',
  confirmPassword: ''
})

// Computed
const isFormValid = computed(() => {
  return (
    form.name &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.acceptTerms &&
    !errors.name &&
    !errors.email &&
    !errors.whatsapp &&
    !errors.password &&
    !errors.confirmPassword
  )
})

// Methods
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // Name validation
  if (!form.name.trim()) {
    errors.name = 'Nome é obrigatório'
    isValid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres'
    isValid = false
  }

  // Email validation
  if (!form.email) {
    errors.email = 'E-mail é obrigatório'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'E-mail inválido'
    isValid = false
  }

  // WhatsApp validation (optional)
  if (form.whatsapp && !/^\+258[0-9]{9}$/.test(form.whatsapp)) {
    errors.whatsapp = 'WhatsApp deve estar no formato +258840000000'
    isValid = false
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Senha é obrigatória'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres'
    isValid = false
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirmação de senha é obrigatória'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Senhas não coincidem'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    authStore.clearError()

    await authStore.register({
      name: form.name.trim(),
      email: form.email.toLowerCase(),
      password: form.password,
      whatsapp: form.whatsapp || undefined
    })

    success('Conta criada com sucesso!')
    await navigateTo('/auth/login')
  } catch (err: any) {
    showError('Erro ao criar conta', err.message || 'Tente novamente mais tarde')
  }
}

// Clear errors when user types
watch(() => form.name, () => {
  if (errors.name) errors.name = ''
})

watch(() => form.email, () => {
  if (errors.email) errors.email = ''
})

watch(() => form.whatsapp, () => {
  if (errors.whatsapp) errors.whatsapp = ''
})

watch(() => form.password, () => {
  if (errors.password) errors.password = ''
  if (errors.confirmPassword && form.confirmPassword) {
    errors.confirmPassword = ''
  }
})

watch(() => form.confirmPassword, () => {
  if (errors.confirmPassword) errors.confirmPassword = ''
})
</script>
