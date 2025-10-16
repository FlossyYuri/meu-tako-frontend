<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  >
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Notificações Push
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Receba notificações sobre suas transações e metas
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full" :class="statusColor" />
        <span class="text-sm font-medium" :class="statusTextColor">
          {{ statusText }}
        </span>
      </div>
    </div>

    <!-- Status Messages -->
    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
    >
      <p class="text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </p>
    </div>

    <div
      v-if="!isSupported"
      class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
    >
      <p class="text-sm text-yellow-600 dark:text-yellow-400">
        Push notifications não são suportadas neste browser
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Button
        v-if="canRegister"
        :disabled="isLoading"
        class="flex-1"
        variant="primary"
        @click="handleRegister"
      >
        <LoadingSpinner v-if="isLoading" class="w-4 h-4 mr-2" />
        {{ isLoading ? 'Registrando...' : 'Ativar Notificações' }}
      </Button>

      <Button
        v-if="canUnsubscribe"
        :disabled="isLoading"
        class="flex-1"
        variant="secondary"
        @click="handleUnsubscribe"
      >
        <LoadingSpinner v-if="isLoading" class="w-4 h-4 mr-2" />
        {{ isLoading ? 'Cancelando...' : 'Desativar Notificações' }}
      </Button>

      <Button
        v-if="permission.denied"
        class="flex-1"
        variant="outline"
        @click="handleOpenSettings"
      >
        Abrir Configurações do Browser
      </Button>
    </div>

    <!-- Help Text -->
    <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
      <p v-if="permission.default">
        Clique em "Ativar Notificações" para permitir que o Meu Tako envie
        notificações importantes.
      </p>
      <p v-if="permission.denied">
        As notificações foram bloqueadas. Para reativar, acesse as configurações
        do seu browser.
      </p>
      <p v-if="isRegistered">
        Você está recebendo notificações push. Clique em "Desativar
        Notificações" para parar de recebê-las.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { usePushNotifications } from '~/composables/usePushNotifications'
import Button from '~/components/ui/Button.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

const {
  isSupported,
  permission,
  isRegistered,
  isLoading,
  error,
  canRegister,
  canUnsubscribe,
  status,
  checkSupport,
  checkPermission,
  registerForPushNotifications,
  checkExistingSubscription,
  unsubscribe
} = usePushNotifications()

// Status text and colors
const statusText = computed(() => {
  switch (status.value) {
    case 'not-supported':
      return 'Não Suportado'
    case 'denied':
      return 'Bloqueado'
    case 'default':
      return 'Não Configurado'
    case 'registered':
      return 'Ativo'
    case 'ready':
      return 'Pronto'
    default:
      return 'Desconhecido'
  }
})

const statusColor = computed(() => {
  switch (status.value) {
    case 'registered':
      return 'bg-green-500'
    case 'denied':
      return 'bg-red-500'
    case 'default':
    case 'ready':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
})

const statusTextColor = computed(() => {
  switch (status.value) {
    case 'registered':
      return 'text-green-600 dark:text-green-400'
    case 'denied':
      return 'text-red-600 dark:text-red-400'
    case 'default':
    case 'ready':
      return 'text-yellow-600 dark:text-yellow-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
})

// Handlers
const handleRegister = async () => {
  const success = await registerForPushNotifications()
  if (success) {
    // Opcional: mostrar toast de sucesso
    console.log('Push notifications ativadas com sucesso!')
  }
}

const handleUnsubscribe = async () => {
  const success = await unsubscribe()
  if (success) {
    // Opcional: mostrar toast de sucesso
    console.log('Push notifications desativadas com sucesso!')
  }
}

const handleOpenSettings = () => {
  // Tentar abrir as configurações do browser (funciona apenas em alguns browsers)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        // Alguns browsers permitem abrir configurações
        window.open('chrome://settings/content/notifications', '_blank')
      }
    })
  }
}

// Initialize
onMounted(async () => {
  checkSupport()
  checkPermission()
  await checkExistingSubscription()
})
</script>
