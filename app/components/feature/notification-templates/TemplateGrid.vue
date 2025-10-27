<template>
  <div class="space-y-6">
    <!-- Header com filtros -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Templates de Notificação
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Gerencie seus templates de notificação
        </p>
      </div>

      <div class="flex items-center space-x-3">
        <Button variant="primary" @click="$emit('create')">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-4">
      <Select
        v-model="selectedChannel"
        :options="channelOptions"
        placeholder="Todos os canais"
        class="w-full sm:w-48"
      />

      <Select
        v-model="selectedStatus"
        :options="statusOptions"
        placeholder="Todos os status"
        class="w-full sm:w-48"
      />

      <Input
        v-model="searchQuery"
        placeholder="Buscar templates..."
        class="w-full sm:w-64"
      >
        <template #prefix>
          <Icon name="lucide:search" class="w-4 h-4" />
        </template>
      </Input>
    </div>

    <!-- Grid de templates -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TemplateCard
        v-for="template in filteredTemplates"
        :key="template.id"
        :template="template"
        @preview="$emit('preview', $event)"
        @edit="$emit('edit', $event)"
        @duplicate="$emit('duplicate', $event)"
        @test="$emit('test', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>

    <!-- Estado vazio -->
    <div v-if="filteredTemplates.length === 0" class="text-center py-12">
      <Icon name="lucide:mail" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhum template encontrado
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        {{ searchQuery || selectedChannel || selectedStatus 
          ? 'Tente ajustar os filtros para encontrar templates.' 
          : 'Comece criando seu primeiro template de notificação.'
        }}
      </p>
      <Button variant="primary" @click="$emit('create')">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Criar Primeiro Template
      </Button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card v-for="i in 6" :key="i" class="animate-pulse">
        <div class="p-4">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div class="flex-1">
              <div
                class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"
              />
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { NotificationTemplate } from '../../../types';

interface Props {
  templates: NotificationTemplate[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  templates: () => [],
  loading: false
});

defineEmits<{
  create: [];
  preview: [template: NotificationTemplate];
  edit: [template: NotificationTemplate];
  duplicate: [template: NotificationTemplate];
  test: [template: NotificationTemplate];
  delete: [template: NotificationTemplate];
}>();

// Filtros
const selectedChannel = ref('');
const selectedStatus = ref('');
const searchQuery = ref('');

// Opções para os selects
const channelOptions = [
  { value: '', label: 'Todos os canais' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push' }
];

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' }
];

// Templates filtrados
const filteredTemplates = computed(() => {
  let filtered = props.templates || [];

  // Filtro por canal
  if (selectedChannel.value) {
    filtered = filtered.filter(t => t.channel === selectedChannel.value);
  }

  // Filtro por status
  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active';
    filtered = filtered.filter(t => t.isActive === isActive);
  }

  // Filtro por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.title?.toLowerCase().includes(query) ||
      t.content.toLowerCase().includes(query)
    );
  }

  return filtered;
});
</script>
