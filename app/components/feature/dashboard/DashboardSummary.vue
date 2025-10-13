<template>
  <Card class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Resumo Geral
      </h2>
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
    </div>

    <div v-if="isLoading" class="space-y-4">
      <Skeleton class="h-16 w-full" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton class="h-20 w-full" />
        <Skeleton class="h-20 w-full" />
        <Skeleton class="h-20 w-full" />
      </div>
    </div>

    <div v-else-if="summary" class="space-y-6">
      <!-- Saldo Total -->
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Saldo Total</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ totalBalanceFormatted }}
        </p>
      </div>

      <!-- Cards de Resumo Mensal -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Receitas Mensais -->
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-green-600 dark:text-green-400 font-medium">
                Receitas
              </p>
              <p
                class="text-lg font-semibold text-green-700 dark:text-green-300"
              >
                {{ monthlyIncomeFormatted }}
              </p>
            </div>
            <Icon
              name="lucide:trending-up"
              class="w-6 h-6 text-green-600 dark:text-green-400"
            />
          </div>
        </div>

        <!-- Despesas Mensais -->
        <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-red-600 dark:text-red-400 font-medium">
                Despesas
              </p>
              <p class="text-lg font-semibold text-red-700 dark:text-red-300">
                {{ monthlyExpensesFormatted }}
              </p>
            </div>
            <Icon
              name="lucide:trending-down"
              class="w-6 h-6 text-red-600 dark:text-red-400"
            />
          </div>
        </div>

        <!-- Saldo Líquido -->
        <div
          :class="[
            'p-4 rounded-lg',
            isPositiveNet
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-orange-50 dark:bg-orange-900/20'
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <p
                :class="[
                  'text-sm font-medium',
                  isPositiveNet
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-orange-600 dark:text-orange-400'
                ]"
              >
                Saldo Líquido
              </p>
              <p
                :class="[
                  'text-lg font-semibold',
                  isPositiveNet
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-orange-700 dark:text-orange-300'
                ]"
              >
                {{ monthlyNetFormatted }}
              </p>
            </div>
            <Icon
              :name="isPositiveNet ? 'lucide:plus-circle' : 'lucide:minus-circle'"
              :class="[
                'w-6 h-6',
                isPositiveNet
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Estatísticas Adicionais -->
      <div
        class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ summary.activeGoals }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Metas Ativas</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ summary.activeLimits }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Limites Ativos</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ summary.wallets }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Carteiras</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ recentTransactionsCount }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Transações</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <Icon
        name="lucide:alert-circle"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-500 dark:text-gray-400">
        Não foi possível carregar o resumo
      </p>
    </div>
  </Card>
</template>

<script setup lang="ts">
interface Props {
  summary: DashboardSummary | null;
  recentTransactionsCount: number;
  isLoading: boolean;
  totalBalanceFormatted: string;
  monthlyIncomeFormatted: string;
  monthlyExpensesFormatted: string;
  monthlyNetFormatted: string;
  isPositiveNet: boolean;
}

defineProps<Props>();

defineEmits<{
  refresh: [];
}>();
</script>
