<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Configurações
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Gerencie suas informações pessoais e preferências
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Navigation -->
      <div class="lg:col-span-1">
        <Card>
          <nav class="space-y-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
              :class="[
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              ]"
              @click="activeTab = tab.id"
            >
              <Icon :name="tab.icon" class="w-4 h-4" />
              <span>{{ tab.name }}</span>
            </button>
          </nav>
        </Card>
      </div>

      <!-- Content -->
      <div class="lg:col-span-2">
        <!-- Profile Tab -->
        <Card v-if="activeTab === 'profile'">
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Perfil
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Atualize suas informações pessoais
            </p>
          </template>

          <form class="space-y-6" @submit.prevent="updateProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  v-model="profileForm.name"
                  type="text"
                  label="Nome completo"
                  :error="profileErrors.name"
                  required
                />
              </div>

              <div>
                <Input
                  v-model="profileForm.email"
                  type="email"
                  label="E-mail"
                  :error="profileErrors.email"
                  required
                  disabled
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  O e-mail não pode ser alterado
                </p>
              </div>
            </div>

            <div>
              <Input
                v-model="profileForm.whatsapp"
                type="tel"
                label="WhatsApp"
                placeholder="+258840000000"
                :error="profileErrors.whatsapp"
                hint="Formato: +258840000000"
              />
            </div>

            <div class="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                :loading="authStore.isLoading"
                :disabled="!isProfileFormValid"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Card>

        <!-- Security Tab -->
        <Card v-if="activeTab === 'security'">
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Segurança
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Gerencie sua senha e configurações de segurança
            </p>
          </template>

          <form class="space-y-6" @submit.prevent="changePassword">
            <div>
              <Input
                v-model="passwordForm.current_password"
                type="password"
                label="Senha atual"
                :error="passwordErrors.current_password"
                required
              />
            </div>

            <div>
              <Input
                v-model="passwordForm.new_password"
                type="password"
                label="Nova senha"
                :error="passwordErrors.new_password"
                required
              />
            </div>

            <div>
              <Input
                v-model="passwordForm.confirm_password"
                type="password"
                label="Confirmar nova senha"
                :error="passwordErrors.confirm_password"
                required
              />
            </div>

            <div class="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                :loading="authStore.isLoading"
                :disabled="!isPasswordFormValid"
              >
                Alterar Senha
              </Button>
            </div>
          </form>
        </Card>

        <!-- Preferences Tab -->
        <Card v-if="activeTab === 'preferences'">
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Preferências
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Configure suas preferências de uso
            </p>
          </template>

          <div class="space-y-6">
            <!-- Theme -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
              >
                Tema
              </label>
              <div class="flex space-x-4">
                <button
                  class="flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors duration-200"
                  :class="[
                    theme === 'light'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  ]"
                  @click="setTheme('light')"
                >
                  <Icon name="lucide:sun" class="w-4 h-4" />
                  <span>Claro</span>
                </button>
                <button
                  class="flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors duration-200"
                  :class="[
                    theme === 'dark'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  ]"
                  @click="setTheme('dark')"
                >
                  <Icon name="lucide:moon" class="w-4 h-4" />
                  <span>Escuro</span>
                </button>
                <button
                  class="flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors duration-200"
                  :class="[
                    theme === 'auto'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  ]"
                  @click="setTheme('auto')"
                >
                  <Icon name="lucide:monitor" class="w-4 h-4" />
                  <span>Automático</span>
                </button>
              </div>
            </div>

            <!-- Currency -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Moeda padrão
              </label>
              <select
                v-model="preferences.currency"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="MZN">MZN - Metical Moçambicano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
                <option value="BRL">BRL - Real Brasileiro</option>
              </select>
            </div>

            <!-- Notifications -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
              >
                Notificações
              </label>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      Lembretes de pagamento
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Receba lembretes sobre pagamentos pendentes
                    </p>
                  </div>
                  <input
                    v-model="preferences.paymentReminders"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      Relatórios mensais
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Receba resumos mensais por e-mail
                    </p>
                  </div>
                  <input
                    v-model="preferences.monthlyReports"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Account Tab -->
        <Card v-if="activeTab === 'account'">
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Conta
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Gerencie sua conta e dados
            </p>
          </template>

          <div class="space-y-6">
            <!-- Export Data -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    Exportar dados
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Baixe uma cópia dos seus dados
                  </p>
                </div>
                <Button variant="outline" @click="exportData">
                  Exportar
                </Button>
              </div>
            </div>

            <!-- Delete Account -->
            <div class="border border-error-200 dark:border-error-800 rounded-lg p-4 bg-error-50 dark:bg-error-900">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-error-900 dark:text-error-100">
                    Excluir conta
                  </h3>
                  <p class="text-sm text-error-700 dark:text-error-300">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
                <Button variant="error" @click="confirmDeleteAccount">
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { isDark, toggle: toggleTheme } = useDark()
const { success, error: showError } = useNotifications()

// State
const activeTab = ref('profile')
const theme = ref('auto')

const tabs = [
  { id: 'profile', name: 'Perfil', icon: 'lucide:user' },
  { id: 'security', name: 'Segurança', icon: 'lucide:shield' },
  { id: 'preferences', name: 'Preferências', icon: 'lucide:settings' },
  { id: 'account', name: 'Conta', icon: 'lucide:user-x' }
]

// Profile form
const profileForm = reactive({
  name: '',
  email: '',
  whatsapp: ''
})

const profileErrors = reactive({
  name: '',
  email: '',
  whatsapp: ''
})

// Password form
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordErrors = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// Preferences
const preferences = reactive({
  currency: 'MZN',
  paymentReminders: true,
  monthlyReports: false
})

// Computed
const isProfileFormValid = computed(() => {
  return profileForm.name.trim() && !profileErrors.name
})

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.current_password &&
    passwordForm.new_password &&
    passwordForm.confirm_password &&
    passwordForm.new_password === passwordForm.confirm_password &&
    !passwordErrors.current_password &&
    !passwordErrors.new_password &&
    !passwordErrors.confirm_password
  )
})

// Methods
const updateProfile = async () => {
  try {
    await authStore.updateProfile({
      name: profileForm.name.trim(),
      whatsapp: profileForm.whatsapp || undefined
    })
    success('Perfil atualizado com sucesso!')
  } catch (error) {
    showError('Erro ao atualizar perfil')
  }
}

const changePassword = async () => {
  try {
    await authStore.changePassword({
      currentPassword: passwordForm.current_password,
      newPassword: passwordForm.new_password
    })
    success('Senha alterada com sucesso!')
    // Clear form
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
  } catch (error) {
    showError('Erro ao alterar senha')
  }
}

const setTheme = (newTheme: string) => {
  theme.value = newTheme
  if (newTheme === 'dark') {
    isDark.value = true
  } else if (newTheme === 'light') {
    isDark.value = false
  } else {
    // Auto - use system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

const exportData = () => {
  // Mock export functionality
  const data = {
    user: authStore.user,
    exportDate: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `meu-tako-data-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)

  success('Dados exportados com sucesso!')
}

const confirmDeleteAccount = () => {
  if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
    deleteAccount()
  }
}

const deleteAccount = async () => {
  try {
    await authStore.deleteAccount()
    success('Conta excluída com sucesso')
    await navigateTo('/auth/login')
  } catch (error) {
    showError('Erro ao excluir conta')
  }
}

// Initialize form with user data
onMounted(() => {
  if (authStore.user) {
    profileForm.name = authStore.user.name
    profileForm.email = authStore.user.email
    profileForm.whatsapp = authStore.user.whatsapp || ''
  }
})
</script>