<template>
  <Card
    class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    @click="emit('select', goal)"
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
        <div class="flex flex-col gap-1">
          <Badge
            :variant="goal.status === 'active' ? 'success' : 'default'"
            size="sm"
          >
            {{ goal.status === 'active' ? 'Ativa' : 'Inativa' }}
          </Badge>
          <Badge v-if="goal.is_completed" variant="success" size="sm">
            Concluída
          </Badge>
          <Badge v-else-if="goal.is_expired" variant="error" size="sm">
            Expirada
          </Badge>
        </div>
      </div>

      <div class="space-y-3">
        <!-- Progresso -->
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600 dark:text-gray-400">Progresso</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ percent }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(100, percent)}%` }"
            />
          </div>
        </div>

        <!-- Valores -->
        <div class="grid grid-cols-2 gap-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Arrecadado</span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {{ formatCurrency(goal.current_amount) }}
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Meta</span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {{ formatCurrency(goal.target_amount) }}
            </span>
          </div>
        </div>

        <!-- Restante -->
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Restante</span>
          <span class="font-medium text-gray-900 dark:text-white">
            {{ formatCurrency(goal.target_amount - goal.current_amount) }}
          </span>
        </div>

        <!-- Informações adicionais -->
        <div
          v-if="goal.days_remaining !== undefined || goal.monthly_target"
          class="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400"
        >
          <div
            v-if="goal.days_remaining !== undefined"
            class="flex items-center gap-1"
          >
            <Icon name="lucide:calendar" class="w-3 h-3" />
            <span>{{ goal.days_remaining }} dias restantes</span>
          </div>
          <div v-if="goal.monthly_target" class="flex items-center gap-1">
            <Icon name="lucide:target" class="w-3 h-3" />
            <span>Meta mensal: {{ formatCurrency(goal.monthly_target) }}</span>
          </div>
        </div>

        <!-- Categoria -->
        <div v-if="goal.category" class="flex items-center space-x-1">
          <Icon name="lucide:tag" class="w-3 h-3 text-gray-400" />
          <span
            class="text-xs text-gray-500 dark:text-gray-400"
            >{{ goal.category.name }}</span
          >
        </div>

        <p
          v-if="goal.description"
          class="text-sm text-gray-600 dark:text-gray-400"
        >
          {{ goal.description }}
        </p>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { Goal } from '~/types';

const props = defineProps<{ goal: Goal }>()
const emit = defineEmits<{ select: [goal: Goal] }>()

const { formatCurrency, formatDisplayDate, calculatePercentage } = useApi()

const percent = computed(() => calculatePercentage(props.goal.current_amount, props.goal.target_amount))
</script>
