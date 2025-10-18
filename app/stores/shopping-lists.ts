import { defineStore } from 'pinia';
import type {
  ShoppingList,
  ShoppingListItem,
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  CreateShoppingListItemRequest,
  UpdateShoppingListItemRequest,
} from '~/types';

type AnyShoppingList = Partial<ShoppingList> & Record<string, any>;
type AnyShoppingListItem = Partial<ShoppingListItem> & Record<string, any>;

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v ?? '0').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const normalizeShoppingList = (raw: AnyShoppingList): ShoppingList => {
  return {
    shopping_list_id: String(raw.shopping_list_id ?? raw.id ?? ''),
    user_id: String(raw.user_id ?? ''),
    name: String(raw.name ?? ''),
    description: raw.description ? String(raw.description) : undefined,
    total_value: toNumber(raw.total_value),
    status: raw.status || 'draft',
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? ''),
    completed_at: raw.completed_at ? String(raw.completed_at) : null,
    active: Boolean(raw.active),
    items: (raw.items || []).map(normalizeShoppingListItem),
  };
};

const normalizeShoppingListItem = (
  raw: AnyShoppingListItem
): ShoppingListItem => {
  return {
    item_id: String(raw.item_id ?? raw.id ?? ''),
    shopping_list_id: String(raw.shopping_list_id ?? ''),
    expense_category_id: raw.expense_category_id
      ? String(raw.expense_category_id)
      : undefined,
    name: String(raw.name ?? ''),
    quantity: toNumber(raw.quantity),
    unit: String(raw.unit ?? 'un'),
    price: toNumber(raw.price),
    is_purchased: Boolean(raw.is_purchased),
    notes: raw.notes ? String(raw.notes) : undefined,
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? ''),
    active: Boolean(raw.active),
    category: raw.category ? raw.category : undefined,
  };
};

export const useShoppingListsStore = defineStore('shopping-lists', () => {
  // State
  const lists = ref<ShoppingList[]>([]);
  const currentList = ref<ShoppingList | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const listsByStatus = computed(() => {
    const grouped: Record<string, ShoppingList[]> = {
      draft: [],
      active: [],
      completed: [],
      cancelled: [],
    };

    lists.value.forEach((list) => {
      if (grouped[list.status]) {
        grouped[list.status].push(list);
      }
    });

    return grouped;
  });

  const totalLists = computed(() => lists.value.length);

  const activeListsCount = computed(
    () => lists.value.filter((list) => list.status === 'active').length
  );

  const completedListsCount = computed(
    () => lists.value.filter((list) => list.status === 'completed').length
  );

  // Actions - Lists
  const fetchLists = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<any[]>('/shopping-lists', {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      lists.value = (response || []).map(normalizeShoppingList);
      return lists.value;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar listas de compras';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchListById = async (listId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<any>(`/shopping-lists/${listId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      const normalized = normalizeShoppingList(response);

      const idx = lists.value.findIndex((l) => l.shopping_list_id === listId);
      if (idx !== -1) {
        lists.value[idx] = normalized;
      } else {
        lists.value.push(normalized);
      }

      if (!currentList.value || currentList.value.shopping_list_id === listId) {
        currentList.value = normalized;
      }

      return normalized;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao obter lista de compras';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createList = async (listData: CreateShoppingListRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch<any>('/shopping-lists', {
        method: 'POST',
        body: listData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated lists after creation
      await fetchLists();

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao criar lista de compras';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateList = async (
    listId: string,
    listData: UpdateShoppingListRequest
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch<any>(`/shopping-lists/${listId}`, {
        method: 'PUT',
        body: listData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated list after update
      await fetchListById(listId);

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar lista de compras';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteList = async (listId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch(`/shopping-lists/${listId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated lists after deletion
      await fetchLists();

      if (currentList.value?.shopping_list_id === listId) {
        currentList.value = null;
      }

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao excluir lista de compras';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const completeList = async (listId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch<any>(`/shopping-lists/${listId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated list after completion
      await fetchListById(listId);

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao concluir lista de compras';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Actions - Items
  const addItem = async (
    listId: string,
    itemData: CreateShoppingListItemRequest
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch<any>(`/shopping-lists/${listId}/items`, {
        method: 'POST',
        body: itemData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated list after adding item
      await fetchListById(listId);

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao adicionar item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateItem = async (
    listId: string,
    itemId: string,
    itemData: UpdateShoppingListItemRequest
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch<any>(`/shopping-lists/${listId}/items/${itemId}`, {
        method: 'PUT',
        body: itemData,
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated list after updating item
      await fetchListById(listId);

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao atualizar item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteItem = async (listId: string, itemId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch(`/shopping-lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated list after deleting item
      await fetchListById(listId);

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao excluir item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleItemPurchased = async (listId: string, itemId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch<any>(`/shopping-lists/${listId}/items/${itemId}/toggle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        baseURL: useRuntimeConfig().public.apiBase,
      });

      // Fetch updated list after toggling item
      await fetchListById(listId);

      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao alternar status do item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Helper functions
  const setCurrentList = (list: ShoppingList | null) => {
    currentList.value = list ? normalizeShoppingList(list) : null;
  };

  const getListById = (listId: string) => {
    return lists.value.find((l) => l.shopping_list_id === listId);
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    lists,
    currentList,
    isLoading,
    error,

    // Getters
    listsByStatus,
    totalLists,
    activeListsCount,
    completedListsCount,

    // Actions - Lists
    fetchLists,
    fetchListById,
    createList,
    updateList,
    deleteList,
    completeList,

    // Actions - Items
    addItem,
    updateItem,
    deleteItem,
    toggleItemPurchased,

    // Helpers
    setCurrentList,
    getListById,
    clearError,
  };
});
