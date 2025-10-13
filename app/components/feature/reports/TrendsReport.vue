<template>
  <div class="space-y-6">
    <!-- Period Filter -->
    <Card>
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Período de Análise
        </h3>

        <div class="flex flex-wrap gap-2">
          <Button
            v-for="period in periods"
            :key="period.months"
            :variant="selectedPeriod === period.months ? 'primary' : 'outline'"
            size="sm"
            @click="handlePeriodChange(period.months)"
          >
            {{ period.label }}
          </Button>
        </div>
      </div>
    </Card>

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
                  Receita Média
                </p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(averageIncome) }}
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
                  Despesa Média
                </p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(averageExpenses) }}
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
                  Saldo Médio
                </p>
                <p
                  class="text-2xl font-semibold"
                  :class="averageNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ formatCurrency(averageNet) }}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Trends Chart -->
      <Card v-if="data.trends.length > 0">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Evolução Financeira
          </h3>

          <div class="h-64">
            <SimpleChart
              title="Gráfico de Tendências"
              description="Evolução das receitas, despesas e saldo líquido"
              icon="lucide:line-chart"
              :data="trendsChartData"
              :colors="trendsColors"
            />
          </div>
        </div>
      </Card>

      <!-- Trends Table -->
      <Card v-if="data.trends.length > 0">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detalhes por Mês
          </h3>

          <div class="overflow-x-auto">
            <table
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Período
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Receitas
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Despesas
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Saldo Líquido
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Tendência
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr
                  v-for="(trend, index) in data.trends"
                  :key="`${trend.year}-${trend.month}`"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ getMonthName(trend.month) }} {{ trend.year }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                  >
                    {{ formatCurrency(trend.income) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                  >
                    {{ formatCurrency(trend.expenses) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      class="font-medium"
                      :class="trend.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                    >
                      {{ formatCurrency(trend.net) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex items-center">
                      <Icon
                        v-if="index > 0"
                        :name="getTrendIcon(trend, data.trends[index - 1])"
                        :class="getTrendColor(trend, data.trends[index - 1])"
                        class="w-4 h-4 mr-1"
                      />
                      <span class="text-gray-500 dark:text-gray-400">
                        {{ getTrendText(trend, data.trends[index - 1]) }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <!-- Empty State -->
      <Card v-if="data.trends.length === 0">
        <div class="p-12 text-center">
          <Icon
            name="lucide:trending-up"
            class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum dado encontrado
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Não há dados suficientes para gerar o relatório de tendências.
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrendReport } from '~/types';

const { fetchTrendsReport, formatCurrency, getMonthName } = useReports();

// State
const selectedPeriod = ref(6);

// Period options
const periods = [
  { months: 3, label: '3 Meses' },
  { months: 6, label: '6 Meses' },
  { months: 12, label: '12 Meses' },
  { months: 24, label: '24 Meses' }
];

// Fetch data
const { data, pending, error, refresh } = await useAsyncData(
  'trends-report',
  () => fetchTrendsReport(selectedPeriod.value),
  {
    watch: [selectedPeriod]
  }
);

// Computed
const averageIncome = computed(() => {
  if (!data.value?.trends.length) return 0;
  const total = data.value.trends.reduce((sum, trend) => sum + trend.income, 0);
  return total / data.value.trends.length;
});

const averageExpenses = computed(() => {
  if (!data.value?.trends.length) return 0;
  const total = data.value.trends.reduce((sum, trend) => sum + trend.expenses, 0);
  return total / data.value.trends.length;
});

const averageNet = computed(() => {
  if (!data.value?.trends.length) return 0;
  const total = data.value.trends.reduce((sum, trend) => sum + trend.net, 0);
  return total / data.value.trends.length;
});

const trendsChartData = computed(() => {
  if (!data.value?.trends.length) return [];

  return data.value.trends.map(trend => ({
    name: `${getMonthName(trend.month)} ${trend.year}`,
    value: trend.net,
    label: `${getMonthName(trend.month)} ${trend.year}`
  }));
});

const trendsColors = computed(() => {
  return ['#3B82F6', '#EF4444', '#10B981'];
});

// Methods
const handlePeriodChange = (months: number) => {
  selectedPeriod.value = months;
};

const getTrendIcon = (current: any, previous: any) => {
  if (!previous) return 'lucide:minus';

  const netDiff = current.net - previous.net;
  if (netDiff > 0) return 'lucide:trending-up';
  if (netDiff < 0) return 'lucide:trending-down';
  return 'lucide:minus';
};

const getTrendColor = (current: any, previous: any) => {
  if (!previous) return 'text-gray-400';

  const netDiff = current.net - previous.net;
  if (netDiff > 0) return 'text-green-500';
  if (netDiff < 0) return 'text-red-500';
  return 'text-gray-400';
};

const getTrendText = (current: any, previous: any) => {
  if (!previous) return 'Primeiro mês';

  const netDiff = current.net - previous.net;
  const percentage = previous.net !== 0 ? Math.abs((netDiff / previous.net) * 100) : 0;

  if (netDiff > 0) return `+${formatCurrency(netDiff)} (+${percentage.toFixed(1)}%)`;
  if (netDiff < 0) return `${formatCurrency(netDiff)} (-${percentage.toFixed(1)}%)`;
  return 'Sem alteração';
};
</script>
