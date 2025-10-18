import type {
  Reminder,
  CreateReminderRequest,
  UpdateReminderRequest,
  ReminderPriority,
  ReminderStatus,
  ReminderRecurrence,
  NotificationChannel,
} from '~/types';

export const useReminders = () => {
  const remindersStore = useRemindersStore();
  const { success, error: showError } = useNotifications();

  // Buscar todos os lembretes
  const fetchReminders = async (status?: ReminderStatus) => {
    try {
      return await remindersStore.fetchReminders(status);
    } catch (err: any) {
      showError('Erro ao carregar lembretes', err?.message);
      throw err;
    }
  };

  // Buscar lembrete por ID
  const getReminder = async (reminderId: string) => {
    try {
      return await remindersStore.getReminderById(reminderId);
    } catch (err: any) {
      showError('Erro ao carregar lembrete', err?.message);
      throw err;
    }
  };

  // Criar novo lembrete
  const createReminder = async (data: CreateReminderRequest) => {
    try {
      const reminder = await remindersStore.createReminder(data);
      success('Lembrete criado com sucesso!');
      return reminder;
    } catch (err: any) {
      showError('Erro ao criar lembrete', err?.message);
      throw err;
    }
  };

  // Atualizar lembrete
  const updateReminder = async (
    reminderId: string,
    data: UpdateReminderRequest
  ) => {
    try {
      const reminder = await remindersStore.updateReminder(reminderId, data);
      success('Lembrete atualizado com sucesso!');
      return reminder;
    } catch (err: any) {
      showError('Erro ao atualizar lembrete', err?.message);
      throw err;
    }
  };

  // Excluir lembrete
  const deleteReminder = async (reminderId: string) => {
    try {
      await remindersStore.deleteReminder(reminderId);
      success('Lembrete excluído com sucesso!');
      return true;
    } catch (err: any) {
      showError('Erro ao excluir lembrete', err?.message);
      throw err;
    }
  };

  // Pausar lembrete
  const pauseReminder = async (reminderId: string) => {
    try {
      await remindersStore.pauseReminder(reminderId);
      success('Lembrete pausado com sucesso!');
      return true;
    } catch (err: any) {
      showError('Erro ao pausar lembrete', err?.message);
      throw err;
    }
  };

  // Reativar lembrete
  const resumeReminder = async (reminderId: string) => {
    try {
      await remindersStore.resumeReminder(reminderId);
      success('Lembrete reativado com sucesso!');
      return true;
    } catch (err: any) {
      showError('Erro ao reativar lembrete', err?.message);
      throw err;
    }
  };

  // Completar lembrete
  const completeReminder = async (reminderId: string) => {
    try {
      await remindersStore.completeReminder(reminderId);
      success('Lembrete marcado como concluído!');
      return true;
    } catch (err: any) {
      showError('Erro ao completar lembrete', err?.message);
      throw err;
    }
  };

  // Cancelar lembrete
  const cancelReminder = async (reminderId: string) => {
    try {
      await remindersStore.cancelReminder(reminderId);
      success('Lembrete cancelado com sucesso!');
      return true;
    } catch (err: any) {
      showError('Erro ao cancelar lembrete', err?.message);
      throw err;
    }
  };

  // Filtrar lembretes por prioridade
  const filterRemindersByPriority = (
    reminders: Reminder[],
    priority: ReminderPriority | 'all'
  ) => {
    if (priority === 'all') return reminders;
    return reminders.filter((r) => r.priority === priority);
  };

  // Filtrar lembretes por status
  const filterRemindersByStatus = (
    reminders: Reminder[],
    status: ReminderStatus | 'all'
  ) => {
    if (status === 'all') return reminders;
    return reminders.filter((r) => r.status === status);
  };

  // Ordenar lembretes
  const sortReminders = (
    reminders: Reminder[],
    sortBy: 'scheduledFor' | 'priority' | 'createdAt' = 'scheduledFor',
    order: 'asc' | 'desc' = 'asc'
  ) => {
    return [...reminders].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'scheduledFor':
          aValue = new Date(a.scheduledFor).getTime();
          bValue = new Date(b.scheduledFor).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  // Calcular estatísticas dos lembretes
  const getRemindersStats = (reminders: Reminder[]) => {
    const totalReminders = reminders.length;
    const activeReminders = reminders.filter(
      (r) => r.status === 'active'
    ).length;
    const pausedReminders = reminders.filter(
      (r) => r.status === 'paused'
    ).length;
    const completedReminders = reminders.filter(
      (r) => r.status === 'completed'
    ).length;
    const cancelledReminders = reminders.filter(
      (r) => r.status === 'cancelled'
    ).length;

    const highPriorityReminders = reminders.filter(
      (r) => r.priority === 'high'
    ).length;
    const mediumPriorityReminders = reminders.filter(
      (r) => r.priority === 'medium'
    ).length;
    const lowPriorityReminders = reminders.filter(
      (r) => r.priority === 'low'
    ).length;

    return {
      totalReminders,
      activeReminders,
      pausedReminders,
      completedReminders,
      cancelledReminders,
      highPriorityReminders,
      mediumPriorityReminders,
      lowPriorityReminders,
    };
  };

  // Formatar prioridade para exibição
  const formatPriority = (priority: ReminderPriority): string => {
    const labels = {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
    };
    return labels[priority];
  };

  // Formatar status para exibição
  const formatStatus = (status: ReminderStatus): string => {
    const labels = {
      active: 'Ativo',
      paused: 'Pausado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status];
  };

  // Formatar recorrência para exibição
  const formatRecurrence = (recurrence: ReminderRecurrence): string => {
    const labels = {
      once: 'Uma vez',
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual',
    };
    return labels[recurrence];
  };

  // Formatar canal de notificação para exibição
  const formatNotificationChannel = (
    channel: NotificationChannel
  ): { label: string; icon: string } => {
    const channels = {
      whatsapp: { label: 'WhatsApp', icon: 'lucide:message-circle' },
      email: { label: 'E-mail', icon: 'lucide:mail' },
      push: { label: 'Push', icon: 'lucide:bell' },
    };
    return channels[channel];
  };

  // Obter variante do badge para prioridade
  const getPriorityBadgeVariant = (priority: ReminderPriority) => {
    const variants = {
      high: 'error',
      medium: 'warning',
      low: 'default',
    };
    return variants[priority] as 'error' | 'warning' | 'default';
  };

  // Obter variante do badge para status
  const getStatusBadgeVariant = (status: ReminderStatus) => {
    const variants = {
      active: 'success',
      paused: 'warning',
      completed: 'success',
      cancelled: 'default',
    };
    return variants[status] as 'success' | 'warning' | 'default';
  };

  return {
    // Store state
    reminders: computed(() => remindersStore.reminders),
    isLoading: computed(() => remindersStore.isLoading),
    error: computed(() => remindersStore.error),

    // Actions
    fetchReminders,
    getReminder,
    createReminder,
    updateReminder,
    deleteReminder,
    pauseReminder,
    resumeReminder,
    completeReminder,
    cancelReminder,

    // Utilities
    filterRemindersByPriority,
    filterRemindersByStatus,
    sortReminders,
    getRemindersStats,
    formatPriority,
    formatStatus,
    formatRecurrence,
    formatNotificationChannel,
    getPriorityBadgeVariant,
    getStatusBadgeVariant,
    clearError: remindersStore.clearError,
  };
};
