<template>
  <Card class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Limites Ativos
      </h2>
      <div class="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('refresh')"
          :disabled="isLoading"
        >
          <Icon
            name="lucide:refresh-cw"
            :class="{ 'animate-spin': isLoading }"
            class="w-4 h-4"
          />
        </Button>
        <Button variant="outline" size="sm" @click="$emit('view-all')">
          Ver Todos
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div class="space-y-3">
        <Skeleton class="h-20 w-full" />
        <Skeleton class="h-20 w-full" />
      </div>
    </div>

    <div v-else-if="hasActiveLimits" class="space-y-4">
      <div
        v-for="limit in activeLimits.slice(0, 3)"
        :key="limit.limit_id"
        class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-1">
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ limit.category?.name || 'Categoria' }}
              </h3>
              <Badge
                :variant="limit.is_active ? 'default' : 'secondary'"
                size="sm"
              >
                {{ limit.is_active ? 'Ativo' : 'Inativo' }}
              </Badge>
            </div>
            <p
              v-if="limit.description"
              class="text-sm text-gray-600 dark:text-gray-400"
            >
              {{ limit.description }}
            </p>
          </div>
        </div>

        <!-- Limit Amount -->
        <div class="mb-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Limite Mensal
            </span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(limit.limit_amount) }}
            </span>
          </div>
        </div>

        <!-- Period -->
        <div
          class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400"
        >
          <div class="flex items-center space-x-1">
            <Icon name="lucide:calendar" class="w-3 h-3" />
            <span
              >{{ formatDate(limit.start_date) }} -
              {{ formatDate(limit.end_date) }}</span
            >
          </div>
          <div class="flex items-center space-x-1">
            <Icon name="lucide:clock" class="w-3 h-3" />
            <span>{{ daysRemaining(limit) }} dias restantes</span>
          </div>
        </div>

        <!-- Status Indicator -->
        <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Icon
                :name="getStatusIcon(limit)"
                :class="getStatusColor(limit)"
                class="w-4 h-4"
              />
              <span
                :class="getStatusTextColor(limit)"
                class="text-sm font-medium"
              >
                {{ getStatusText(limit) }}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              @click="$emit('view-limit', limit.limit_id)"
            >
              <Icon name="lucide:eye" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Show More Button -->
      <div v-if="activeLimits.length > 3" class="text-center pt-2">
        <Button variant="ghost" size="sm" @click="$emit('view-all')">
          Ver mais
          {{ activeLimits.length - 3 }}
          limite{{ activeLimits.length - 3 > 1 ? 's' : '' }}
          <Icon name="lucide:chevron-right" class="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <Icon name="lucide:shield" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Nenhum limite ativo encontrado
      </p>
      <Button variant="outline" @click="$emit('create-limit')">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Criar Primeiro Limite
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
interface Props {
  activeLimits: Limit[];
  isLoading: boolean;
  hasActiveLimits: boolean;
}

defineProps<Props>();

defineEmits<{
  refresh: [];
  'view-all': [];
  'create-limit': [];
  'view-limit': [limitId: string];
}>();

const { formatCurrency, formatDate } = useApi();

const daysRemaining = (limit: Limit): number => {
  const endDate = new Date(limit.end_date);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const getStatusIcon = (limit: Limit): string => {
  const days = daysRemaining(limit);
  if (days === 0) return 'lucide:check-circle';
  if (days <= 7) return 'lucide:alert-triangle';
  return 'lucide:clock';
};

const getStatusColor = (limit: Limit): string => {
  const days = daysRemaining(limit);
  if (days === 0) return 'text-green-600 dark:text-green-400';
  if (days <= 7) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-blue-600 dark:text-blue-400';
};

const getStatusTextColor = (limit: Limit): string => {
  const days = daysRemaining(limit);
  if (days === 0) return 'text-green-600 dark:text-green-400';
  if (days <= 7) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-blue-600 dark:text-blue-400';
};

const getStatusText = (limit: Limit): string => {
  const days = daysRemaining(limit);
  if (days === 0) return 'Expirado';
  if (days <= 7) return 'Expirando em breve';
  return 'Ativo';
};
</script>
