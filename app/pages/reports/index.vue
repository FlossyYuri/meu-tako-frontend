<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader title="Relatórios" subtitle="Análise detalhada das suas finanças" />

    <!-- Period Selector -->
    <Card>
      <div class="p-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="period in periods"
            :key="period.value"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="[
              selectedPeriod === period.value
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            ]"
            @click="selectedPeriod = period.value"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </Card>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-2 bg-success-100 rounded-lg">
            <Icon name="lucide:arrow-up" class="w-6 h-6 text-success-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Receitas</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(reportData.totalIncome) }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-2 bg-error-100 rounded-lg">
            <Icon name="lucide:arrow-down" class="w-6 h-6 text-error-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(reportData.totalExpense) }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <Icon name="lucide:wallet" class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(reportData.balance) }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <Icon name="lucide:trending-up" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Economia</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(reportData.savings) }}
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Charts and Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Expense Categories -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Despesas por Categoria
          </h2>
        </template>

        <div class="space-y-4">
          <div
            v-for="category in reportData.expenseCategories"
            :key="category.name"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: category.color }" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ category.name }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatCurrency(category.amount) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ category.percentage }}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      <!-- Income Categories -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Receitas por Categoria
          </h2>
        </template>

        <div class="space-y-4">
          <div
            v-for="category in reportData.incomeCategories"
            :key="category.name"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: category.color }" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ category.name }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatCurrency(category.amount) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ category.percentage }}%
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Monthly Trend -->
    <Card>
      <template #header>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Tendência Mensal
        </h2>
      </template>

      <div class="p-6">
        <div class="text-center">
          <Icon name="lucide:bar-chart-3" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Gráfico em desenvolvimento
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Em breve você poderá visualizar gráficos detalhados das suas
            finanças
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { formatCurrency } = useApi()

// State
const selectedPeriod = ref('month')

const periods = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'quarter', label: 'Este trimestre' },
  { value: 'year', label: 'Este ano' }
]

// Mock report data
const reportData = ref({
  totalIncome: 5000,
  totalExpense: 3200,
  balance: 1800,
  savings: 800,
  expenseCategories: [
    { name: 'Alimentação', amount: 1200, percentage: 37.5, color: '#ef4444' },
    { name: 'Transporte', amount: 800, percentage: 25, color: '#3b82f6' },
    { name: 'Lazer', amount: 600, percentage: 18.75, color: '#10b981' },
    { name: 'Saúde', amount: 400, percentage: 12.5, color: '#f59e0b' },
    { name: 'Outros', amount: 200, percentage: 6.25, color: '#8b5cf6' }
  ],
  incomeCategories: [
    { name: 'Salário', amount: 4500, percentage: 90, color: '#10b981' },
    { name: 'Freelance', amount: 300, percentage: 6, color: '#3b82f6' },
    { name: 'Investimentos', amount: 200, percentage: 4, color: '#f59e0b' }
  ]
})

// Watch for period changes
watch(selectedPeriod, (newPeriod) => {
  console.log('Period changed to:', newPeriod)
})
</script>