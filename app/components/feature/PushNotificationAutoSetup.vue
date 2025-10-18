<template>
  <div
    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
  >
    <div class="flex items-center gap-3">
      <div
        class="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center"
      >
        <Bell class="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100">
          Configuração Automática de Notificações
        </h3>
        <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">
          {{ statusMessage }}
        </p>
      </div>
      <div v-if="isAutoSetupInProgress" class="animate-spin">
        <Loader2 class="w-4 h-4 text-blue-600" />
      </div>
    </div>

    <div
      v-if="autoSetupError"
      class="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300"
    >
      {{ autoSetupError }}
    </div>
  </div>
</template>

<script setup>
import { Bell, Loader2 } from 'lucide-vue-next'

const {
  isAutoSetupComplete,
  isAutoSetupInProgress,
  autoSetupError,
  hasBeenAutoSetup,
  resetAutoSetup
} = usePushNotifications()

const statusMessage = computed(() => {
  if (isAutoSetupInProgress.value) {
    return 'Configurando notificações automaticamente...'
  }

  if (isAutoSetupComplete.value || hasBeenAutoSetup.value) {
    return 'Notificações configuradas com sucesso!'
  }

  if (autoSetupError.value) {
    return 'Erro na configuração das notificações'
  }

  return 'Aguardando configuração automática...'
})

// Método para reset (útil para testes)
const handleReset = () => {
  resetAutoSetup()
  console.log('🔔 [PUSH AUTO] Setup automático resetado, será executado novamente no próximo login')
}
</script>
