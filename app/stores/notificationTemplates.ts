import { defineStore } from 'pinia';
import type {
  NotificationTemplate,
  NotificationHistory,
  NotificationStats,
  NotificationChannel,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  SendNotificationRequest,
  PaginatedResponse,
} from '~/types';

type AnyNotificationTemplate = Partial<NotificationTemplate> &
  Record<string, unknown>;

const normalizeNotificationTemplate = (
  raw: AnyNotificationTemplate
): NotificationTemplate => {
  return {
    id: raw.id || '',
    name: raw.name || '',
    title: raw.title || '',
    content: raw.content || '',
    channel: raw.channel || 'whatsapp',
    language: raw.language || 'pt-BR',
    variables: Array.isArray(raw.variables) ? raw.variables : [],
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: String(raw.createdAt || raw.created_at || ''),
    updatedAt: String(raw.updatedAt || raw.updated_at || ''),
  };
};

const normalizeNotificationHistory = (
  raw: Record<string, unknown>
): NotificationHistory => {
  return {
    id: (raw.id as string) || '',
    userId: (raw.userId as string) || (raw.user_id as string) || '',
    channel: (raw.channel as 'whatsapp' | 'email' | 'push') || 'whatsapp',
    status: (raw.status as NotificationHistory['status']) || 'pending',
    template:
      (raw.template as string) ||
      (raw.templateName as string) ||
      (raw.template_name as string) ||
      '',
    content: (raw.content as string) || '',
    recipient: (raw.recipient as string) || '',
    retryCount: (raw.retryCount as number) || (raw.retry_count as number) || 0,
    sentAt: (raw.sentAt as string) || (raw.sent_at as string) || undefined,
    deliveredAt:
      (raw.deliveredAt as string) || (raw.delivered_at as string) || undefined,
    readAt: (raw.readAt as string) || (raw.read_at as string) || undefined,
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || '',
    updatedAt: (raw.updatedAt as string) || (raw.updated_at as string) || '',
  };
};

