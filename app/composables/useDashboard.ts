import type {
  DashboardData,
  DashboardSummary,
  DashboardBalance,
  Transaction,
  Goal,
  Limit,
} from '~/types';

export const useDashboard = () => {
  const { api, handleApiError, formatCurrency } = useApi();
  const { showNotification } = useNotifications();

  // State
  const dashboardData = ref<DashboardData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const summary = computed(() => dashboardData.value?.summary || null);
  const balance = computed(() => dashboardData.value?.balance || null);
  const recentTransactions = computed(
    () => dashboardData.value?.recentTransactions || []
  );
  const activeGoals = computed(() => dashboardData.value?.activeGoals || []);
  const activeLimits = computed(() => dashboardData.value?.activeLimits || []);

  // Actions
  const fetchDashboardData = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Fetch all dashboard data in parallel
      const [
        summaryData,
        balanceData,
        transactionsData,
        goalsData,
        limitsData,
      ] = await Promise.all([
        fetchDashboardSummary(),
        fetchDashboardBalance(),
        fetchRecentTransactions(),
        fetchActiveGoals(),
        fetchActiveLimits(),
      ]);

      dashboardData.value = {
        summary: summaryData,
        balance: balanceData,
        recentTransactions: transactionsData,
        activeGoals: goalsData,
        activeLimits: limitsData,
      };

      return dashboardData.value;
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      error.value = errorMessage;
      showNotification('error', 'Erro ao carregar dashboard', errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
    try {
      const response = await api<DashboardSummary>('/dashboard/summary');
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar resumo do dashboard:', err);
      throw err;
    }
  };

  const fetchDashboardBalance = async (): Promise<DashboardBalance> => {
    try {
      const response = await api<DashboardBalance>('/dashboard/balance');
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar saldo do dashboard:', err);
      throw err;
    }
  };

  const fetchRecentTransactions = async (limit = 5): Promise<Transaction[]> => {
    try {
      const response = await api<Transaction[]>(
        `/transactions?limit=${limit}&sort=date&order=desc`
      );
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar transações recentes:', err);
      return [];
    }
  };

  const fetchActiveGoals = async (): Promise<Goal[]> => {
    try {
      const response = await api<Goal[]>('/goals?status=active');
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar metas ativas:', err);
      return [];
    }
  };

  const fetchActiveLimits = async (): Promise<Limit[]> => {
    try {
      const response = await api<Limit[]>('/limits?is_active=true');
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar limites ativos:', err);
      return [];
    }
  };

  const refreshDashboard = async () => {
    await fetchDashboardData();
  };

  const clearError = () => {
    error.value = null;
  };

  // Computed helpers
  const totalBalanceFormatted = computed(() => {
    if (!summary.value) return formatCurrency(0);
    return formatCurrency(summary.value.totalBalance);
  });

  const monthlyNetFormatted = computed(() => {
    if (!summary.value) return formatCurrency(0);
    return formatCurrency(summary.value.monthlyNet);
  });

  const monthlyIncomeFormatted = computed(() => {
    if (!summary.value) return formatCurrency(0);
    return formatCurrency(summary.value.monthlyIncome);
  });

  const monthlyExpensesFormatted = computed(() => {
    if (!summary.value) return formatCurrency(0);
    return formatCurrency(summary.value.monthlyExpenses);
  });

  const isPositiveNet = computed(() => {
    return summary.value ? summary.value.monthlyNet >= 0 : true;
  });

  const hasActiveGoals = computed(() => {
    return activeGoals.value.length > 0;
  });

  const hasActiveLimits = computed(() => {
    return activeLimits.value.length > 0;
  });

  const hasRecentTransactions = computed(() => {
    return recentTransactions.value.length > 0;
  });

  return {
    // State
    dashboardData: readonly(dashboardData),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Getters
    summary,
    balance,
    recentTransactions,
    activeGoals,
    activeLimits,

    // Computed helpers
    totalBalanceFormatted,
    monthlyNetFormatted,
    monthlyIncomeFormatted,
    monthlyExpensesFormatted,
    isPositiveNet,
    hasActiveGoals,
    hasActiveLimits,
    hasRecentTransactions,

    // Actions
    fetchDashboardData,
    fetchDashboardSummary,
    fetchDashboardBalance,
    fetchRecentTransactions,
    fetchActiveGoals,
    fetchActiveLimits,
    refreshDashboard,
    clearError,
  };
};
