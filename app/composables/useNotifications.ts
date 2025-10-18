import { toast } from 'vue-sonner';
import type { Notification } from '~/types';

export const useNotifications = () => {
  // Mantemos a assinatura, mas delegamos os toasts ao vue-sonner
  const success = (title: string, message?: string) => {
    return toast.success(title, { description: message });
  };

  const error = (title: string, message?: string) => {
    return toast.error(title, { description: message });
  };

  const warning = (title: string, message?: string) => {
    return (
      toast.warning?.(title, { description: message }) ??
      toast(title, { description: message })
    );
  };

  const info = (title: string, message?: string) => {
    return (
      toast.info?.(title, { description: message }) ??
      toast(title, { description: message })
    );
  };

  const showApiError = (
    err: any,
    defaultMessage = 'Ocorreu um erro inesperado'
  ) => {
    const msg = err?.data?.message || err?.message || defaultMessage;
    return error('Erro', msg);
  };

  // API compatível (mantemos assinaturas esperadas)
  const addNotification = (n: Omit<Notification, 'id'>) => {
    switch (n.type) {
      case 'success':
        return success(n.title, n.message);
      case 'error':
        return error(n.title, n.message);
      case 'warning':
        return warning(n.title, n.message);
      case 'info':
        return info(n.title, n.message);
      default:
        return toast(n.title, { description: n.message });
    }
  };

  // Métodos sem efeito real (backwards compat)
  const removeNotification = (_id: string) => {};
  const clearAllNotifications = () => toast.dismiss();

  return {
    // estados deixados fora; toasts são controlados pelo vue-sonner
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
