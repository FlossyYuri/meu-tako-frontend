<template>
  <div
    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
  >
    <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
      🔍 Diagnóstico de Push Notifications
    </h3>

    <div class="space-y-4">
      <!-- Status do Service Worker -->
      <div class="bg-white dark:bg-gray-800 rounded-md p-4">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">
          Service Worker
        </h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Status:</span>
            <span :class="swStatus.color">{{ swStatus.text }}</span>
          </div>
          <div class="flex justify-between">
            <span>Registrado:</span>
            <span :class="swRegistered.color">{{ swRegistered.text }}</span>
          </div>
        </div>
      </div>

      <!-- Status das Permissões -->
      <div class="bg-white dark:bg-gray-800 rounded-md p-4">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">
          Permissões
        </h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Notificações:</span>
            <span
              :class="permissionStatus.color"
              >{{ permissionStatus.text }}</span
            >
          </div>
          <div class="flex justify-between">
            <span>Suporte:</span>
            <span :class="supportStatus.color">{{ supportStatus.text }}</span>
          </div>
        </div>
      </div>

      <!-- Subscription Info -->
      <div class="bg-white dark:bg-gray-800 rounded-md p-4">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">
          Subscription
        </h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Ativa:</span>
            <span
              :class="subscriptionStatus.color"
              >{{ subscriptionStatus.text }}</span
            >
          </div>
          <div
            v-if="subscriptionInfo.endpoint"
            class="text-xs text-gray-600 dark:text-gray-400 break-all"
          >
            <strong>Endpoint:</strong><br />
            {{ subscriptionInfo.endpoint.substring(0, 50) }}...
          </div>
        </div>
      </div>

      <!-- Botões de Teste -->
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          @click="testManualNotification"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Testar Notificação Manual
        </button>

        <button
          @click="checkServiceWorker"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
        >
          Verificar Service Worker
        </button>

        <button
          @click="requestPermission"
          class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
        >
          Solicitar Permissão
        </button>
      </div>

      <!-- Logs -->
      <div
        class="bg-gray-900 text-green-400 rounded-md p-4 font-mono text-xs max-h-40 overflow-y-auto"
      >
        <div v-for="(log, index) in logs" :key="index" class="mb-1">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const logs = ref<string[]>([])
const swActive = ref(false)
const swRegistered = ref(false)
const permission = ref('')
const subscription = ref<any>(null)

// Adicionar log
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${message}`)
  console.log(`[PUSH-DIAG] ${message}`)
}

// Status do Service Worker
const swStatus = computed(() => {
  if (swActive.value) {
    return { text: 'Ativo', color: 'text-green-600' }
  } else if (swRegistered.value) {
    return { text: 'Registrado', color: 'text-yellow-600' }
  } else {
    return { text: 'Não Registrado', color: 'text-red-600' }
  }
})

const swRegisteredStatus = computed(() => {
  return swRegistered.value
    ? { text: 'Sim', color: 'text-green-600' }
    : { text: 'Não', color: 'text-red-600' }
})

// Status das Permissões
const permissionStatus = computed(() => {
  switch (permission.value) {
    case 'granted':
      return { text: 'Concedida', color: 'text-green-600' }
    case 'denied':
      return { text: 'Negada', color: 'text-red-600' }
    case 'default':
      return { text: 'Não Solicitada', color: 'text-yellow-600' }
    default:
      return { text: 'Desconhecida', color: 'text-gray-600' }
  }
})

const supportStatus = computed(() => {
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  return supported
    ? { text: 'Suportado', color: 'text-green-600' }
    : { text: 'Não Suportado', color: 'text-red-600' }
})

// Status da Subscription
const subscriptionStatus = computed(() => {
  return subscription.value
    ? { text: 'Ativa', color: 'text-green-600' }
    : { text: 'Inativa', color: 'text-red-600' }
})

const subscriptionInfo = computed(() => {
  if (subscription.value) {
    return {
      endpoint: subscription.value.endpoint,
      hasKeys: !!subscription.value.getKey('p256dh') && !!subscription.value.getKey('auth')
    }
  }
  return { endpoint: null, hasKeys: false }
})

// Métodos
const testManualNotification = async () => {
  try {
    addLog('Testando notificação manual...')

    if (Notification.permission !== 'granted') {
      addLog('Permissão não concedida')
      return
    }

    const registration = await navigator.serviceWorker.ready
    await registration.showNotification('Teste Manual', {
      body: 'Esta é uma notificação de teste do Meu Tako',
      icon: '/icons/192-192.png',
      badge: '/icons/48-48.png',
      tag: 'test-notification'
    })

    addLog('✅ Notificação manual enviada com sucesso!')
  } catch (error) {
    addLog(`❌ Erro ao enviar notificação: ${error.message}`)
  }
}

const checkServiceWorker = async () => {
  try {
    addLog('Verificando service worker...')

    const registrations = await navigator.serviceWorker.getRegistrations()
    addLog(`Service workers encontrados: ${registrations.length}`)

    for (const registration of registrations) {
      addLog(`SW: ${registration.scope} - ${registration.active ? 'Ativo' : 'Inativo'}`)
    }

    if (registrations.length > 0) {
      swRegistered.value = true
      swActive.value = registrations.some(reg => reg.active)
    } else {
      swRegistered.value = false
      swActive.value = false
    }

    addLog('✅ Verificação do service worker concluída')
  } catch (error) {
    addLog(`❌ Erro ao verificar service worker: ${error.message}`)
  }
}

const requestPermission = async () => {
  try {
    addLog('Solicitando permissão...')

    const result = await Notification.requestPermission()
    permission.value = result

    addLog(`Permissão: ${result}`)

    if (result === 'granted') {
      addLog('✅ Permissão concedida!')
    } else {
      addLog('❌ Permissão negada')
    }
  } catch (error) {
    addLog(`❌ Erro ao solicitar permissão: ${error.message}`)
  }
}

const checkSubscription = async () => {
  try {
    addLog('Verificando subscription...')

    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.getSubscription()

    if (sub) {
      subscription.value = sub
      addLog('✅ Subscription encontrada')
      addLog(`Endpoint: ${sub.endpoint.substring(0, 50)}...`)
    } else {
      subscription.value = null
      addLog('❌ Nenhuma subscription encontrada')
    }
  } catch (error) {
    addLog(`❌ Erro ao verificar subscription: ${error.message}`)
  }
}

// Inicializar
onMounted(async () => {
  addLog('Iniciando diagnóstico...')

  // Verificar suporte
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  addLog(`Suporte: ${supported ? 'Sim' : 'Não'}`)

  // Verificar permissão
  permission.value = Notification.permission
  addLog(`Permissão atual: ${permission.value}`)

  // Verificar service worker
  await checkServiceWorker()

  // Verificar subscription
  await checkSubscription()

  addLog('Diagnóstico concluído!')
})
</script>
