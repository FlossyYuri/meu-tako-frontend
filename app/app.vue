<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>

<script setup>
// Initialize auth state on app startup
const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>
