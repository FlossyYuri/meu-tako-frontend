<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
  >
    <div class="text-center">
      <LoadingSpinner size="lg" text="Redirecionando para o dashboard..." />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

// Redirect to dashboard
onMounted(() => {
  navigateTo('/dashboard')
})
</script>
