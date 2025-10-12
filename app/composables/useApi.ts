import type { ApiResponse, ApiError } from '~/types';

export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (authStore.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.token}`,
        };
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        authStore.logout();
        if (import.meta.client) navigateTo('/auth/login');
      }
    },
  });

  const handleApiError = (error: any): string => {
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    return 'Ocorreu um erro inesperado';
  };

  const formatCurrency = (amount: number, currency = 'MZN'): string =>
    new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);

  // Helpers para datas
  const isDateOnly = (value: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(value);

  const formatDateOnlyString = (value: string): string => {
    // value no formato YYYY-MM-DD -> DD/MM/YYYY sem criar Date (evita fuso)
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  };

  const toValidDate = (value: string | Date): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    // Se for um date-only, não convertemos em Date aqui (devolvemos null para forçar tratamento especial)
    if (isDateOnly(value)) return null;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const formatDate = (date: string | Date): string => {
    if (!date) return '';
    if (typeof date === 'string' && isDateOnly(date)) {
      return formatDateOnlyString(date);
    }
    const dt = toValidDate(date);
    if (!dt) {
      console.warn('Invalid date provided to formatDate:', date);
      return 'Data inválida';
    }
    return new Intl.DateTimeFormat('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dt);
  };

  const formatDateTime = (date: string | Date): string => {
    if (!date) return '';
    // Para strings date-only, apenas formata como data (sem hora)
    if (typeof date === 'string' && isDateOnly(date)) {
      return formatDateOnlyString(date);
    }
    const dt = toValidDate(date);
    if (!dt) {
      console.warn('Invalid date provided to formatDateTime:', date);
      return 'Data inválida';
    }
    return new Intl.DateTimeFormat('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dt);
  };

  const formatRelativeTime = (date: string | Date): string => {
    if (!date) return '';
    // Se for date-only, trata como meia-noite local sem criar ambiguidade no output (usa o próprio dia)
    if (typeof date === 'string' && isDateOnly(date)) {
      // Usa diferença com base no dia, sem considerar hora
      const [y, m, d] = date.split('-').map(Number);
      const dt = new Date(y, (m || 1) - 1, d || 1);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - dt.getTime()) / 1000);
      if (diffInSeconds < 60) return 'agora mesmo';
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
      return formatDate(date);
    }
    const dt = toValidDate(date);
    if (!dt) {
      console.warn('Invalid date provided to formatRelativeTime:', date);
      return 'Data inválida';
    }
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dt.getTime()) / 1000);
    if (diffInSeconds < 60) return 'agora mesmo';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;

    return formatDate(dt);
  };

  const formatISODate = (date: string | Date): string => {
    if (!date) return '';
    if (typeof date === 'string' && isDateOnly(date)) {
      return formatDateOnlyString(date);
    }
    const dt = toValidDate(date);
    if (!dt) {
      console.warn('Invalid ISO date provided to formatISODate:', date);
      return 'Data inválida';
    }
    return new Intl.DateTimeFormat('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dt);
  };

  const formatISODateTime = (date: string | Date): string => {
    if (!date) return '';
    if (typeof date === 'string' && isDateOnly(date)) {
      return formatDateOnlyString(date);
    }
    const dt = toValidDate(date);
    if (!dt) {
      console.warn('Invalid ISO date provided to formatISODateTime:', date);
      return 'Data inválida';
    }
    return new Intl.DateTimeFormat('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(dt);
  };

  // Exibição amigável (usa heurística do formato recebido)
  const formatDisplayDate = (date: string | Date): string => {
    if (!date) return '';
    if (typeof date === 'string' && isDateOnly(date)) {
      return formatDateOnlyString(date);
    }
    try {
      const dt = toValidDate(date);
      if (!dt) {
        console.warn('Invalid date provided to formatDisplayDate:', date);
        return 'Data inválida';
      }
      // Se for ISO com tempo (tem 'T'), mostra data simples
      if (typeof date === 'string' && date.includes('T')) {
        return new Intl.DateTimeFormat('pt-MZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(dt);
      }
      // Fallback
      return new Intl.DateTimeFormat('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dt);
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Data inválida';
    }
  };

  const generateId = (): string => Math.random().toString(36).substr(2, 9);

  const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 6) errors.push('A senha deve ter pelo menos 6 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('A senha deve conter pelo menos uma letra maiúscula');
    if (!/[a-z]/.test(password)) errors.push('A senha deve conter pelo menos uma letra minúscula');
    if (!/\d/.test(password)) errors.push('A senha deve conter pelo menos um número');
    return { isValid: errors.length === 0, errors };
  };

  const validatePhone = (phone: string): boolean => /^\+258[0-9]{9}$/.test(phone);

  const sanitizeInput = (input: string): string => input.trim().replace(/[<>]/g, '');

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Erro ao copiar para a área de transferência:', err);
      return false;
    }
  };

  const downloadFile = (data: any, filename: string, type = 'application/json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
    };

  const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const generateColor = (seed: string): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padEnd(6, '0')}`;
  };

  const getInitials = (name: string): string =>
    name.split(' ').map((w) => w.charAt(0)).join('').toUpperCase().slice(0, 2);

  return {
    api,
    handleApiError,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatISODate,
    formatISODateTime,
    formatDisplayDate,
    generateId,
    debounce,
    throttle,
    validateEmail,
    validatePassword,
    validatePhone,
    sanitizeInput,
    copyToClipboard,
    downloadFile,
    getFileSize,
    calculatePercentage,
    generateColor,
    getInitials,
  };
};