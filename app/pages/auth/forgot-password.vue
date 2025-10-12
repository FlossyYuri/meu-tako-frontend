<template>
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
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Enviaremos um link para redefinir sua senha
      </p>
    </div>

    <!-- Submit Button -->
    <div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        :loading="isLoading"
        :disabled="!isFormValid"
        full-width
      >
        Enviar Link de Recuperação
      </Button>
    </div>

    <!-- Success Message -->
    <div v-if="isSuccess" class="text-center">
      <div
        class="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-800 rounded-md p-4"
      >
        <div class="flex">
          <Icon name="lucide:check-circle" class="w-5 h-5 text-success-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-success-800 dark:text-success-200">
              E-mail enviado com sucesso!
            </h3>
            <p class="text-sm text-success-700 dark:text-success-300 mt-1">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-center">
      <p class="text-sm text-error-600 dark:text-error-400">
        {{ error }}
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

const { success, error: showError } = useNotifications()

// Form state
const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const isLoading = ref(false)
const error = ref('')
const isSuccess = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.email && !errors.email
})

// Methods
const validateForm = () => {
  errors.email = ''

  if (!form.email) {
    errors.email = 'E-mail é obrigatório'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'E-mail inválido'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  error.value = ''
  try {
    await $fetch('/auth/forgot-password', {
      method: 'POST',
      body: { email: form.email },
      baseURL: useRuntimeConfig().public.apiBase
    })
    isSuccess.value = true
    success('E-mail de recuperação enviado!')
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Erro ao enviar e-mail de recuperação'
    error.value = msg
    showError('Erro ao enviar e-mail de recuperação', msg)
  } finally {
    isLoading.value = false
  }
}

// Clear errors when user types
watch(() => form.email, () => {
  if (errors.email) errors.email = ''
  if (error.value) error.value = ''
})
</script>