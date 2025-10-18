<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/reminders"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para lembretes
      </NuxtLink>
    </div>

    <div v-if="reminder" class="space-y-6">
      <!-- Detalhes do Lembrete -->
      <Card>
        <ReminderDetails :reminder="reminder" />
      </Card>

      <!-- Ações Rápidas -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Ações Rápidas
          </h2>
        </template>

        <div class="flex flex-wrap gap-3">
          <!-- Pausar/Resumir -->
          <Button
            v-if="reminder.status === 'active'"
            variant="outline"
            icon="lucide:pause"
            @click="onPause"
          >
            Pausar Lembrete
          </Button>
          <Button
            v-else-if="reminder.status === 'paused'"
            variant="outline"
            icon="lucide:play"
            @click="onResume"
          >
            Reativar Lembrete
          </Button>

          <!-- Completar -->
          <Button
            v-if="reminder.status === 'active' || reminder.status === 'paused'"
            variant="primary"
            icon="lucide:check"
            @click="onComplete"
          >
            Marcar como Concluído
          </Button>

          <!-- Cancelar -->
          <Button
            v-if="reminder.status !== 'cancelled'"
            variant="warning"
            icon="lucide:x"
            @click="onCancel"
          >
            Cancelar Lembrete
          </Button>
        </div>
      </Card>

      <!-- Edição -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Editar Lembrete
          </h2>
        </template>

        <ReminderForm mode="edit" :reminder="reminder" @saved="onSaved" />
      </Card>

      <!-- Exclusão -->
      <Card
        class="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="lucide:trash-2" class="w-5 h-5 text-error-600" />
            <h2
              class="text-lg font-semibold text-error-900 dark:text-error-100"
            >
              Excluir Lembrete
            </h2>
          </div>
        </template>

        <div class="space-y-3">
          <p class="text-sm text-error-700 dark:text-error-300">
            Esta ação não pode ser desfeita. O lembrete será permanentemente
            removido.
          </p>
          <Button variant="error" icon="lucide:trash-2" @click="onDelete">
            Excluir Lembrete
          </Button>
        </div>
      </Card>
    </div>

    <div v-else class="py-12">
      <LoadingSpinner center text="Carregando lembrete..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reminder } from '~/types';

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const remindersStore = useRemindersStore()
const { success, error: showError } = useNotifications()
const {
  pauseReminder,
  resumeReminder,
  completeReminder,
  cancelReminder,
  deleteReminder
} = useReminders()

const reminder = ref<Reminder | null>(null)

const loadReminder = async () => {
  try {
    reminder.value = await remindersStore.getReminderById(id)
  } catch (err: any) {
    showError('Erro ao carregar lembrete', err?.message)
  }
}

const onPause = async () => {
  try {
    await pauseReminder(id)
    await loadReminder()
  } catch (err) {
    // Error handling is done in the composable
  }
}

const onResume = async () => {
  try {
    await resumeReminder(id)
    await loadReminder()
  } catch (err) {
    // Error handling is done in the composable
  }
}

const onComplete = async () => {
  try {
    await completeReminder(id)
    await loadReminder()
  } catch (err) {
    // Error handling is done in the composable
  }
}

const onCancel = async () => {
  if (!confirm('Tem certeza que deseja cancelar este lembrete?')) return
  try {
    await cancelReminder(id)
    await loadReminder()
  } catch (err) {
    // Error handling is done in the composable
  }
}

const onSaved = async () => {
  success('Lembrete atualizado com sucesso!')
  await loadReminder()
}

const onDelete = async () => {
  if (!confirm('Tem certeza que deseja excluir este lembrete? Esta ação não pode ser desfeita.')) return
  try {
    await deleteReminder(id)
    success('Lembrete excluído com sucesso!')
    await navigateTo('/reminders')
  } catch (err) {
    // Error handling is done in the composable
  }
}

onMounted(async () => {
  try {
    await loadReminder()
  } catch (err: any) {
    showError('Erro ao carregar lembrete', err?.message)
  }
})
</script>
