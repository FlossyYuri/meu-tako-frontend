<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader title="Metas Financeiras" subtitle="Defina e acompanhe suas metas financeiras">
      <template #actions>
        <Button to="/goals/new" variant="primary" icon="lucide:plus">
          Nova Meta
        </Button>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="goalsStore.isLoading" class="py-12">
      <LoadingSpinner center text="Carregando metas..." />
    </div>

    <!-- Goals Grid -->
    <div v-else-if="goalsStore.goals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GoalCard
        v-for="goal in goalsStore.goals"
        :key="goal.goal_id"
        :goal="goal"
        @select="navigateTo(`/goals/${goal.goal_id}`)"
      />
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
import GoalCard from '~/components/feature/goals/GoalCard.vue'

definePageMeta({
  middleware: 'auth'
})

const goalsStore = useGoalsStore()
const { error: showError } = useNotifications()

onMounted(async () => {
  try {
    await goalsStore.fetchGoals()
  } catch (err) {
    showError('Erro ao carregar metas')
  }
})
</script>