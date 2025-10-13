<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/goals"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para metas
      </NuxtLink>
    </div>

    <Card v-if="goal">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ goal.title }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDisplayDate(goal.start_date) }} -
              {{ formatDisplayDate(goal.end_date) }}
            </p>
          </div>
          <Badge :variant="goal.status === 'active' ? 'success' : 'default'">
            {{ goal.status === 'active' ? 'Ativa' : 'Inativa' }}
          </Badge>
        </div>
      </template>

      <div class="space-y-8">
        <!-- Informações da Meta -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Descrição -->
          <div v-if="goal.description" class="space-y-2">
            <h3 class="font-medium text-gray-900 dark:text-white">Descrição</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ goal.description }}
            </p>
          </div>

          <!-- Categoria -->
          <div v-if="goal.category" class="space-y-2">
            <h3 class="font-medium text-gray-900 dark:text-white">Categoria</h3>
            <div class="flex items-center space-x-2">
              <Icon name="lucide:tag" class="w-4 h-4 text-gray-500" />
              <span
                class="text-sm text-gray-600 dark:text-gray-400"
                >{{ goal.category.name }}</span
              >
            </div>
            <p
              v-if="goal.category.description"
              class="text-xs text-gray-500 dark:text-gray-500"
            >
              {{ goal.category.description }}
            </p>
          </div>
        </div>

        <!-- Progresso -->
        <GoalProgress :goal="goal" :progress="progress" />

        <!-- Contribuir -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-3">
            Contribuir para a meta
          </h3>
          <ContributeForm :goal-id="id" @contributed="reload" />
        </div>

        <!-- Edição -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-4">
            Editar meta
          </h3>
          <GoalForm v-if="goal" mode="edit" :goal="goal" @saved="onSaved" />
          <div v-if="goalsStore.error" class="text-center mt-3">
            <p class="text-sm text-error-600 dark:text-error-400">
              {{ goalsStore.error }}
            </p>
          </div>
        </div>

        <!-- Excluir -->
        <div
          class="border border-error-200 dark:border-error-800 rounded-lg p-4 bg-error-50 dark:bg-error-900"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-error-900 dark:text-error-100">
                Excluir meta
              </h3>
              <p class="text-sm text-error-700 dark:text-error-300">
                Esta ação não pode ser desfeita
              </p>
            </div>
            <Button variant="error" icon="lucide:trash-2" @click="onDelete">
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <div v-else class="py-12">
      <LoadingSpinner center text="Carregando meta..." />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const goalsStore = useGoalsStore()
const { formatDisplayDate } = useApi()
const { success, error: showError } = useNotifications()

const goal = ref<import('~/types').Goal | null>(null)
const progress = ref<import('~/types').GoalProgress | null>(null)

const load = async () => {
  const data = await goalsStore.getGoalById(id)
  goal.value = data
  try {
    progress.value = await goalsStore.getGoalProgress(id)
  } catch {
    progress.value = null
  }
}

const reload = async () => {
  try {
    await load()
  } catch (err: any) {
    showError('Erro ao recarregar dados', err?.message)
  }
}

const onSaved = async () => {
  success('Meta salva com sucesso')
  await reload()
}

const onDelete = async () => {
  if (!confirm('Tem certeza que deseja excluir esta meta?')) return
  try {
    await goalsStore.deleteGoal(id)
    success('Meta excluída')
    await navigateTo('/goals')
  } catch (err: any) {
    showError('Erro ao excluir meta', err?.message)
  }
}

onMounted(async () => {
  try {
    await load()
  } catch (err: any) {
    showError('Erro ao carregar meta', err?.message)
  }
})
</script>
