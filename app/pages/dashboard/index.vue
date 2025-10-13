<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <PageHeader title="Dashboard" subtitle="Visão geral das suas finanças">
      <template #actions>
        <Button
          variant="outline"
          :disabled="isLoading"
          @click="refreshDashboard"
        >
          <Icon
            name="lucide:refresh-cw"
            :class="{ 'animate-spin': isLoading }"
            class="w-4 h-4 mr-2"
          />
          Atualizar
        </Button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <div v-if="isLoading && !dashboardData" class="p-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton class="h-64 w-full" />
        <Skeleton class="h-64 w-full" />
        <Skeleton class="h-64 w-full" />
        <Skeleton class="h-64 w-full" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !dashboardData" class="p-6">
      <Card class="p-8 text-center">
        <Icon
          name="lucide:alert-circle"
          class="w-16 h-16 text-red-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Erro ao carregar dashboard
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ error }}
        </p>
        <Button @click="refreshDashboard">
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </Card>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="py-6 space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Dashboard Summary -->
        <DashboardSummary
          :summary="summary"
          :recent-transactions-count="recentTransactions.length"
          :is-loading="isLoading"
          :total-balance-formatted="totalBalanceFormatted"
          :monthly-income-formatted="monthlyIncomeFormatted"
          :monthly-expenses-formatted="monthlyExpensesFormatted"
          :monthly-net-formatted="monthlyNetFormatted"
          :is-positive-net="isPositiveNet"
          @refresh="refreshDashboard"
        />

        <!-- Balance Overview -->
        <BalanceOverview
          :balance="balance"
          :is-loading="isLoading"
          :total-balance-formatted="totalBalanceFormatted"
          @refresh="refreshDashboard"
          @view-wallets="navigateTo('/wallets')"
          @add-wallet="navigateTo('/wallets/new')"
          @transfer="navigateTo('/transactions/transfer')"
        />
      </div>

      <!-- Goals and Limits -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Goals Overview -->
        <GoalsOverview
          :active-goals="activeGoals"
          :is-loading="isLoading"
          :has-active-goals="hasActiveGoals"
          @refresh="refreshDashboard"
          @view-all="navigateTo('/goals')"
          @create-goal="navigateTo('/goals/new')"
        />

        <!-- Limits Overview -->
        <LimitsOverview
          :active-limits="activeLimits"
          :is-loading="isLoading"
          :has-active-limits="hasActiveLimits"
          @refresh="refreshDashboard"
          @view-all="navigateTo('/limits')"
          @create-limit="navigateTo('/limits/new')"
          @view-limit="(limitId) => navigateTo(`/limits/${limitId}`)"
        />
      </div>

      <!-- Recent Transactions -->
      <div class="grid grid-cols-1 gap-6">
        <RecentTransactions
          :recent-transactions="recentTransactions"
          :is-loading="isLoading"
          :has-recent-transactions="hasRecentTransactions"
          @refresh="refreshDashboard"
          @view-all="navigateTo('/transactions')"
          @view-transaction="(transactionId) => navigateTo(`/transactions/${transactionId}`)"
          @create-transaction="navigateTo('/transactions/new')"
        />
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          variant="outline"
          class="h-20 flex flex-col items-center justify-center space-y-2"
          @click="navigateTo('/transactions/new')"
        >
          <Icon name="lucide:plus-circle" class="w-6 h-6" />
          <span class="text-sm font-medium">Nova Transação</span>
        </Button>

        <Button
          variant="outline"
          class="h-20 flex flex-col items-center justify-center space-y-2"
          @click="navigateTo('/goals/new')"
        >
          <Icon name="lucide:target" class="w-6 h-6" />
          <span class="text-sm font-medium">Nova Meta</span>
        </Button>

        <Button
          variant="outline"
          class="h-20 flex flex-col items-center justify-center space-y-2"
          @click="navigateTo('/limits/new')"
        >
          <Icon name="lucide:shield" class="w-6 h-6" />
          <span class="text-sm font-medium">Novo Limite</span>
        </Button>

        <Button
          variant="outline"
          class="h-20 flex flex-col items-center justify-center space-y-2"
          @click="navigateTo('/reports')"
        >
          <Icon name="lucide:bar-chart-3" class="w-6 h-6" />
          <span class="text-sm font-medium">Relatórios</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  layout: 'sidebar',
  middleware: 'auth'
});

// Composables
const {
  dashboardData,
  isLoading,
  error,
  summary,
  balance,
  recentTransactions,
  activeGoals,
  activeLimits,
  totalBalanceFormatted,
  monthlyIncomeFormatted,
  monthlyExpensesFormatted,
  monthlyNetFormatted,
  isPositiveNet,
  hasActiveGoals,
  hasActiveLimits,
  hasRecentTransactions,
  fetchDashboardData,
  refreshDashboard,
  clearError
} = useDashboard();

// Lifecycle
onMounted(async () => {
  try {
    await fetchDashboardData();
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
  }
});

// Auto-refresh every 5 minutes
let refreshInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  refreshInterval = setInterval(() => {
    if (!isLoading.value) {
      refreshDashboard();
    }
  }, 5 * 60 * 1000); // 5 minutes
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Clear error when component is mounted
onMounted(() => {
  clearError();
});
</script>
