<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Histórico de Contribuições
      </h3>
      <Badge v-if="contributions && contributions.length > 0" variant="default">
        {{ contributions.length }}
        contribuição{{ contributions.length > 1 ? 'ões' : '' }}
      </Badge>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div
          class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      </div>
    </div>

    <div
      v-else-if="!contributions || contributions.length === 0"
      class="text-center py-8"
    >
      <div class="text-gray-400 dark:text-gray-500 mb-2">
        <Icon name="lucide:target" class="w-12 h-12 mx-auto" />
      </div>
      <p class="text-gray-500 dark:text-gray-400">
        Nenhuma contribuição registrada ainda
      </p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
        Faça sua primeira contribuição para esta meta
      </p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="contribution in contributions"
        :key="contribution.contribution_id"
        class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
              >
                <Icon
                  name="lucide:plus"
                  class="w-5 h-5 text-green-600 dark:text-green-400"
                />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(contribution.amount) }}
                </p>
                <Badge variant="success" size="sm"> Contribuição </Badge>
              </div>
              <p
                v-if="contribution.description"
                class="text-sm text-gray-600 dark:text-gray-400 mt-1"
              >
                {{ contribution.description }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {{ formatRelativeTime(contribution.contributed_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="contributions && contributions.length > 0"
      class="pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">
          Total contribuído:
        </span>
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ formatCurrency(totalContributed) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GoalContribution } from '~/types'

interface Props {
  contributions?: GoalContribution[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  contributions: () => [],
  isLoading: false
})

const { formatCurrency, formatRelativeTime } = useApi()

const totalContributed = computed(() => {
  if (!props.contributions || !Array.isArray(props.contributions)) return 0
  return props.contributions.reduce((total, contribution) => {
    const amount = typeof contribution.amount === 'string' ? parseFloat(contribution.amount) : contribution.amount
    return total + (isNaN(amount) ? 0 : amount)
  }, 0)
})
</script>
