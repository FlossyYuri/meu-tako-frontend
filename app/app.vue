<template>
  <div>
    <TopProgressBar />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Toast notifications -->
    <Toaster
      :theme="toastTheme"
      position="top-center"
      rich-colors
      close-button
    />
  </div>
</template>

<script setup>
// Initialize auth state on app startup
import 'vue-sonner/style.css'
const authStore = useAuthStore()

// Get reactive toast theme from plugin
const { $toastTheme } = useNuxtApp()
const toastTheme = $toastTheme

// Setup automático de push notifications
const { setupAutoPushNotifications, shouldExecuteAutoSetup } = usePushNotifications()

// Executar setup quando usuário fizer login
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      console.log('🔔 [APP] Usuário autenticado, verificando se deve executar setup...')
      const shouldExecute = await shouldExecuteAutoSetup()
      if (shouldExecute) {
        console.log('🔔 [APP] Executando setup automático de push notifications...')
        await setupAutoPushNotifications()
      }
    }
  },
  { immediate: false }
)

onMounted(async () => {
  // Inicializar autenticação
  authStore.initializeAuth()

  // Aguardar um pouco para garantir que a autenticação foi processada
  await nextTick()

  // Verificar se deve fazer setup automático de push notifications
  if (authStore.isAuthenticated) {
    console.log('🔔 [APP] Verificando se deve executar setup automático...')
    const shouldExecute = await shouldExecuteAutoSetup()
    if (shouldExecute) {
      console.log('🔔 [APP] Executando setup automático de push notifications...')
      await setupAutoPushNotifications()
    }
  }
})
</script>
