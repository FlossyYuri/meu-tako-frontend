import { defineStore } from 'pinia';
import type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  ContributeToGoalRequest,
  GoalProgress,
} from '~/types';

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchGoals = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Goal[]>('/goals', {
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      goals.value = data;
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar metas';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getGoalById = async (goalId: string) => {
    return $fetch<Goal>(`/goals/${goalId}`, {
      headers: { Authorization: `Bearer ${useAuthStore().token}` },
      baseURL: useRuntimeConfig().public.apiBase,
    });
  };

  const createGoal = async (payload: CreateGoalRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const created = await $fetch<Goal>('/goals', {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      goals.value.push(created);
      return created;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar meta';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateGoal = async (goalId: string, payload: UpdateGoalRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await $fetch<Goal>(`/goals/${goalId}`, {
        method: 'PUT',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      const idx = goals.value.findIndex((g) => g.goal_id === goalId);
      if (idx !== -1) goals.value[idx] = updated;
      return updated;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar meta';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteGoal = async (goalId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch(`/goals/${goalId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      goals.value = goals.value.filter((g) => g.goal_id !== goalId);
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao deletar meta';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const contributeToGoal = async (
    goalId: string,
    payload: ContributeToGoalRequest
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await $fetch<Goal>(`/goals/${goalId}/contribute`, {
        method: 'PATCH',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      const idx = goals.value.findIndex((g) => g.goal_id === goalId);
      if (idx !== -1) goals.value[idx] = updated;
      return updated;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao contribuir para a meta';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getGoalProgress = async (goalId: string) => {
    return $fetch<GoalProgress>(`/goals/${goalId}/progress`, {
      headers: { Authorization: `Bearer ${useAuthStore().token}` },
      baseURL: useRuntimeConfig().public.apiBase,
    });
  };

  const clearError = () => (error.value = null);

  return {
    goals,
    isLoading,
    error,
    fetchGoals,
    getGoalById,
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    getGoalProgress,
    clearError,
  };
});
