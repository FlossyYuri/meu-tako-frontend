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

onMounted(() => {
  authStore.initializeAuth()
})
</script>
