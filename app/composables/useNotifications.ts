import type { Notification } from '~/types';

export const useNotifications = () => {
  const notifications = ref<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };

    notifications.value.push(newNotification);

    // Auto remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAllNotifications = () => {
    notifications.value = [];
  };

  const success = (title: string, message?: string) => {
    return addNotification({
      type: 'success',
      title,
      message: message || '',
    });
  };

  const error = (title: string, message?: string) => {
    return addNotification({
      type: 'error',
      title,
      message: message || '',
    });
  };

  const warning = (title: string, message?: string) => {
    return addNotification({
      type: 'warning',
      title,
      message: message || '',
    });
  };

  const info = (title: string, message?: string) => {
    return addNotification({
      type: 'info',
      title,
      message: message || '',
    });
  };

  const showApiError = (
    error: any,
    defaultMessage = 'Ocorreu um erro inesperado'
  ) => {
    const message = error?.data?.message || error?.message || defaultMessage;
    return error(message, 'Tente novamente mais tarde');
  };

  return {
    notifications: readonly(notifications),
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info,
    showApiError,
  };
};
