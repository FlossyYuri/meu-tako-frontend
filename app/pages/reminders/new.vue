<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/reminders"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para lembretes
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <div class="flex items-center gap-3">
          <Icon name="lucide:plus" class="w-6 h-6 text-primary-600" />
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            Criar Lembrete
          </h1>
        </div>
      </template>

      <ReminderForm mode="create" @saved="onSaved" />
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { success } = useNotifications()

const onSaved = () => {
  success('Lembrete criado com sucesso!')
  navigateTo('/reminders')
}
</script>
