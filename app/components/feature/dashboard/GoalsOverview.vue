<template>
  <Card class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Metas Ativas
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
          Ver Todas
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div class="space-y-3">
        <Skeleton class="h-20 w-full" />
        <Skeleton class="h-20 w-full" />
      </div>
    </div>

    <div v-else-if="hasActiveGoals" class="space-y-4">
      <div
        v-for="goal in activeGoals.slice(0, 3)"
        :key="goal.goal_id"
        class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="font-medium text-gray-900 dark:text-white mb-1">
              {{ goal.title }}
            </h3>
            <p
              v-if="goal.description"
              class="text-sm text-gray-600 dark:text-gray-400"
            >
              {{ goal.description }}
            </p>
          </div>
          <Badge :variant="goal.is_active ? 'default' : 'secondary'" size="sm">
            {{ goal.is_active ? 'Ativa' : 'Inativa' }}
          </Badge>
        </div>

        <!-- Progress Bar -->
        <div class="mb-3">
          <div
            class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1"
          >
            <span>Progresso</span>
            <span>{{ progressPercentage(goal) }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage(goal)}%` }"
            ></div>
          </div>
        </div>

        <!-- Amounts -->
        <div class="flex justify-between items-center text-sm">
          <div class="text-gray-600 dark:text-gray-400">
            <span
              class="font-medium"
              >{{ formatCurrency(goal.current_amount) }}</span
            >
            <span> de {{ formatCurrency(goal.target_amount) }}</span>
          </div>
          <div class="text-gray-500 dark:text-gray-400">
            {{ formatDate(goal.end_date) }}
          </div>
        </div>

        <!-- Days Remaining -->
        <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <Icon name="lucide:calendar" class="w-3 h-3 inline mr-1" />
          {{ daysRemaining(goal) }} dias restantes
        </div>
      </div>

      <!-- Show More Button -->
      <div v-if="activeGoals.length > 3" class="text-center pt-2">
        <Button variant="ghost" size="sm" @click="$emit('view-all')">
          Ver mais
          {{ activeGoals.length - 3 }}
          meta{{ activeGoals.length - 3 > 1 ? 's' : '' }}
          <Icon name="lucide:chevron-right" class="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <Icon name="lucide:target" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Nenhuma meta ativa encontrada
      </p>
      <Button variant="outline" @click="$emit('create-goal')">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Criar Primeira Meta
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
interface Props {
  activeGoals: Goal[];
  isLoading: boolean;
  hasActiveGoals: boolean;
}

defineProps<Props>();

defineEmits<{
  refresh: [];
  'view-all': [];
  'create-goal': [];
}>();

const { formatCurrency, formatDate } = useApi();

const progressPercentage = (goal: Goal): number => {
  if (goal.target_amount === 0) return 0;
  return Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
};

const daysRemaining = (goal: Goal): number => {
  const endDate = new Date(goal.end_date);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
</script>
