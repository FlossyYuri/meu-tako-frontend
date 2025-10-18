import { defineStore } from 'pinia';
import type {
  Reminder,
  CreateReminderRequest,
  UpdateReminderRequest,
  ReminderStatus,
} from '~/types';

export const useRemindersStore = defineStore('reminders', () => {
  const reminders = ref<Reminder[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchReminders = async (status?: ReminderStatus) => {
    isLoading.value = true;
    error.value = null;
    try {
      const params = status ? { status } : {};
      const data = await $fetch<Reminder[]>('/reminders', {
        params,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });
      reminders.value = data;
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar lembretes';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getReminderById = async (reminderId: string) => {
    return $fetch<Reminder>(`/reminders/${reminderId}`, {
      headers: { Authorization: `Bearer ${useAuthStore().token}` },
      baseURL: useRuntimeConfig().public.apiBase,
    });
  };

  const createReminder = async (payload: CreateReminderRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch<Reminder>('/reminders', {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated reminders after creation
      await fetchReminders();
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar lembrete';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateReminder = async (
    reminderId: string,
    payload: UpdateReminderRequest
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch<Reminder>(`/reminders/${reminderId}`, {
        method: 'PATCH',
        body: payload,
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated reminders after update
      await fetchReminders();
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar lembrete';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteReminder = async (reminderId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch(`/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated reminders after deletion
      await fetchReminders();
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao deletar lembrete';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const pauseReminder = async (reminderId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch<Reminder>(`/reminders/${reminderId}/pause`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated reminders after pause
      await fetchReminders();
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao pausar lembrete';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const resumeReminder = async (reminderId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch<Reminder>(`/reminders/${reminderId}/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated reminders after resume
      await fetchReminders();
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao reativar lembrete';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const completeReminder = async (reminderId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch<Reminder>(`/reminders/${reminderId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated reminders after completion
      await fetchReminders();
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao completar lembrete';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const cancelReminder = async (reminderId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await $fetch<Reminder>(`/reminders/${reminderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${useAuthStore().token}` },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated reminders after cancellation
      await fetchReminders();
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao cancelar lembrete';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => (error.value = null);

  return {
    reminders,
    isLoading,
    error,
    fetchReminders,
    getReminderById,
    createReminder,
    updateReminder,
    deleteReminder,
    pauseReminder,
    resumeReminder,
    completeReminder,
    cancelReminder,
    clearError,
  };
});
