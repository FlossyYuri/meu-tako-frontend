import type { MonthlyReport, CategoryReport, TrendReport } from '~/types';

export const useReports = () => {
  const { api, handleApiError, formatCurrency } = useApi();
  const { showNotification } = useNotifications();

  // Monthly Report
  const fetchMonthlyReport = async (year: number, month: number) => {
    try {
      const response = await api<MonthlyReport>(
        `/reports/monthly?year=${year}&month=${month}`
      );
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      showNotification({
        type: 'error',
        title: 'Erro ao carregar relatório mensal',
        message: errorMessage,
      });
      throw error;
    }
  };

  // Category Report
  const fetchCategoryReport = async (startDate: string, endDate: string) => {
    try {
      const response = await api<CategoryReport>(
        `/reports/category?startDate=${startDate}&endDate=${endDate}`
      );
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      showNotification({
        type: 'error',
        title: 'Erro ao carregar relatório por categoria',
        message: errorMessage,
      });
      throw error;
    }
  };

  // Trends Report
  const fetchTrendsReport = async (months: number = 6) => {
    try {
      const response = await api<TrendReport>(
        `/reports/trends?months=${months}`
      );
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      showNotification({
        type: 'error',
        title: 'Erro ao carregar relatório de tendências',
        message: errorMessage,
      });
      throw error;
    }
  };

  // Helper functions
  const getMonthName = (month: number): string => {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return months[month - 1] || '';
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  };

  const getDateRange = (months: number = 6) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const formatPeriod = (year: number, month: number): string => {
    return `${getMonthName(month)} ${year}`;
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const generateChartColors = (count: number): string[] => {
    const colors = [
      '#3B82F6',
      '#EF4444',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#84CC16',
      '#F97316',
      '#6366F1',
    ];

    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  };

  const prepareChartData = (
    data: any[],
    labelField: string,
    valueField: string
  ) => {
    return {
      labels: data.map((item) => item[labelField]),
      datasets: [
        {
          data: data.map((item) => item[valueField]),
          backgroundColor: generateChartColors(data.length),
          borderWidth: 0,
        },
      ],
    };
  };

  const prepareTrendChartData = (
    trends: Array<{
      month: number;
      year: number;
      income: number;
      expenses: number;
      net: number;
    }>
  ) => {
    const labels = trends.map(
      (trend) => `${getMonthName(trend.month)} ${trend.year}`
    );

    return {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: trends.map((trend) => trend.income),
          backgroundColor: '#10B981',
          borderColor: '#10B981',
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Despesas',
          data: trends.map((trend) => trend.expenses),
          backgroundColor: '#EF4444',
          borderColor: '#EF4444',
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Saldo Líquido',
          data: trends.map((trend) => trend.net),
          backgroundColor: '#3B82F6',
          borderColor: '#3B82F6',
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };

  return {
    // API calls
    fetchMonthlyReport,
    fetchCategoryReport,
    fetchTrendsReport,

    // Helper functions
    getMonthName,
    getCurrentMonth,
    getDateRange,
    formatPeriod,
    formatDateRange,
    calculatePercentage,
    generateChartColors,
    prepareChartData,
    prepareTrendChartData,
    formatCurrency,
  };
};
