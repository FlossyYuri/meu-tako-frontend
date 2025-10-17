import { defineStore } from 'pinia';
import type { Wallet, CreateWalletRequest, UpdateWalletRequest } from '~/types';

type AnyWallet = Partial<Wallet> & Record<string, any>;

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v ?? '0').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const normalizeWallet = (raw: AnyWallet): Wallet => {
  return {
    wallet_id: String(raw.wallet_id ?? raw.id ?? ''),
    wallet_name: String(raw.wallet_name ?? raw.name ?? ''),
    balance: toNumber(raw.balance),
    is_default: Boolean(raw.is_default),
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
};

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
    wallets.value.reduce((total, wallet) => total + toNumber(wallet.balance), 0)
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

      const response = await $fetch<any[]>('/wallets', {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      wallets.value = (response || []).map(normalizeWallet);

      // Set current wallet to default if not set
      if (!currentWallet.value && wallets.value.length > 0) {
        currentWallet.value = defaultWallet.value;
      }

      return wallets.value;
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

      const response = await $fetch<any>(`/wallets/${walletId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const normalized = normalizeWallet(response);

      const idx = wallets.value.findIndex((w) => w.wallet_id === walletId);
      if (idx !== -1) wallets.value[idx] = normalized;
      else wallets.value.push(normalized);

      if (!currentWallet.value || currentWallet.value.wallet_id === walletId) {
        currentWallet.value = normalized;
      }

      return normalized;
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

      await $fetch<any>('/wallets', {
        method: 'POST',
        body: walletData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated wallets after creation
      await fetchWallets();

      return true;
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

      await $fetch<any>(`/wallets/${walletId}`, {
        method: 'PUT',
        body: walletData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated wallet after update
      await fetchWalletById(walletId);

      return true;
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

      // Fetch updated wallets after deletion
      await fetchWallets();

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

      await $fetch<any>(`/wallets/${walletId}/default`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated wallets after setting default
      await fetchWallets();

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao definir carteira padrão';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setCurrentWallet = (wallet: Wallet | null) => {
    currentWallet.value = wallet ? normalizeWallet(wallet) : null;
  };

  const getWalletById = (walletId: string) => {
    return wallets.value.find((w) => w.wallet_id === walletId);
  };

  const updateWalletBalance = (walletId: string, newBalance: number) => {
    const wallet = wallets.value.find((w) => w.wallet_id === walletId);
    if (wallet) {
      wallet.balance = toNumber(newBalance);
    }

    // Update current wallet if it's the one being updated
    if (currentWallet.value?.wallet_id === walletId) {
      currentWallet.value.balance = toNumber(newBalance);
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
