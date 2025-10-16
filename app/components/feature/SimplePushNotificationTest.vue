<template>
  <div
    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
  >
    <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
      🔔 Teste de Notificações Push
    </h3>

    <div class="space-y-3">
      <!-- Status -->
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full" :class="statusColor"></div>
        <span class="text-sm font-medium" :class="statusTextColor">
          {{ statusText }}
        </span>
      </div>

      <!-- Botões -->
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          @click="testNotification"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Testar Notificação
        </button>

        <button
          @click="requestPermission"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Solicitar Permissão
        </button>
      </div>

      <!-- Informações -->
      <div class="text-xs text-blue-700 dark:text-blue-300">
        <p><strong>Suporte:</strong> {{ isSupported ? 'Sim' : 'Não' }}</p>
        <p><strong>Permissão:</strong> {{ permissionStatus }}</p>
        <p><strong>Service Worker:</strong> {{ swStatus }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const isSupported = ref(false)
const permissionStatus = ref('')
const swStatus = ref('')

// Status colors
const statusColor = computed(() => {
  if (!isSupported.value) return 'bg-gray-400'
  if (permissionStatus.value === 'granted') return 'bg-green-500'
  if (permissionStatus.value === 'denied') return 'bg-red-500'
  return 'bg-yellow-500'
})

const statusTextColor = computed(() => {
  if (!isSupported.value) return 'text-gray-600'
  if (permissionStatus.value === 'granted') return 'text-green-600'
  if (permissionStatus.value === 'denied') return 'text-red-600'
  return 'text-yellow-600'
})

const statusText = computed(() => {
  if (!isSupported.value) return 'Não Suportado'
  if (permissionStatus.value === 'granted') return 'Ativo'
  if (permissionStatus.value === 'denied') return 'Bloqueado'
  return 'Pendente'
})

// Methods
const checkSupport = () => {
  isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
  permissionStatus.value = Notification.permission
}

const checkServiceWorker = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      swStatus.value = registration ? 'Registrado' : 'Não Registrado'
    } else {
      swStatus.value = 'Não Suportado'
    }
  } catch (error) {
    swStatus.value = 'Erro'
    console.error('Erro ao verificar service worker:', error)
  }
}

const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    permissionStatus.value = permission
    console.log('Permissão:', permission)
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error)
  }
}

const testNotification = async () => {
  try {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Teste do Meu Tako', {
        body: 'Esta é uma notificação de teste!',
        icon: '/icons/192-192.png',
        badge: '/icons/48-48.png'
      })

      notification.onclick = () => {
        console.log('Notificação clicada!')
        notification.close()
      }
    } else {
      alert('Permissão para notificações não concedida')
    }
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    alert('Erro ao criar notificação: ' + error.message)
  }
}

onMounted(() => {
  checkSupport()
  checkServiceWorker()
})
</script>
