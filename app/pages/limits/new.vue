<template>
  <div class="max-w-xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/limits"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para limites
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Novo Limite
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Defina um limite para uma categoria de despesa
        </p>
      </template>

      <LimitForm
        :categories="categoriesStore.expenseCategories"
        :is-loading="limitsStore.isLoading"
        :error="limitsStore.error"
        @submit="onSubmit"
        @cancel="navigateTo('/limits')"
      />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { CreateLimitRequest } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const categoriesStore = useCategoriesStore()
const limitsStore = useLimitsStore()
const { success, error: showError } = useNotifications()

const onSubmit = async (data: CreateLimitRequest) => {
  try {
    await limitsStore.createLimit(data)
    success('Limite criado com sucesso')
    await navigateTo('/limits')
  } catch (err: any) {
    showError('Erro ao criar limite', err?.message)
  }
}

onMounted(async () => {
  try {
    await categoriesStore.fetchExpenseCategories()
  } catch (err: any) {
    showError('Erro ao carregar categorias', err?.message)
  }
})
</script>
