<template>
  <div>
    <TopProgressBar />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="top-center" />
  </div>
</template>

<script setup>
// Initialize auth state on app startup
const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>
