import { defineStore } from 'pinia';
import type { Wallet, CreateWalletRequest, UpdateWalletRequest } from '~/types';

export const useWalletsStore = defineStore('wallets', () => {
  // State
  const wallets = ref<Wallet[]>([]);
  const currentWallet = ref<Wallet | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const defaultWallet = computed(
    () => wallets.value.find((wallet) => wallet.is_default) || wallets.value[0]
  );

  const totalBalance = computed(() =>
    wallets.value.reduce((total, wallet) => total + wallet.balance, 0)
  );

  const walletOptions = computed(() =>
    wallets.value.map((wallet) => ({
      value: wallet.wallet_id,
      label: wallet.wallet_name,
      balance: wallet.balance,
    }))
  );

  // Actions
  const fetchWallets = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Wallet[]>('/wallets', {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      wallets.value = response;

      // Set current wallet to default if not set
      if (!currentWallet.value && response.length > 0) {
        currentWallet.value = defaultWallet.value;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar carteiras';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchWalletById = async (walletId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Wallet>(`/wallets/${walletId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const idx = wallets.value.findIndex(w => w.wallet_id === walletId);
      if (idx !== -1) wallets.value[idx] = response;
      else wallets.value.push(response);

      if (!currentWallet.value || currentWallet.value.wallet_id === walletId) {
        currentWallet.value = response;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao obter carteira';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createWallet = async (walletData: CreateWalletRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Wallet>('/wallets', {
        method: 'POST',
        body: walletData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      wallets.value.push(response);

      // If this is the first wallet, set it as current
      if (wallets.value.length === 1) {
        currentWallet.value = response;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar carteira';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateWallet = async (
    walletId: string,
    walletData: UpdateWalletRequest
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Wallet>(`/wallets/${walletId}`, {
        method: 'PUT',
        body: walletData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const index = wallets.value.findIndex((w) => w.wallet_id === walletId);
      if (index !== -1) {
        wallets.value[index] = response;
      }

      // Update current wallet if it's the one being updated
      if (currentWallet.value?.wallet_id === walletId) {
        currentWallet.value = response;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar carteira';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteWallet = async (walletId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch(`/wallets/${walletId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Remove from local state
      wallets.value = wallets.value.filter((w) => w.wallet_id !== walletId);

      // If deleted wallet was current, set new current
      if (currentWallet.value?.wallet_id === walletId) {
        currentWallet.value = defaultWallet.value || null;
      }

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao deletar carteira';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setDefaultWallet = async (walletId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<Wallet>(`/wallets/${walletId}/default`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Update all wallets to remove default flag
      wallets.value = wallets.value.map((w) => ({ ...w, is_default: false }));

      // Set the new default wallet
      const index = wallets.value.findIndex((w) => w.wallet_id === walletId);
      if (index !== -1) {
        wallets.value[index] = response;
      } else {
        wallets.value.push(response);
      }

      // Update current wallet if matches
      if (currentWallet.value?.wallet_id === walletId) {
        currentWallet.value = response;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao definir carteira padrão';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setCurrentWallet = (wallet: Wallet | null) => {
    currentWallet.value = wallet;
  };

  const getWalletById = (walletId: string) => {
    return wallets.value.find((w) => w.wallet_id === walletId);
  };

  const updateWalletBalance = (walletId: string, newBalance: number) => {
    const wallet = wallets.value.find((w) => w.wallet_id === walletId);
    if (wallet) {
      wallet.balance = newBalance;
    }

    // Update current wallet if it's the one being updated
    if (currentWallet.value?.wallet_id === walletId) {
      currentWallet.value.balance = newBalance;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    wallets,
    currentWallet,
    isLoading,
    error,

    // Getters
    defaultWallet,
    totalBalance,
    walletOptions,

    // Actions
    fetchWallets,
    fetchWalletById,
    createWallet,
    updateWallet,
    deleteWallet,
    setDefaultWallet,
    setCurrentWallet,
    getWalletById,
    updateWalletBalance,
    clearError,
  };
});