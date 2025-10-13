<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/goals"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para metas
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Nova Meta</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Defina uma nova meta financeira e acompanhe seu progresso
        </p>
      </template>

      <GoalForm mode="create" :showCancel="true" @cancel="navigateTo('/goals')" @saved="onSaved" />
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { success } = useNotifications()
const goalsStore = useGoalsStore()

const onSaved = async () => {
  // garantir atualização da lista ao voltar
  await goalsStore.fetchGoals()
  success('Meta criada com sucesso!')
  await navigateTo('/goals')
}
</script>