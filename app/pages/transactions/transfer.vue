<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/transactions"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para transações
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Transferir entre carteiras
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Mova valores entre suas carteiras
        </p>
      </template>

      <TransferForm @success="goList" @cancel="goList" />
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const goList = () => navigateTo('/transactions')
</script>