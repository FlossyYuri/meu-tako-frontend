<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Metas Financeiras
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Defina e acompanhe suas metas financeiras
        </p>
      </div>
      <Button to="/goals/new" variant="primary" icon="lucide:plus">
        Nova Meta
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="goalsStore.isLoading" class="py-12">
      <LoadingSpinner center text="Carregando metas..." />
    </div>

    <!-- Goals Grid -->
    <div
      v-else-if="goalsStore.goals.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <Card
        v-for="goal in goalsStore.goals"
        :key="goal.goal_id"
        class="hover:shadow-lg transition-shadow duration-200"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ goal.title }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDisplayDate(goal.start_date) }} -
                {{ formatDisplayDate(goal.end_date) }}
              </p>
            </div>
            <Badge :variant="goal.is_active ? 'success' : 'default'" size="sm">
              {{ goal.is_active ? 'Ativa' : 'Inativa' }}
            </Badge>
          </div>

          <div class="space-y-3">
            <!-- Progress Bar -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600 dark:text-gray-400">Progresso</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ calculatePercentage(goal.current_amount, goal.target_amount) }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${calculatePercentage(goal.current_amount, goal.target_amount)}%` }"
                />
              </div>
            </div>

            <!-- Amounts -->
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Arrecadado</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(goal.current_amount) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Meta</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(goal.target_amount) }}
                </span>
              </div>
              <div
                class="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2"
              >
                <span class="text-sm text-gray-600 dark:text-gray-400">Restante</span>
                <span class="font-semibold text-primary-600">
                  {{ formatCurrency(goal.target_amount - goal.current_amount) }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <p v-if="goal.description" class="text-sm text-gray-600 dark:text-gray-400">
              {{ goal.description }}
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="lucide:target" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhuma meta encontrada
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Crie sua primeira meta financeira para começar a economizar
      </p>
      <Button to="/goals/new" variant="primary" icon="lucide:plus">
        Criar Primeira Meta
      </Button>
    </div>

    <!-- Error -->
    <div v-if="goalsStore.error" class="text-center text-error-600 dark:text-error-400">
      {{ goalsStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const goalsStore = useGoalsStore()
const { formatCurrency, formatDisplayDate, calculatePercentage } = useApi()
const { error: showError } = useNotifications()

onMounted(async () => {
  try {
    await goalsStore.fetchGoals()
  } catch (err) {
    showError('Erro ao carregar metas')
  }
})
</script>