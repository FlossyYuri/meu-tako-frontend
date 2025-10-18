<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Lembretes"
      subtitle="Gerencie seus lembretes e notificações"
    >
      <template #actions>
        <Button to="/reminders/new" variant="primary" icon="lucide:plus">
          Novo Lembrete
        </Button>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="remindersStore.isLoading" class="py-12">
      <LoadingSpinner center text="Carregando lembretes..." />
    </div>

    <!-- Lembretes Grid -->
    <div
      v-else-if="remindersStore.reminders.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
    >
      <ReminderCard
        v-for="reminder in remindersStore.reminders"
        :key="reminder.id"
        :reminder="reminder"
        @select="navigateTo(`/reminders/${reminder.id}`)"
        @edit="navigateTo(`/reminders/${reminder.id}`)"
        @pause="onReminderAction"
        @resume="onReminderAction"
        @complete="onReminderAction"
        @cancel="onReminderAction"
        @delete="onReminderAction"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="lucide:bell" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhum lembrete encontrado
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Crie seu primeiro lembrete para começar a organizar suas atividades
      </p>
      <Button to="/reminders/new" variant="primary" icon="lucide:plus">
        Criar Primeiro Lembrete
      </Button>
    </div>

    <!-- Error -->
    <div
      v-if="remindersStore.error"
      class="text-center text-error-600 dark:text-error-400"
    >
      {{ remindersStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const remindersStore = useRemindersStore()
const { error: showError } = useNotifications()

const onReminderAction = () => {
  // As ações são tratadas no componente ReminderCard
  // Aqui apenas recarregamos a lista se necessário
}

onMounted(async () => {
  try {
    await remindersStore.fetchReminders()
  } catch (err) {
    showError('Erro ao carregar lembretes')
  }
})
</script>