export const useNotificationTemplatesStore = defineStore(
  'notificationTemplates',
  () => {
    // State
    const templates = ref<NotificationTemplate[]>([]);
    const selectedTemplate = ref<NotificationTemplate | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Histórico e estatísticas
    const history = ref<NotificationHistory[]>([]);
    const stats = ref<NotificationStats | null>(null);
    const historyLoading = ref(false);
    const statsLoading = ref(false);
    const pagination = ref({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });

    // Filtros
    const filters = ref({
      channel: null as NotificationChannel | null,
      status: null as 'active' | 'inactive' | null,
      search: '',
    });

    // Computed
    const templatesByChannel = computed(() => {
      const grouped: Record<NotificationChannel, NotificationTemplate[]> = {
        whatsapp: [],
        email: [],
        push: [],
      };

      templates.value.forEach((template) => {
        grouped[template.channel].push(template);
      });

      return grouped;
    });

    const activeTemplates = computed(() =>
      templates.value.filter((template) => template.isActive)
    );

    const inactiveTemplates = computed(() =>
      templates.value.filter((template) => !template.isActive)
    );

    // Templates CRUD
    const fetchTemplates = async (channel?: string) => {
      isLoading.value = true;
      error.value = null;
      try {
        const params = channel ? { channel } : {};
        const data = await $fetch<Record<string, unknown>[]>(
          '/notifications/templates',
          {
            headers: { Authorization: `Bearer ${useAuthStore().token}` },
            query: params,
            baseURL: useRuntimeConfig().public.apiBase,
          }
        );
        templates.value = (data || []).map(normalizeNotificationTemplate);
        return templates.value;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao carregar templates';
        error.value = errorMessage;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const getTemplateById = (id: string) =>
      templates.value.find((t) => t.id === id);

    const getTemplateRemote = async (id: string) => {
      isLoading.value = true;
      error.value = null;
      try {
        const data = await $fetch<Record<string, unknown>>(
          `/notifications/templates/${id}`,
          {
            headers: { Authorization: `Bearer ${useAuthStore().token}` },
            baseURL: useRuntimeConfig().public.apiBase,
          }
        );
        const normalized = normalizeNotificationTemplate(data);
        const idx = templates.value.findIndex((t) => t.id === normalized.id);
        if (idx !== -1) templates.value[idx] = normalized;
        else templates.value.push(normalized);
        selectedTemplate.value = normalized;
        return normalized;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao obter template';
        error.value = errorMessage;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const createTemplate = async (
      payload: CreateNotificationTemplateRequest
    ) => {
      isLoading.value = true;
      error.value = null;
      try {
        const data = await $fetch<Record<string, unknown>>(
          '/notifications/templates',
          {
            method: 'POST',
            body: payload,
            headers: { Authorization: `Bearer ${useAuthStore().token}` },
            baseURL: useRuntimeConfig().public.apiBase,
          }
        );
        const normalized = normalizeNotificationTemplate(data);
        templates.value.push(normalized);
        return normalized;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao criar template';
        error.value = errorMessage;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const updateTemplate = async (
      id: string,
      payload: UpdateNotificationTemplateRequest
    ) => {
      isLoading.value = true;
      error.value = null;
      try {
        const data = await $fetch<Record<string, unknown>>(
          `/notifications/templates/${id}`,
          {
            method: 'PUT',
            body: payload,
            headers: { Authorization: `Bearer ${useAuthStore().token}` },
            baseURL: useRuntimeConfig().public.apiBase,
          }
        );
        const normalized = normalizeNotificationTemplate(data);
        const idx = templates.value.findIndex((t) => t.id === id);
        if (idx !== -1) templates.value[idx] = normalized;
        if (selectedTemplate.value?.id === id) {
          selectedTemplate.value = normalized;
        }
        return normalized;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao atualizar template';
        error.value = errorMessage;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const deleteTemplate = async (id: string) => {
      isLoading.value = true;
      error.value = null;
      try {
        await $fetch(`/notifications/templates/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${useAuthStore().token}` },
          baseURL: useRuntimeConfig().public.apiBase,
        });
        templates.value = templates.value.filter((t) => t.id !== id);
        if (selectedTemplate.value?.id === id) {
          selectedTemplate.value = null;
        }
        return true;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao deletar template';
        error.value = errorMessage;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const duplicateTemplate = async (id: string) => {
      isLoading.value = true;
      error.value = null;
      try {
        const originalTemplate = await getTemplateRemote(id);
        const duplicatedData: CreateNotificationTemplateRequest = {
          name: `${originalTemplate.name}_copy`,
          title: originalTemplate.title,
          content: originalTemplate.content,
          channel: originalTemplate.channel,
          language: originalTemplate.language,
          variables: originalTemplate.variables,
          isActive: false,
        };
        const duplicated = await createTemplate(duplicatedData);
        return duplicated;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao duplicar template';
        error.value = errorMessage;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const toggleTemplateActive = async (id: string) => {
      isLoading.value = true;
      error.value = null;
      try {
        const template = getTemplateById(id);
        if (!template) throw new Error('Template não encontrado');

        await $fetch(`/notifications/templates/${id}/toggle-active`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${useAuthStore().token}` },
          baseURL: useRuntimeConfig().public.apiBase,
        });

        const updatedTemplate = { ...template, isActive: !template.isActive };
        const idx = templates.value.findIndex((t) => t.id === id);
        if (idx !== -1) templates.value[idx] = updatedTemplate;
        if (selectedTemplate.value?.id === id) {
          selectedTemplate.value = updatedTemplate;
        }
        return updatedTemplate;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao alternar status do template';
        error.value = errorMessage;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    // Histórico e estatísticas
    const fetchNotificationHistory = async (
      params: Record<string, unknown> = {}
    ) => {
      historyLoading.value = true;
      error.value = null;
      try {
        const response = await $fetch<PaginatedResponse<NotificationHistory>>(
          '/notifications/history',
          {
            headers: { Authorization: `Bearer ${useAuthStore().token}` },
            query: {
              page: pagination.value.page,
              limit: pagination.value.limit,
              ...params,
            },
            baseURL: useRuntimeConfig().public.apiBase,
          }
        );
        history.value = (response.data || []).map((item: unknown) =>
          normalizeNotificationHistory(item as Record<string, unknown>)
        );
        pagination.value = {
          page: response.pagination.page || 1,
          limit: response.pagination.limit || 20,
          total: response.pagination.total || 0,
          totalPages: response.pagination.totalPages || 0,
        };
        return response;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao carregar histórico';
        error.value = errorMessage;
        throw err;
      } finally {
        historyLoading.value = false;
      }
    };

    const fetchNotificationStats = async () => {
      statsLoading.value = true;
      error.value = null;
      try {
        const data = await $fetch<NotificationStats>('/notifications/stats', {
          headers: { Authorization: `Bearer ${useAuthStore().token}` },
          baseURL: useRuntimeConfig().public.apiBase,
        });
        stats.value = data;
        return data;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao carregar estatísticas';
        error.value = errorMessage;
        throw err;
      } finally {
        statsLoading.value = false;
      }
    };

    // Notificações
    const sendTestNotification = async (
      templateId: string,
      data: SendNotificationRequest
    ) => {
      try {
        await $fetch('/notifications/send', {
          method: 'POST',
          body: {
            ...data,
            template: templateId,
          },
          headers: { Authorization: `Bearer ${useAuthStore().token}` },
          baseURL: useRuntimeConfig().public.apiBase,
        });
        return true;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao enviar notificação de teste';
        error.value = errorMessage;
        throw err;
      }
    };

    const previewTemplate = async (
      id: string,
      data: Record<string, unknown>
    ) => {
      try {
        const response = await $fetch(
          `/notifications/templates/${id}/preview`,
          {
            method: 'POST',
            body: data,
            headers: { Authorization: `Bearer ${useAuthStore().token}` },
            baseURL: useRuntimeConfig().public.apiBase,
          }
        );
        return response;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao fazer preview do template';
        error.value = errorMessage;
        throw err;
      }
    };

    const validateTemplate = async (content: string, channel: string) => {
      try {
        const response = await $fetch<{ isValid: boolean; errors: string[] }>(
          '/notifications/templates/validate',
          {
            method: 'POST',
            body: { content, channel },
            headers: { Authorization: `Bearer ${useAuthStore().token}` },
            baseURL: useRuntimeConfig().public.apiBase,
          }
        );
        return response;
      } catch (err: unknown) {
        const errorMessage =
          (err as { data?: { message?: string } }).data?.message ||
          'Erro ao validar template';
        error.value = errorMessage;
        throw err;
      }
    };

    // Paginação
    const setPage = (page: number) => {
      pagination.value.page = page;
    };

    const setLimit = (limit: number) => {
      pagination.value.limit = limit;
    };

    // Filtros
    const setChannelFilter = (channel: NotificationChannel | null) => {
      filters.value.channel = channel;
    };

    const setStatusFilter = (status: 'active' | 'inactive' | null) => {
      filters.value.status = status;
    };

    const setSearchFilter = (search: string) => {
      filters.value.search = search;
    };

    const clearFilters = () => {
      filters.value = {
        channel: null,
        status: null,
        search: '',
      };
    };

    const clearError = () => (error.value = null);

    const reset = () => {
      templates.value = [];
      selectedTemplate.value = null;
      history.value = [];
      stats.value = null;
      isLoading.value = false;
      error.value = null;
      historyLoading.value = false;
      statsLoading.value = false;
      pagination.value = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      clearFilters();
    };

    return {
      // State
      templates,
      selectedTemplate,
      isLoading,
      error,
      history,
      stats,
      historyLoading,
      statsLoading,
      pagination,
      filters,

      // Computed
      templatesByChannel,
      activeTemplates,
      inactiveTemplates,

      // Templates CRUD
      fetchTemplates,
      getTemplateById,
      getTemplateRemote,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      duplicateTemplate,
      toggleTemplateActive,

      // Histórico e estatísticas
      fetchNotificationHistory,
      fetchNotificationStats,

      // Notificações
      sendTestNotification,
      previewTemplate,
      validateTemplate,

      // Paginação
      setPage,
      setLimit,

      // Filtros
      setChannelFilter,
      setStatusFilter,
      setSearchFilter,
      clearFilters,

      // Utils
      clearError,
      reset,
    };
  }
);
