<template>
  <Card class="group hover:shadow-lg transition-all duration-200 h-full">
    <div class="p-4 h-full flex flex-col">
      <!-- Header compacto -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-3 min-w-0 flex-1">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="channelConfig.bgColor"
          >
            <Icon
              :name="channelConfig.icon"
              class="w-4 h-4"
              :class="channelConfig.iconColor"
            />
          </div>
          <div class="min-w-0 flex-1">
            <h3
              v-if="template.title"
              class="font-semibold text-gray-900 dark:text-white"
            >
              {{ template.title }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ template.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ channelConfig.name }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2 flex-shrink-0">
          <ActionDropdown size="sm">
            <ActionItem
              label="Preview"
              icon="lucide:eye"
              @click="$emit('preview', template)"
            />
            <ActionItem
              label="Editar"
              icon="lucide:edit"
              @click="$emit('edit', template)"
            />
            <ActionItem
              label="Duplicar"
              icon="lucide:copy"
              @click="$emit('duplicate', template)"
            />
            <ActionItem
              label="Testar"
              icon="lucide:send"
              @click="$emit('test', template)"
            />
            <ActionItem
              label="Deletar"
              icon="lucide:trash-2"
              variant="danger"
              @click="$emit('delete', template)"
            />
          </ActionDropdown>
        </div>
      </div>

      <!-- Informações essenciais -->
      <div class="flex-1 flex flex-col justify-between">
        <!-- Informações essenciais -->
        <div class="mt-auto">
          <div
            class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
          >
            <div class="flex items-center space-x-1">
              <Icon name="lucide:code" class="w-3 h-3" />
              <span
                >{{ template.variables.length }}
                variável{{ template.variables.length > 1 ? 's' : '' }}</span
              >
            </div>
            <Badge
              :variant="template.isActive ? 'success' : 'default'"
              size="sm"
            >
              {{ template.isActive ? 'Ativo' : 'Inativo' }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NotificationTemplate } from '../../../types';

interface Props {
  template: NotificationTemplate;
}

const props = defineProps<Props>();

defineEmits<{
  preview: [template: NotificationTemplate];
  edit: [template: NotificationTemplate];
  duplicate: [template: NotificationTemplate];
  test: [template: NotificationTemplate];
  delete: [template: NotificationTemplate];
}>();

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

const template = computed(() => props.template);

const channelConfig = computed(() => {
  return channelConfigs[template.value.channel];
});

// Função simples para formatação de tempo relativo
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Agora';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}sem`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mes`;
};
</script>
