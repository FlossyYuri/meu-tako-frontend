import { defineStore } from 'pinia';
import type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  ContributeToGoalRequest,
  GoalProgress,
  GoalContribution,
  GoalWithContributions,
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
      await $fetch<Goal>('/goals', {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated goals after creation
      await fetchGoals();
      return true;
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
      await $fetch<Goal>(`/goals/${goalId}`, {
        method: 'PUT',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated goals after update
      await fetchGoals();
      return true;
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

      // Fetch updated goals after deletion
      await fetchGoals();
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
      await $fetch<{
        contribution_id: string;
        goal_id: string;
        amount: number;
        description?: string;
        contributed_at: string;
      }>(`/goals/${goalId}/contribute`, {
        method: 'PATCH',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated goals after contribution
      await fetchGoals();

      return true;
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

  const getGoalContributions = async (goalId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<{ contributions: GoalContribution[] }>(
        `/goals/${goalId}/contributions`,
        {
          headers: { Authorization: `Bearer ${useAuthStore().token}` },
          baseURL: useRuntimeConfig().public.apiBase,
        }
      );
      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar contribuições';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getGoalWithContributions = async (goalId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<GoalWithContributions>(
        `/goals/${goalId}/details`,
        {
          headers: { Authorization: `Bearer ${useAuthStore().token}` },
          baseURL: useRuntimeConfig().public.apiBase,
        }
      );
      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar detalhes da meta';
      throw err;
    } finally {
      isLoading.value = false;
    }
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
    getGoalContributions,
    getGoalWithContributions,
    clearError,
  };
});
