<template>
  <div class="space-y-6">
    <!-- Period Filter -->
    <PeriodFilter
      :show-date-range="true"
      @date-range-change="handleDateRangeChange"
    />

    <!-- Loading State -->
    <div v-if="pending" class="space-y-4">
      <Card>
        <div class="p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
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
      <!-- Summary Card -->
      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Resumo do Período
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDateRange(data.period.startDate, data.period.endDate) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(data.totalExpenses) }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Total de Despesas
              </p>
            </div>
          </div>
        </div>
      </Card>

      <!-- Categories List -->
      <Card v-if="data.categories.length > 0">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Despesas por Categoria
            </h3>
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                :class="sortBy === 'amount' ? 'bg-primary-50 dark:bg-primary-900' : ''"
                @click="sortBy = 'amount'"
              >
                <Icon name="lucide:dollar-sign" class="w-4 h-4 mr-1" />
                Valor
              </Button>
              <Button
                variant="outline"
                size="sm"
                :class="sortBy === 'percentage' ? 'bg-primary-50 dark:bg-primary-900' : ''"
                @click="sortBy = 'percentage'"
              >
                <Icon name="lucide:percent" class="w-4 h-4 mr-1" />
                Percentual
              </Button>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="(item, index) in sortedCategories"
              :key="item.categoryId"
              class="relative"
            >
              <!-- Progress Bar Background -->
              <div
                class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"
              >
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :style="{
                    width: `${item.percentage}%`,
                    backgroundColor: generateColor(item.categoryName)
                  }"
                />
              </div>

              <!-- Category Item -->
              <div
                class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium"
                    :style="{ backgroundColor: generateColor(item.categoryName) }"
                  >
                    {{ index + 1 }}
                  </div>
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
        </div>
      </Card>

      <!-- Chart Section -->
      <div
        v-if="data.categories.length > 0"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <!-- Pie Chart -->
        <Card>
          <div class="p-6">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
              Distribuição por Categoria
            </h3>
            <div class="h-64">
              <SimpleChart
                title="Gráfico de Pizza"
                description="Distribuição das despesas por categoria"
                icon="lucide:pie-chart"
                :data="chartData"
                :colors="chartColors"
              />
            </div>
          </div>
        </Card>

        <!-- Bar Chart -->
        <Card>
          <div class="p-6">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
              Comparação de Valores
            </h3>
            <div class="h-64">
              <SimpleChart
                title="Gráfico de Barras"
                description="Comparação dos valores por categoria"
                icon="lucide:bar-chart-3"
                :data="chartData"
                :colors="chartColors"
              />
            </div>
          </div>
        </Card>
      </div>

      <!-- Empty State -->
      <Card v-if="data.categories.length === 0">
        <div class="p-12 text-center">
          <Icon
            name="lucide:pie-chart"
            class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma despesa encontrada
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Não há despesas para o período selecionado.
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryReport } from '~/types';

const { fetchCategoryReport, formatCurrency, formatDateRange, generateChartColors } = useReports();

// State
const selectedStartDate = ref('');
const selectedEndDate = ref('');
const sortBy = ref<'amount' | 'percentage'>('amount');

// Initialize dates
const initializeDates = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);

  selectedStartDate.value = start.toISOString().split('T')[0];
  selectedEndDate.value = end.toISOString().split('T')[0];
};

// Fetch data
const { data, pending, error, refresh } = await useAsyncData(
  'category-report',
  async () => {
    if (!selectedStartDate.value || !selectedEndDate.value) {
      throw new Error('Datas não selecionadas');
    }
    return await fetchCategoryReport(selectedStartDate.value, selectedEndDate.value);
  },
  {
    watch: [selectedStartDate, selectedEndDate]
  }
);

// Computed
const sortedCategories = computed(() => {
  if (!data.value?.categories) return [];

  return [...data.value.categories].sort((a, b) => {
    if (sortBy.value === 'amount') {
      return b.totalAmount - a.totalAmount;
    } else {
      return b.percentage - a.percentage;
    }
  });
});

const chartData = computed(() => {
  if (!data.value?.categories) return [];

  return data.value.categories.map(category => ({
    name: category.categoryName,
    value: category.totalAmount,
    label: category.categoryName
  }));
});

const chartColors = computed(() => {
  return generateChartColors(data.value?.categories.length || 0);
});

// Methods
const handleDateRangeChange = (range: { startDate: string; endDate: string }) => {
  selectedStartDate.value = range.startDate;
  selectedEndDate.value = range.endDate;
};

const generateColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.abs(hash).toString(16).substring(0, 6);
  return `#${color.padEnd(6, '0')}`;
};

// Initialize
onMounted(() => {
  initializeDates();
});
</script>
