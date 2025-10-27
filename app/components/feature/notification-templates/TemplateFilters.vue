<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
  >
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Filtros por canal -->
      <div class="flex-1">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Canal
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="channel in channels"
            :key="channel.type"
            @click="setChannelFilter(channel.type)"
            class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="isChannelSelected(channel.type)
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
          >
            <Icon :name="channel.icon" class="w-4 h-4 mr-2" />
            {{ channel.name }}
            <Badge
              v-if="channelCounts[channel.type] > 0"
              variant="secondary"
              size="xs"
              class="ml-2"
            >
              {{ channelCounts[channel.type] }}
            </Badge>
          </button>

          <button
            @click="setChannelFilter(null)"
            class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="!channel
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
          >
            <Icon name="lucide:grid-3x3" class="w-4 h-4 mr-2" />
            Todos
            <Badge
              v-if="channelCounts.total > 0"
              variant="secondary"
              size="xs"
              class="ml-2"
            >
              {{ channelCounts.total }}
            </Badge>
          </button>
        </div>
      </div>

      <!-- Filtro por status -->
      <div class="flex-1">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Status
        </label>
        <div class="flex gap-2">
          <button
            @click="setStatusFilter(null)"
            class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="!status
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
          >
            Todos
          </button>

          <button
            @click="setStatusFilter('active')"
            class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="status === 'active'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
          >
            <Icon name="lucide:check-circle" class="w-4 h-4 mr-2" />
            Ativos
            <Badge
              v-if="activeCount > 0"
              variant="success"
              size="xs"
              class="ml-2"
            >
              {{ activeCount }}
            </Badge>
          </button>

          <button
            @click="setStatusFilter('inactive')"
            class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="status === 'inactive'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
          >
            <Icon name="lucide:x-circle" class="w-4 h-4 mr-2" />
            Inativos
            <Badge
              v-if="inactiveCount > 0"
              variant="secondary"
              size="xs"
              class="ml-2"
            >
              {{ inactiveCount }}
            </Badge>
          </button>
        </div>
      </div>

      <!-- Busca -->
      <div class="flex-1">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Buscar
        </label>
        <div class="relative">
          <Icon
            name="lucide:search"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <Input
            v-model="searchQuery"
            placeholder="Nome, título ou conteúdo..."
            class="pl-10"
          />
        </div>
      </div>
    </div>

    <!-- Ações dos filtros -->
    <div
      class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div
        class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
      >
        <span v-if="hasActiveFilters">
          {{ filteredCount }} de {{ totalCount }} templates
        </span>
        <span v-else> {{ totalCount }} templates </span>
      </div>

      <div class="flex items-center space-x-2">
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <Icon name="lucide:x" class="w-4 h-4 mr-1" />
          Limpar filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { NotificationChannel } from '~/types';

interface Props {
  channel: NotificationChannel['type'] | null;
  status: 'active' | 'inactive' | null;
  search: string;
  channelCounts: Record<NotificationChannel['type'], number> & { total: number };
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
  filteredCount: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:channel': [channel: NotificationChannel['type'] | null];
  'update:status': [status: 'active' | 'inactive' | null];
  'update:search': [search: string];
  'clear-filters': [];
}>();

// Canais disponíveis
const channels: Array<{
  type: NotificationChannel['type'];
  name: string;
  icon: string;
}> = [
  { type: 'whatsapp', name: 'WhatsApp', icon: 'lucide:message-circle' },
  { type: 'email', name: 'Email', icon: 'lucide:mail' },
  { type: 'push', name: 'Push', icon: 'lucide:smartphone' }
];

// Search query reativo
const searchQuery = ref(props.search);

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null;

// Watch para emitir mudanças na busca
watch(searchQuery, (newValue) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    emit('update:search', newValue);
  }, 300);
});

// Computed para verificar se há filtros ativos
const hasActiveFilters = computed(() => {
  return props.channel !== null ||
         props.status !== null ||
         props.search !== '';
});

// Métodos para emitir eventos
const setChannelFilter = (channel: NotificationChannel['type'] | null) => {
  emit('update:channel', channel);
};

const setStatusFilter = (status: 'active' | 'inactive' | null) => {
  emit('update:status', status);
};

const clearFilters = () => {
  emit('clear-filters');
  searchQuery.value = '';
};

// Verificar se canal está selecionado
const isChannelSelected = (channel: NotificationChannel['type']) => {
  return props.channel === channel;
};
</script>
