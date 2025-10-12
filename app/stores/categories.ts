import { defineStore } from 'pinia';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '~/types';

export const useCategoriesStore = defineStore('categories', () => {
  const incomeCategories = ref<Category[]>([]);
  const expenseCategories = ref<Category[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Income Categories
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

  const getIncomeCategoryById = (id: string) =>
    incomeCategories.value.find(c => c.category_id === id);

  const getIncomeCategoryRemote = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Category>(`/income-categories/${id}`, {
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      const idx = incomeCategories.value.findIndex(c => c.category_id === id);
      if (idx !== -1) incomeCategories.value[idx] = data;
      else incomeCategories.value.push(data);
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao obter categoria de receita';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createIncomeCategory = async (payload: CreateCategoryRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const created = await $fetch<Category>('/income-categories', {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      incomeCategories.value.push(created);
      return created;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar categoria de receita';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateIncomeCategory = async (categoryId: string, payload: UpdateCategoryRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await $fetch<Category>(`/income-categories/${categoryId}`, {
        method: 'PUT',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      const idx = incomeCategories.value.findIndex(c => c.category_id === categoryId);
      if (idx !== -1) incomeCategories.value[idx] = updated;
      return updated;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar categoria de receita';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteIncomeCategory = async (categoryId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch(`/income-categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      incomeCategories.value = incomeCategories.value.filter(c => c.category_id !== categoryId);
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao deletar categoria de receita';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Expense Categories
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

  const getExpenseCategoryById = (id: string) =>
    expenseCategories.value.find(c => c.category_id === id);

  const getExpenseCategoryRemote = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Category>(`/expense-categories/${id}`, {
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      const idx = expenseCategories.value.findIndex(c => c.category_id === id);
      if (idx !== -1) expenseCategories.value[idx] = data;
      else expenseCategories.value.push(data);
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao obter categoria';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createExpenseCategory = async (payload: CreateCategoryRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const created = await $fetch<Category>('/expense-categories', {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      expenseCategories.value.push(created);
      return created;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar categoria';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateExpenseCategory = async (categoryId: string, payload: UpdateCategoryRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await $fetch<Category>(`/expense-categories/${categoryId}`, {
        method: 'PUT',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      const idx = expenseCategories.value.findIndex(c => c.category_id === categoryId);
      if (idx !== -1) expenseCategories.value[idx] = updated;
      return updated;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar categoria';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteExpenseCategory = async (categoryId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch(`/expense-categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      expenseCategories.value = expenseCategories.value.filter(c => c.category_id !== categoryId);
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao deletar categoria';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleExpenseCategoryActive = async (categoryId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await $fetch<Category>(`/expense-categories/${categoryId}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      const idx = expenseCategories.value.findIndex(c => c.category_id === categoryId);
      if (idx !== -1) expenseCategories.value[idx] = updated;
      return updated;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao alternar status da categoria';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => (error.value = null);

  return {
    // state
    incomeCategories,
    expenseCategories,
    isLoading,
    error,

    // income getters
    getIncomeCategoryById,
    // expense getters
    getExpenseCategoryById,

    // income actions
    fetchIncomeCategories,
    getIncomeCategoryRemote,
    createIncomeCategory,
    updateIncomeCategory,
    deleteIncomeCategory,

    // expense actions
    fetchExpenseCategories,
    getExpenseCategoryRemote,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    toggleExpenseCategoryActive,

    clearError,
  };
});