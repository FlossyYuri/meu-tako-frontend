import { defineStore } from 'pinia';
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
} from '~/types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isInitialized = ref<boolean>(false);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const userInitials = computed(() => {
    if (!user.value?.name) return '';
    return user.value.name
      .split(' ')
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  // Actions
  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
        baseURL: useRuntimeConfig().public.apiBase,
      });

      user.value = response.user;
      token.value = response.accessToken;
      refreshToken.value = response.refreshToken;

      // Store in localStorage
      if (import.meta.client) {
        localStorage.setItem('auth_token', response.accessToken);
        localStorage.setItem('auth_refresh_token', response.refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao fazer login';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<{ message: string; user: User }>(
        '/auth/register',
        {
          method: 'POST',
          body: userData,
          baseURL: useRuntimeConfig().public.apiBase,
        }
      );

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar conta';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      if (token.value) {
        await $fetch('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          baseURL: useRuntimeConfig().public.apiBase,
        });
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      // Clear state regardless of API call success
      user.value = null;
      token.value = null;
      refreshToken.value = null;
      error.value = null;

      if (import.meta.client) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');
      }
    }
  };

  const refreshAuthToken = async () => {
    try {
      if (!refreshToken.value) throw new Error('No refresh token');

      const response = await $fetch<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: refreshToken.value },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      token.value = response.accessToken;
      refreshToken.value = response.refreshToken;

      if (import.meta.client) {
        localStorage.setItem('auth_token', response.accessToken);
        localStorage.setItem('auth_refresh_token', response.refreshToken);
      }

      return response;
    } catch (err) {
      // If refresh fails, logout user
      await logout();
      throw err;
    }
  };

  const initializeAuth = () => {
    if (import.meta.client) {
      const storedToken = localStorage.getItem('auth_token');
      const storedRefreshToken = localStorage.getItem('auth_refresh_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        token.value = storedToken;
        refreshToken.value = storedRefreshToken;
        user.value = JSON.parse(storedUser);
      }
      isInitialized.value = true;
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<User>('/users/profile', {
        method: 'PUT',
        body: profileData,
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      user.value = response;

      if (import.meta.client) {
        localStorage.setItem('auth_user', JSON.stringify(response));
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar perfil';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const changePassword = async (payload: ChangePasswordRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch('/users/change-password', {
        method: 'PUT',
        body: payload, // { currentPassword, newPassword }
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao alterar senha';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteAccount = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch('/users/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      await logout();
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao deletar conta';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    user,
    token,
    refreshToken,
    isLoading,
    error,
    isInitialized,

    // Getters
    isAuthenticated,
    userInitials,

    // Actions
    login,
    register,
    logout,
    refreshAuthToken,
    initializeAuth,
    updateProfile,
    changePassword,
    deleteAccount,
    clearError,
  };
});
