<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Histórico de Notificações
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Visualize o histórico de todas as notificações enviadas
        </p>
      </div>

      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <Button
          variant="outline"
          :disabled="historyLoading"
          @click="loadHistory"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          Atualizar
        </Button>

        <Button @click="navigateTo('/admin/notification-templates')">
          <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Voltar para Templates
        </Button>
      </div>
    </div>

    <!-- Filtros -->
    <Card>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Select
              v-model="filters.channel"
              label="Canal"
              :options="channelFilterOptions"
            />
          </div>

          <div>
            <Select
              v-model="filters.status"
              label="Status"
              :options="statusFilterOptions"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Data Inicial
            </label>
            <Input v-model="filters.startDate" type="text" />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Data Final
            </label>
            <Input v-model="filters.endDate" type="text" />
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ pagination.total }} notificações encontradas
          </div>

          <Button variant="outline" size="sm" @click="clearFilters">
            <Icon name="lucide:x" class="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>
    </Card>

    <!-- Loading state -->
    <div v-if="historyLoading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <Icon
        name="lucide:alert-circle"
        class="w-12 h-12 text-red-500 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Erro ao carregar histórico
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
      <Button @click="loadHistoryWithFilters">
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
        Tentar novamente
      </Button>
    </div>

    <!-- Empty state -->
    <div v-else-if="history.length === 0" class="text-center py-12">
      <Icon
        name="lucide:bell-off"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhuma notificação encontrada
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        {{ hasActiveFilters ? 'Tente ajustar os filtros ou envie algumas notificações.' : 'Ainda não há notificações no histórico.' }}
      </p>
      <Button @click="navigateTo('/admin/notification-templates')">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Criar Template
      </Button>
    </div>

    <!-- Lista de notificações -->
    <div v-else class="space-y-4">
      <NotificationHistoryItem
        v-for="notification in history"
        :key="notification.id"
        :notification="notification"
        @retry="handleRetry"
        @view="handleView"
      />
    </div>

    <!-- Paginação -->
    <div
      v-if="pagination.totalPages > 1"
      class="flex items-center justify-center space-x-2"
    >
      <Button
        variant="outline"
        size="sm"
        :disabled="pagination.page === 1"
        @click="previousPage"
      >
        <Icon name="lucide:chevron-left" class="w-4 h-4" />
      </Button>

      <div class="flex items-center space-x-1">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Página {{ pagination.page }} de {{ pagination.totalPages }}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        :disabled="pagination.page === pagination.totalPages"
        @click="nextPage"
      >
        <Icon name="lucide:chevron-right" class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationTemplatesStore } from '~/stores/notificationTemplates';
import type { NotificationHistory } from '~/types';

// Store
const store = useNotificationTemplatesStore();

// Estado local
const filters = ref({
  channel: '',
  status: '',
  startDate: '',
  endDate: ''
});

// Computed
const history = computed(() => store.history);
const pagination = computed(() => store.pagination);
const historyLoading = computed(() => store.historyLoading);
const error = computed(() => store.error);

const hasActiveFilters = computed(() => {
  return filters.value.channel !== '' ||
         filters.value.status !== '' ||
         filters.value.startDate !== '' ||
         filters.value.endDate !== '';
});

// Opções para os filtros
const channelFilterOptions = [
  { value: '', label: 'Todos os canais' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push' }
];

const statusFilterOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'pending', label: 'Pendente' },
  { value: 'sent', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'read', label: 'Lido' },
  { value: 'failed', label: 'Falhou' }
];

// Métodos
const loadHistoryWithFilters = async () => {
  const params: any = {
    page: pagination.value.page,
    limit: pagination.value.limit
  };

  if (filters.value.channel) params.channel = filters.value.channel;
  if (filters.value.status) params.status = filters.value.status;
  if (filters.value.startDate) params.startDate = filters.value.startDate;
  if (filters.value.endDate) params.endDate = filters.value.endDate;

  await store.fetchNotificationHistory(params);
};

const clearFilters = () => {
  filters.value = {
    channel: '',
    status: '',
    startDate: '',
    endDate: ''
  };
  loadHistoryWithFilters();
};

const previousPage = () => {
  if (pagination.value.page > 1) {
    store.setPage(pagination.value.page - 1);
    loadHistoryWithFilters();
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    store.setPage(pagination.value.page + 1);
    loadHistoryWithFilters();
  }
};

const handleRetry = async (notification: NotificationHistory) => {
  // Implementar retry de notificação
  console.log('Retry notification:', notification);
};

const handleView = (notification: NotificationHistory) => {
  // Implementar visualização detalhada
  console.log('View notification:', notification);
};

// Lifecycle
onMounted(() => {
  loadHistoryWithFilters();
});

// Watch para filtros
watch(() => filters.value, () => {
  store.setPage(1);
  loadHistoryWithFilters();
}, { deep: true });
</script>
