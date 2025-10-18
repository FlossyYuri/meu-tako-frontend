<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
  >
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- Filtro por Status -->
      <div class="flex-1">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Status
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in statusOptions"
            :key="status.value"
            :class="statusButtonClasses(status.value)"
            @click="updateStatusFilter(status.value)"
          >
            <Icon v-if="status.icon" :name="status.icon" class="w-4 h-4" />
            {{ status.label }}
            <Badge
              v-if="status.count !== undefined"
              size="sm"
              variant="default"
            >
              {{ status.count }}
            </Badge>
          </button>
        </div>
      </div>

      <!-- Filtro por Prioridade -->
      <div class="flex-1">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Prioridade
        </label>
        <Select
          v-model="filters.priority"
          :options="priorityOptions"
          placeholder="Todas as prioridades"
          @update:model-value="emit('update:filters', filters)"
        />
      </div>

      <!-- Ordenação -->
      <div class="flex-1">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Ordenar por
        </label>
        <div class="flex gap-2">
          <Select
            v-model="filters.sortBy"
            :options="sortOptions"
            @update:model-value="emit('update:filters', filters)"
          />
          <Button
            :variant="filters.sortOrder === 'asc' ? 'primary' : 'outline'"
            size="sm"
            icon="lucide:arrow-up"
            @click="toggleSortOrder"
          />
          <Button
            :variant="filters.sortOrder === 'desc' ? 'primary' : 'outline'"
            size="sm"
            icon="lucide:arrow-down"
            @click="toggleSortOrder"
          />
        </div>
      </div>

      <!-- Limpar Filtros -->
      <div class="flex items-end">
        <Button
          variant="outline"
          size="sm"
          icon="lucide:x"
          @click="clearFilters"
        >
          Limpar
        </Button>
      </div>
    </div>

    <!-- Filtros Ativos -->
    <div
      v-if="hasActiveFilters"
      class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm text-gray-600 dark:text-gray-400"
          >Filtros ativos:</span
        >
        <Badge
          v-if="filters.status !== 'all'"
          variant="info"
          size="sm"
          @click="updateStatusFilter('all')"
        >
          {{ getStatusLabel(filters.status) }} ×
        </Badge>
        <Badge
          v-if="filters.priority !== 'all'"
          variant="info"
          size="sm"
          @click="updatePriorityFilter('all')"
        >
          {{ getPriorityLabel(filters.priority) }} ×
        </Badge>
        <Badge
          v-if="filters.sortBy !== 'scheduledFor'"
          variant="info"
          size="sm"
          @click="updateSortFilter('scheduledFor')"
        >
          {{ getSortLabel(filters.sortBy) }} ×
        </Badge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReminderStatus, ReminderPriority } from '~/types';

interface Filters {
  status: ReminderStatus | 'all'
  priority: ReminderPriority | 'all'
  sortBy: 'scheduledFor' | 'priority' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

interface StatusOption {
  value: ReminderStatus | 'all'
  label: string
  icon?: string
  count?: number
}

const props = withDefaults(defineProps<{
  filters: Filters
  statusCounts?: Record<ReminderStatus | 'all', number>
}>(), {
  statusCounts: () => ({})
})

const emit = defineEmits<{
  'update:filters': [filters: Filters]
}>()

const statusOptions: StatusOption[] = [
  { value: 'all', label: 'Todos', icon: 'lucide:list', count: props.statusCounts.all },
  { value: 'active', label: 'Ativos', icon: 'lucide:play', count: props.statusCounts.active },
  { value: 'paused', label: 'Pausados', icon: 'lucide:pause', count: props.statusCounts.paused },
  { value: 'completed', label: 'Concluídos', icon: 'lucide:check', count: props.statusCounts.completed },
  { value: 'cancelled', label: 'Cancelados', icon: 'lucide:x', count: props.statusCounts.cancelled }
]

const priorityOptions = [
  { value: 'all', label: 'Todas as prioridades' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' }
]

const sortOptions = [
  { value: 'scheduledFor', label: 'Data agendada' },
  { value: 'priority', label: 'Prioridade' },
  { value: 'createdAt', label: 'Data de criação' }
]

const filters = reactive({ ...props.filters })

const hasActiveFilters = computed(() => {
  return filters.status !== 'all' ||
         filters.priority !== 'all' ||
         filters.sortBy !== 'scheduledFor' ||
         filters.sortOrder !== 'asc'
})

const statusButtonClasses = (status: ReminderStatus | 'all') => {
  const baseClasses = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200'
  const isActive = filters.status === status
  const activeClasses = isActive
    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'

  return [baseClasses, activeClasses].join(' ')
}

const updateStatusFilter = (status: ReminderStatus | 'all') => {
  filters.status = status
  emit('update:filters', filters)
}

const updatePriorityFilter = (priority: ReminderPriority | 'all') => {
  filters.priority = priority
  emit('update:filters', filters)
}

const updateSortFilter = (sortBy: 'scheduledFor' | 'priority' | 'createdAt') => {
  filters.sortBy = sortBy
  emit('update:filters', filters)
}

const toggleSortOrder = () => {
  filters.sortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('update:filters', filters)
}

const clearFilters = () => {
  filters.status = 'all'
  filters.priority = 'all'
  filters.sortBy = 'scheduledFor'
  filters.sortOrder = 'asc'
  emit('update:filters', filters)
}

const getStatusLabel = (status: ReminderStatus | 'all'): string => {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.label || 'Todos'
}

const getPriorityLabel = (priority: ReminderPriority | 'all'): string => {
  const option = priorityOptions.find(opt => opt.value === priority)
  return option?.label || 'Todas'
}

const getSortLabel = (sortBy: string): string => {
  const option = sortOptions.find(opt => opt.value === sortBy)
  return option?.label || 'Data agendada'
}

// Watch for external changes to filters
watch(() => props.filters, (newFilters) => {
  Object.assign(filters, newFilters)
}, { deep: true })
</script>
