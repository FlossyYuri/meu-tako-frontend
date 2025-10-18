<template>
  <Card
    class="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full"
    @click="emit('select', reminder)"
  >
    <div class="p-4 lg:p-6 h-full flex flex-col">
      <!-- Header com título e badges -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3
            class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2"
          >
            {{ reminder.title }}
          </h3>
          <p
            v-if="reminder.description"
            class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2"
          >
            {{ reminder.description }}
          </p>
        </div>
        <div class="flex flex-col gap-1 ml-2 flex-shrink-0">
          <Badge
            :variant="getPriorityBadgeVariant(reminder.priority)"
            size="sm"
          >
            {{ formatPriority(reminder.priority) }}
          </Badge>
          <Badge :variant="getStatusBadgeVariant(reminder.status)" size="sm">
            {{ formatStatus(reminder.status) }}
          </Badge>
        </div>
      </div>

      <!-- Data e recorrência -->
      <div
        class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3"
      >
        <Icon name="lucide:calendar" class="w-4 h-4 flex-shrink-0" />
        <span
          class="truncate"
          >{{ formatDateTime(reminder.scheduledFor) }}</span
        >
        <span class="text-gray-300 dark:text-gray-600">•</span>
        <span
          class="truncate"
          >{{ formatRecurrence(reminder.recurrence) }}</span
        >
      </div>

      <!-- Valor monetário -->
      <div
        v-if="reminder.amount"
        class="flex justify-between items-center mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
      >
        <span class="text-sm text-gray-600 dark:text-gray-400">Valor</span>
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ formatCurrency(reminder.amount) }}
        </span>
      </div>

      <!-- Canais de notificação -->
      <div class="flex items-center gap-2 mb-4">
        <span class="text-sm text-gray-600 dark:text-gray-400"
          >Notificações:</span
        >
        <div class="flex gap-1">
          <Icon
            v-for="channel in reminder.notificationChannels"
            :key="channel"
            :name="formatNotificationChannel(channel).icon"
            class="w-4 h-4 text-gray-500"
            :title="formatNotificationChannel(channel).label"
          />
        </div>
      </div>

      <!-- Spacer para empurrar ações para baixo -->
      <div class="flex-1"></div>

      <!-- Ações -->
      <div
        class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex gap-1 flex-wrap">
          <!-- Pausar/Resumir -->
          <Button
            v-if="reminder.status === 'active'"
            variant="outline"
            size="sm"
            icon="lucide:pause"
            class="text-xs"
            @click.stop="onPause"
          >
            <span class="hidden sm:inline">Pausar</span>
          </Button>
          <Button
            v-else-if="reminder.status === 'paused'"
            variant="outline"
            size="sm"
            icon="lucide:play"
            class="text-xs"
            @click.stop="onResume"
          >
            <span class="hidden sm:inline">Reativar</span>
          </Button>

          <!-- Completar -->
          <Button
            v-if="reminder.status === 'active' || reminder.status === 'paused'"
            variant="primary"
            size="sm"
            icon="lucide:check"
            class="text-xs"
            @click.stop="onComplete"
          >
            <span class="hidden sm:inline">Completar</span>
          </Button>
        </div>

        <!-- Menu de ações -->
        <div class="relative">
          <ActionDropdown>
            <ActionItem label="Editar" icon="lucide:edit" @click="onEdit" />
            <ActionItem
              v-if="reminder.status !== 'cancelled'"
              label="Cancelar"
              icon="lucide:x"
              variant="warning"
              @click="onCancel"
            />
            <ActionItem
              label="Excluir"
              icon="lucide:trash-2"
              variant="danger"
              @click="onDelete"
            />
          </ActionDropdown>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { Reminder } from '~/types';

const props = defineProps<{ reminder: Reminder }>()

const emit = defineEmits<{
  select: [reminder: Reminder]
  edit: [reminder: Reminder]
  pause: [reminder: Reminder]
  resume: [reminder: Reminder]
  complete: [reminder: Reminder]
  cancel: [reminder: Reminder]
  delete: [reminder: Reminder]
}>()

const { formatCurrency, formatDateTime } = useApi()
const {
  formatPriority,
  formatStatus,
  formatRecurrence,
  formatNotificationChannel,
  getPriorityBadgeVariant,
  getStatusBadgeVariant,
  pauseReminder,
  resumeReminder,
  completeReminder,
  cancelReminder,
  deleteReminder
} = useReminders()

const onPause = async () => {
  try {
    await pauseReminder(props.reminder.id)
    emit('pause', props.reminder)
  } catch (err) {
    // Error handling is done in the composable
  }
}

const onResume = async () => {
  try {
    await resumeReminder(props.reminder.id)
    emit('resume', props.reminder)
  } catch (err) {
    // Error handling is done in the composable
  }
}

const onComplete = async () => {
  try {
    await completeReminder(props.reminder.id)
    emit('complete', props.reminder)
  } catch (err) {
    // Error handling is done in the composable
  }
}

const onCancel = async () => {
  if (!confirm('Tem certeza que deseja cancelar este lembrete?')) return
  try {
    await cancelReminder(props.reminder.id)
    emit('cancel', props.reminder)
  } catch (err) {
    // Error handling is done in the composable
  }
}

const onEdit = () => {
  emit('edit', props.reminder)
}

const onDelete = async () => {
  if (!confirm('Tem certeza que deseja excluir este lembrete? Esta ação não pode ser desfeita.')) return
  try {
    await deleteReminder(props.reminder.id)
    emit('delete', props.reminder)
  } catch (err) {
    // Error handling is done in the composable
  }
}
</script>
