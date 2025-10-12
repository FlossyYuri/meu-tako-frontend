import { defineStore } from 'pinia';
import type { Category } from '~/types';

export const useCategoriesStore = defineStore('categories', () => {
  const incomeCategories = ref<Category[]>([]);
  const expenseCategories = ref<Category[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchIncomeCategories = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Category[]>('/income-categories', {
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      incomeCategories.value = data;
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar categorias de receitas';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchExpenseCategories = async (onlyActive = true) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Category[]>('/expense-categories', {
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        query: onlyActive ? { active: true } : undefined,
        baseURL: useRuntimeConfig().public.apiBase,
      });
      expenseCategories.value = data;
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar categorias de despesas';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getIncomeCategoryById = (id: string) =>
    incomeCategories.value.find(c => c.category_id === id);

  const getExpenseCategoryById = (id: string) =>
    expenseCategories.value.find(c => c.category_id === id);

  const clearError = () => (error.value = null);

  return {
    // state
    incomeCategories,
    expenseCategories,
    isLoading,
    error,
    // getters
    getIncomeCategoryById,
    getExpenseCategoryById,
    // actions
    fetchIncomeCategories,
    fetchExpenseCategories,
    clearError,
  };
});