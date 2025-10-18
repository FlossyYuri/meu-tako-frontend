<template>
  <div class="space-y-6">
    <!-- Header com título e status -->
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {{ reminder.title }}
        </h1>
        <p
          v-if="reminder.description"
          class="text-gray-600 dark:text-gray-400 mb-4"
        >
          {{ reminder.description }}
        </p>
        <div class="flex items-center gap-3">
          <Badge
            :variant="getPriorityBadgeVariant(reminder.priority)"
            size="lg"
          >
            <Icon name="lucide:flag" class="w-4 h-4 mr-1" />
            {{ formatPriority(reminder.priority) }}
          </Badge>
          <Badge :variant="getStatusBadgeVariant(reminder.status)" size="lg">
            <Icon :name="getStatusIcon(reminder.status)" class="w-4 h-4 mr-1" />
            {{ formatStatus(reminder.status) }}
          </Badge>
          <Badge variant="info" size="lg">
            <Icon name="lucide:repeat" class="w-4 h-4 mr-1" />
            {{ formatRecurrence(reminder.recurrence) }}
          </Badge>
        </div>
      </div>
    </div>

    <!-- Informações principais -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Data e Hora -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <Icon name="lucide:calendar" class="w-5 h-5 text-gray-500" />
          <h3 class="font-medium text-gray-900 dark:text-white">Data e Hora</h3>
        </div>
        <p class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ formatDateTime(reminder.scheduledFor) }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ getRelativeTime(reminder.scheduledFor) }}
        </p>
      </div>

      <!-- Valor -->
      <div
        v-if="reminder.amount"
        class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
      >
        <div class="flex items-center gap-2 mb-2">
          <Icon name="lucide:dollar-sign" class="w-5 h-5 text-gray-500" />
          <h3 class="font-medium text-gray-900 dark:text-white">Valor</h3>
        </div>
        <p class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ formatCurrency(reminder.amount) }}
        </p>
      </div>

      <!-- Canais de Notificação -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="lucide:bell" class="w-5 h-5 text-gray-500" />
          <h3 class="font-medium text-gray-900 dark:text-white">
            Canais de Notificação
          </h3>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="channel in reminder.notificationChannels"
            :key="channel"
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-500"
          >
            <Icon
              :name="formatNotificationChannel(channel).icon"
              class="w-4 h-4 text-gray-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ formatNotificationChannel(channel).label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recorrência -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <Icon name="lucide:repeat" class="w-5 h-5 text-gray-500" />
          <h3 class="font-medium text-gray-900 dark:text-white">Recorrência</h3>
        </div>
        <p class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ formatRecurrence(reminder.recurrence) }}
        </p>
        <p
          v-if="reminder.recurrence !== 'once'"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          Este lembrete se repete
          {{ getRecurrenceDescription(reminder.recurrence) }}
        </p>
      </div>
    </div>

    <!-- Histórico -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-3">
        <Icon name="lucide:clock" class="w-5 h-5 text-gray-500" />
        <h3 class="font-medium text-gray-900 dark:text-white">Histórico</h3>
      </div>
      <div class="space-y-2">
        <div
          class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
        >
          <span class="text-sm text-gray-600 dark:text-gray-400"
            >Criado em</span
          >
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ formatDateTime(reminder.createdAt) }}
          </span>
        </div>
        <div
          class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
        >
          <span class="text-sm text-gray-600 dark:text-gray-400"
            >Última atualização</span
          >
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ formatDateTime(reminder.updatedAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Informações adicionais -->
    <div
      v-if="reminder.recurrence !== 'once'"
      class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
    >
      <div class="flex items-start gap-2">
        <Icon name="lucide:info" class="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-1">
            Lembrete Recorrente
          </h4>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            Este lembrete será executado
            {{ getRecurrenceDescription(reminder.recurrence) }}. Você pode
            pausar ou cancelar a recorrência a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reminder } from '~/types';

const props = defineProps<{
  reminder: Reminder
}>()

const { formatCurrency, formatDateTime } = useApi()
const {
  formatPriority,
  formatStatus,
  formatRecurrence,
  formatNotificationChannel,
  getPriorityBadgeVariant,
  getStatusBadgeVariant
} = useReminders()

const getStatusIcon = (status: string) => {
  const icons = {
    active: 'lucide:play',
    paused: 'lucide:pause',
    completed: 'lucide:check',
    cancelled: 'lucide:x'
  }
  return icons[status as keyof typeof icons] || 'lucide:circle'
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000)

  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds)
    if (absDiff < 60) return 'há poucos segundos'
    if (absDiff < 3600) return `há ${Math.floor(absDiff / 60)} minuto${Math.floor(absDiff / 60) > 1 ? 's' : ''}`
    if (absDiff < 86400) return `há ${Math.floor(absDiff / 3600)} hora${Math.floor(absDiff / 3600) > 1 ? 's' : ''}`
    return `há ${Math.floor(absDiff / 86400)} dia${Math.floor(absDiff / 86400) > 1 ? 's' : ''}`
  } else {
    if (diffInSeconds < 60) return 'em poucos segundos'
    if (diffInSeconds < 3600) return `em ${Math.floor(diffInSeconds / 60)} minuto${Math.floor(diffInSeconds / 60) > 1 ? 's' : ''}`
    if (diffInSeconds < 86400) return `em ${Math.floor(diffInSeconds / 3600)} hora${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''}`
    return `em ${Math.floor(diffInSeconds / 86400)} dia${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''}`
  }
}

const getRecurrenceDescription = (recurrence: string) => {
  const descriptions = {
    daily: 'diariamente',
    weekly: 'semanalmente',
    monthly: 'mensalmente',
    yearly: 'anualmente'
  }
  return descriptions[recurrence as keyof typeof descriptions] || 'periodicamente'
}
</script>
