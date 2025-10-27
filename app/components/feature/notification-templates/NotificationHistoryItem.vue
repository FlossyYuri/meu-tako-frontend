<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200"
  >
    <div class="flex items-start justify-between">
      <!-- Canal e status -->
      <div class="flex items-center space-x-3">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center"
          :class="channelConfig.bgColor"
        >
          <Icon
            :name="channelConfig.icon"
            class="w-4 h-4"
            :class="channelConfig.iconColor"
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <h4
              class="text-sm font-medium text-gray-900 dark:text-white truncate"
            >
              {{ notification.template }}
            </h4>
            <Badge :variant="statusConfig.variant" size="xs">
              {{ statusConfig.label }}
            </Badge>
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
            {{ notification.recipient }}
          </p>
        </div>
      </div>

      <!-- Timestamps -->
      <div
        class="flex flex-col items-end space-y-1 text-xs text-gray-500 dark:text-gray-400"
      >
        <div v-if="notification.sentAt" class="flex items-center space-x-1">
          <Icon name="lucide:send" class="w-3 h-3" />
          <span>{{ formatDateTime(notification.sentAt) }}</span>
        </div>

        <div
          v-if="notification.deliveredAt"
          class="flex items-center space-x-1"
        >
          <Icon name="lucide:check-circle" class="w-3 h-3 text-green-500" />
          <span>{{ formatDateTime(notification.deliveredAt) }}</span>
        </div>

        <div v-if="notification.readAt" class="flex items-center space-x-1">
          <Icon name="lucide:eye" class="w-3 h-3 text-blue-500" />
          <span>{{ formatDateTime(notification.readAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Conteúdo da notificação -->
    <div
      v-if="showContent"
      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
        {{ notification.content }}
      </div>
    </div>

    <!-- Detalhes expandidos -->
    <div
      v-if="isExpanded"
      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <span class="font-medium text-gray-700 dark:text-gray-300"
            >Canal:</span
          >
          <span
            class="ml-2 text-gray-600 dark:text-gray-400"
            >{{ channelConfig.name }}</span
          >
        </div>

        <div>
          <span class="font-medium text-gray-700 dark:text-gray-300"
            >Status:</span
          >
          <span
            class="ml-2 text-gray-600 dark:text-gray-400"
            >{{ statusConfig.label }}</span
          >
        </div>

        <div>
          <span class="font-medium text-gray-700 dark:text-gray-300"
            >Tentativas:</span
          >
          <span
            class="ml-2 text-gray-600 dark:text-gray-400"
            >{{ notification.retryCount }}</span
          >
        </div>

        <div>
          <span class="font-medium text-gray-700 dark:text-gray-300"
            >Criado:</span
          >
          <span
            class="ml-2 text-gray-600 dark:text-gray-400"
            >{{ formatDateTime(notification.createdAt) }}</span
          >
        </div>
      </div>

      <!-- Conteúdo completo -->
      <div class="mt-3">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
          <div
            class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
          >
            {{ notification.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div
      class="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center space-x-2">
        <button
          @click="toggleExpanded"
          class="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <Icon
            :name="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            class="w-3 h-3 mr-1"
          />
          {{ isExpanded ? 'Menos' : 'Mais' }} detalhes
        </button>
      </div>

      <div class="flex items-center space-x-2">
        <button
          v-if="notification.status === 'failed'"
          @click="$emit('retry', notification)"
          class="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <Icon name="lucide:refresh-cw" class="w-3 h-3 mr-1" />
          Tentar novamente
        </button>

        <button
          @click="$emit('view', notification)"
          class="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <Icon name="lucide:eye" class="w-3 h-3 mr-1" />
          Ver detalhes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationHistory } from '~/types';
// Removido import direto - usar composable

interface Props {
  notification: NotificationHistory;
  showContent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showContent: true
});

defineEmits<{
  retry: [notification: NotificationHistory];
  view: [notification: NotificationHistory];
}>();

// Composables
const { formatDateTime } = useApi();

const isExpanded = ref(false);

// Configurações por canal
const channelConfigs = {
  whatsapp: {
    name: 'WhatsApp',
    icon: 'lucide:message-circle',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  email: {
    name: 'Email',
    icon: 'lucide:mail',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  push: {
    name: 'Push',
    icon: 'lucide:smartphone',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
};

// Configurações por status
const statusConfigs = {
  pending: {
    label: 'Pendente',
    variant: 'secondary' as const
  },
  sent: {
    label: 'Enviado',
    variant: 'info' as const
  },
  delivered: {
    label: 'Entregue',
    variant: 'success' as const
  },
  read: {
    label: 'Lido',
    variant: 'success' as const
  },
  failed: {
    label: 'Falhou',
    variant: 'danger' as const
  }
};

const channelConfig = computed(() => {
  return channelConfigs[props.notification.channel];
});

const statusConfig = computed(() => {
  return statusConfigs[props.notification.status];
});

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>
