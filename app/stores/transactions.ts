import { defineStore } from 'pinia';
import type {
  Transaction,
  Income,
  Expense,
  CreateIncomeRequest,
  CreateExpenseRequest,
  TransferRequest,
  TransactionFilter,
} from '~/types';

export const useTransactionsStore = defineStore('transactions', () => {
  // State
  const transactions = ref<Transaction[]>([]);
  const incomes = ref<Income[]>([]);
  const expenses = ref<Expense[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<TransactionFilter>({});

  // Getters
  const recentTransactions = computed(() => {
    if (!transactions.value || transactions.value.length === 0) {
      return [];
    }

    return transactions.value
      .filter((transaction) => transaction.date)
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
  });

  const filteredTransactions = computed(() => {
    let filtered = transactions.value;

    if (filters.value.start_date) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        const startDate = new Date(filters.value.start_date!);
        return !isNaN(transactionDate.getTime()) && transactionDate >= startDate;
      });
    }

    if (filters.value.end_date) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        const endDate = new Date(filters.value.end_date!);
        return !isNaN(transactionDate.getTime()) && transactionDate <= endDate;
      });
    }

    if (filters.value.category_id) {
      filtered = filtered.filter(
        (t) => t.category?.category_id === filters.value.category_id
      );
    }

    if (filters.value.wallet_id) {
      filtered = filtered.filter((t) => t.wallet_id === filters.value.wallet_id);
    }

    if (filters.value.type) {
      filtered = filtered.filter((t) => t.type === filters.value.type);
    }

    if (filters.value.min_amount) {
      filtered = filtered.filter((t) => t.amount >= filters.value.min_amount!);
    }

    if (filters.value.max_amount) {
      filtered = filtered.filter((t) => t.amount <= filters.value.max_amount!);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
      return dateB.getTime() - dateA.getTime();
    });
  });

  const totalIncome = computed(() =>
    incomes.value.reduce((total, income) => total + income.amount, 0)
  );

  const totalExpense = computed(() =>
    expenses.value.reduce((total, expense) => total + expense.amount, 0)
  );

  const balance = computed(() => totalIncome.value - totalExpense.value);

  const monthlyIncome = computed(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return incomes.value
      .filter((income) => {
        const incomeDate = new Date(income.date);
        return (
          incomeDate.getMonth() === currentMonth &&
          incomeDate.getFullYear() === currentYear
        );
      })
      .reduce((total, income) => total + income.amount, 0);
  });

  const monthlyExpense = computed(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return expenses.value
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      })
      .reduce((total, expense) => total + expense.amount, 0);
  });

  // Actions
  const fetchTransactions = async (walletId?: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const params = walletId ? { wallet_id: walletId } : {};
      const response = await $fetch<Transaction[]>('/transactions', {
        params,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      transactions.value = response;
      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar transações';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchIncomes = async (walletId?: string, page?: number, limit?: number) => {
    try {
      isLoading.value = true;
      error.value = null;

      const params: Record<string, string | number> = {};
      if (walletId) params.wallet_id = walletId;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const response = await $fetch<Income[]>('/incomes', {
        params,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      incomes.value = response;
      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar receitas';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchIncomeById = async (incomeId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Income>(`/incomes/${incomeId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const idx = incomes.value.findIndex((i) => i.income_id === incomeId);
      if (idx !== -1) incomes.value[idx] = response;
      else incomes.value.push(response);

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar receita';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchExpenses = async (walletId?: string, page?: number, limit?: number) => {
    try {
      isLoading.value = true;
      error.value = null;

      const params: Record<string, string | number> = {};
      if (walletId) params.wallet_id = walletId;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const response = await $fetch<Expense[]>('/expenses', {
        params,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      expenses.value = response;
      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar despesas';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchExpenseById = async (expenseId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Expense>(`/expenses/${expenseId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const idx = expenses.value.findIndex(e => e.expense_id === expenseId);
      if (idx !== -1) expenses.value[idx] = response;
      else expenses.value.push(response);

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar despesa';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createIncome = async (incomeData: CreateIncomeRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Income>('/incomes', {
        method: 'POST',
        body: incomeData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      incomes.value.push(response);

      // Update wallet balance (mantido conforme padrão atual)
      const walletsStore = useWalletsStore();
      const wallet = walletsStore.getWalletById(response.wallet_id);
      if (wallet) {
        walletsStore.updateWalletBalance(
          response.wallet_id,
          wallet.balance + response.amount
        );
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar receita';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createExpense = async (expenseData: CreateExpenseRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Expense>('/expenses', {
        method: 'POST',
        body: expenseData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      expenses.value.push(response);

      // Update wallet balance (mantido conforme padrão atual)
      const walletsStore = useWalletsStore();
      const wallet = walletsStore.getWalletById(response.wallet_id);
      if (wallet) {
        walletsStore.updateWalletBalance(
          response.wallet_id,
          wallet.balance - response.amount
        );
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar despesa';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateIncome = async (
    incomeId: string,
    incomeData: Partial<CreateIncomeRequest>
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Income>(`/incomes/${incomeId}`, {
        method: 'PUT',
        body: incomeData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const index = incomes.value.findIndex((i) => i.income_id === incomeId);
      if (index !== -1) {
        incomes.value[index] = response;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar receita';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateExpense = async (
    expenseId: string,
    expenseData: Partial<CreateExpenseRequest>
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Expense>(`/expenses/${expenseId}`, {
        method: 'PUT',
        body: expenseData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const index = expenses.value.findIndex((e) => e.expense_id === expenseId);
      if (index !== -1) {
        expenses.value[index] = response;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar despesa';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteIncome = async (incomeId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const income = incomes.value.find((i) => i.income_id === incomeId);

      await $fetch(`/incomes/${incomeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      incomes.value = incomes.value.filter((i) => i.income_id !== incomeId);

      // Ajuste de saldo local (espelhando comportamento existente)
      if (income) {
        const walletsStore = useWalletsStore();
        const wallet = walletsStore.getWalletById(income.wallet_id);
        if (wallet) {
          walletsStore.updateWalletBalance(
            income.wallet_id,
            wallet.balance - income.amount
          );
        }
      }

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao deletar receita';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const expense = expenses.value.find((e) => e.expense_id === expenseId);

      await $fetch(`/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      expenses.value = expenses.value.filter((e) => e.expense_id !== expenseId);

      if (expense) {
        const walletsStore = useWalletsStore();
        const wallet = walletsStore.getWalletById(expense.wallet_id);
        if (wallet) {
          walletsStore.updateWalletBalance(
            expense.wallet_id,
            wallet.balance + expense.amount
          );
        }
      }

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao deletar despesa';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const markIncomeAsReceived = async (incomeId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Income>(`/incomes/${incomeId}/receive`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const index = incomes.value.findIndex((i) => i.income_id === incomeId);
      if (index !== -1) {
        incomes.value[index] = response;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao marcar receita como recebida';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const markExpenseAsPaid = async (expenseId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Expense>(`/expenses/${expenseId}/pay`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const index = expenses.value.findIndex((e) => e.expense_id === expenseId);
      if (index !== -1) {
        expenses.value[index] = response;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao marcar despesa como paga';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const transferBetweenWallets = async (transferData: TransferRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Transaction>('/transactions/transfer', {
        method: 'POST',
        body: transferData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      transactions.value.push(response);

      const walletsStore = useWalletsStore();
      const fromWallet = walletsStore.getWalletById(transferData.from_wallet_id);
      const toWallet = walletsStore.getWalletById(transferData.to_wallet_id);

      if (fromWallet) {
        walletsStore.updateWalletBalance(
          transferData.from_wallet_id,
          fromWallet.balance - transferData.amount
        );
      }

      if (toWallet) {
        walletsStore.updateWalletBalance(
          transferData.to_wallet_id,
          toWallet.balance + transferData.amount
        );
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao transferir entre carteiras';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setFilters = (newFilters: TransactionFilter) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const clearFilters = () => {
    filters.value = {};
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    transactions,
    incomes,
    expenses,
    isLoading,
    error,
    filters,

    // Getters
    recentTransactions,
    filteredTransactions,
    totalIncome,
    totalExpense,
    balance,
    monthlyIncome,
    monthlyExpense,

    // Actions
    fetchTransactions,
    fetchIncomes,
    fetchIncomeById,
    fetchExpenses,
    fetchExpenseById,
    createIncome,
    createExpense,
    updateIncome,
    updateExpense,
    deleteIncome,
    deleteExpense,
    markIncomeAsReceived,
    markExpenseAsPaid,
    transferBetweenWallets,
    setFilters,
    clearFilters,
    clearError,
  };
});