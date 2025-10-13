<template>
  <div class="space-y-6">
    <!-- Period Filter -->
    <PeriodFilter @filter-change="handleFilterChange" />

    <!-- Loading State -->
    <div v-if="pending" class="space-y-4">
      <Card>
        <div class="p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 mb-4">
        <Icon name="lucide:alert-circle" class="w-12 h-12 mx-auto" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Erro ao carregar relatório
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        {{ error }}
      </p>
      <Button @click="() => refresh()"> Tentar Novamente </Button>
    </div>

    <!-- Report Content -->
    <div v-else-if="data" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center"
                >
                  <Icon
                    name="lucide:trending-up"
                    class="w-5 h-5 text-green-600 dark:text-green-400"
                  />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total de Receitas
                </p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(data.totalIncome) }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-md flex items-center justify-center"
                >
                  <Icon
                    name="lucide:trending-down"
                    class="w-5 h-5 text-red-600 dark:text-red-400"
                  />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total de Despesas
                </p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(data.totalExpenses) }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center"
                >
                  <Icon
                    name="lucide:wallet"
                    class="w-5 h-5 text-blue-600 dark:text-blue-400"
                  />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Saldo Líquido
                </p>
                <p
                  class="text-2xl font-semibold"
                  :class="data.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ formatCurrency(data.netIncome) }}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Income Details -->
      <Card v-if="data.incomeDetails.length > 0">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Receitas por Categoria
          </h3>

          <div class="space-y-4">
            <div
              v-for="item in data.incomeDetails"
              :key="item.categoryId"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: generateColor(item.categoryName) }"
                ></div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ item.categoryName }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ item.transactionCount }} transação(ões)
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(item.totalAmount) }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ item.percentage }}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Expense Details -->
      <Card v-if="data.expenseDetails.length > 0">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Despesas por Categoria
          </h3>

          <div class="space-y-4">
            <div
              v-for="item in data.expenseDetails"
              :key="item.categoryId"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: generateColor(item.categoryName) }"
                ></div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ item.categoryName }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ item.transactionCount }} transação(ões)
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(item.totalAmount) }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ item.percentage }}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Empty State -->
      <Card
        v-if="data.incomeDetails.length === 0 && data.expenseDetails.length === 0"
      >
        <div class="p-12 text-center">
          <Icon
            name="lucide:bar-chart-3"
            class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma transação encontrada
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Não há transações para o período selecionado.
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MonthlyReport } from '~/types';

const { fetchMonthlyReport, formatCurrency, generateChartColors } = useReports();

// State
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);

// Fetch data
const { data, pending, error, refresh } = await useAsyncData(
  'monthly-report',
  () => fetchMonthlyReport(selectedYear.value, selectedMonth.value),
  {
    watch: [selectedYear, selectedMonth]
  }
);

// Methods
const handleFilterChange = (filter: { year: number; month: number }) => {
  selectedYear.value = filter.year;
  selectedMonth.value = filter.month;
};

const generateColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.abs(hash).toString(16).substring(0, 6);
  return `#${color.padEnd(6, '0')}`;
};
</script>
