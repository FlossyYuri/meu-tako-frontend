import { defineStore } from 'pinia';
import type { Limit, CreateLimitRequest, UpdateLimitRequest, LimitStatus } from '~/types';

export const useLimitsStore = defineStore('limits', () => {
  const limits = ref<Limit[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchLimits = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Limit[]>('/limits', {
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      limits.value = data;
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar limites';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getLimitById = async (limitId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Limit>(`/limits/${limitId}`, {
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      const idx = limits.value.findIndex(l => l.limit_id === limitId);
      if (idx !== -1) limits.value[idx] = data;
      else limits.value.push(data);
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao obter limite';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getLimitStatus = async (limitId: string) => {
    return $fetch<LimitStatus>(`/limits/${limitId}/status`, {
      headers: { Authorization: `Bearer ${useAuthStore().token}` },
      baseURL: useRuntimeConfig().public.apiBase,
    });
  };

  const createLimit = async (payload: CreateLimitRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const created = await $fetch<Limit>('/limits', {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      limits.value.push(created);
      return created;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar limite';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateLimit = async (limitId: string, payload: UpdateLimitRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await $fetch<Limit>(`/limits/${limitId}`, {
        method: 'PUT',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      const idx = limits.value.findIndex(l => l.limit_id === limitId);
      if (idx !== -1) limits.value[idx] = updated;
      return updated;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar limite';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteLimit = async (limitId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch(`/limits/${limitId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      limits.value = limits.value.filter(l => l.limit_id !== limitId);
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao deletar limite';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => (error.value = null);

  return {
    limits,
    isLoading,
    error,
    fetchLimits,
    getLimitById,
    getLimitStatus,
    createLimit,
    updateLimit,
    deleteLimit,
    clearError,
  };
});