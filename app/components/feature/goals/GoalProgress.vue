<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm text-gray-600 dark:text-gray-400">Progresso</span>
      <span class="text-sm font-medium text-gray-900 dark:text-white">
        {{ formatCurrency(currentAmount) }} / {{ formatCurrency(goal.target_amount) }}
        ({{ percent }}%)
      </span>
    </div>
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        class="bg-primary-600 h-2 rounded-full transition-all duration-300"
        :style="{ width: `${Math.min(100, percent)}%` }"
      />
    </div>
    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
      Restante: {{ formatCurrency(Math.max(goal.target_amount - currentAmount, 0)) }}
      <span v-if="progress?.days_remaining !== undefined"> • {{ progress?.days_remaining }} dia(s) restantes</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Goal, GoalProgress } from '~/types';

const props = defineProps<{
  goal: Goal
  progress?: GoalProgress | null
}>()

const { formatCurrency, calculatePercentage } = useApi()

const currentAmount = computed(() => props.goal?.current_amount ?? props.progress?.current_amount ?? 0)
const percent = computed(() => {
  if (props.progress?.percentage !== undefined) return Math.round(props.progress.percentage)
  return calculatePercentage(currentAmount.value, props.goal.target_amount)
})
</script>