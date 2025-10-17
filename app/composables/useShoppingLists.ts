import type { ShoppingList, ShoppingListItem } from '~/types';

export const useShoppingLists = () => {
  const { formatCurrency, formatDate, formatRelativeTime } = useApi();

  // Status formatting
  const getStatusLabel = (status: ShoppingList['status']): string => {
    const labels = {
      draft: 'Rascunho',
      active: 'Ativa',
      completed: 'Concluída',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (
    status: ShoppingList['status']
  ): 'default' | 'success' | 'warning' | 'error' => {
    const variants = {
      draft: 'default' as const,
      active: 'success' as const,
      completed: 'success' as const,
      cancelled: 'error' as const,
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status: ShoppingList['status']): string => {
    const icons = {
      draft: 'lucide:edit-3',
      active: 'lucide:shopping-cart',
      completed: 'lucide:check-circle',
      cancelled: 'lucide:x-circle',
    };
    return icons[status] || 'lucide:shopping-cart';
  };

  // List statistics
  const getListStats = (list: ShoppingList) => {
    const totalItems = list.items.length;
    const purchasedItems = list.items.filter(
      (item) => item.is_purchased
    ).length;
    const pendingItems = totalItems - purchasedItems;
    const completionPercentage =
      totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

    const totalValue = list.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const purchasedValue = list.items
      .filter((item) => item.is_purchased)
      .reduce((total, item) => total + item.price * item.quantity, 0);
    const pendingValue = totalValue - purchasedValue;

    return {
      totalItems,
      purchasedItems,
      pendingItems,
      completionPercentage,
      totalValue,
      purchasedValue,
      pendingValue,
    };
  };

  // Item calculations
  const getItemSubtotal = (item: ShoppingListItem): number => {
    return item.price * item.quantity;
  };

  const getItemSubtotalFormatted = (item: ShoppingListItem): string => {
    return formatCurrency(getItemSubtotal(item));
  };

  // List formatting
  const formatListDate = (date: string): string => {
    return formatDate(date);
  };

  const formatListRelativeDate = (date: string): string => {
    return formatRelativeTime(date);
  };

  const formatListValue = (value: number): string => {
    return formatCurrency(value);
  };

  // Validation helpers
  const validateListName = (
    name: string
  ): { isValid: boolean; message?: string } => {
    if (!name.trim()) {
      return { isValid: false, message: 'Nome é obrigatório' };
    }
    if (name.length > 255) {
      return {
        isValid: false,
        message: 'Nome deve ter no máximo 255 caracteres',
      };
    }
    return { isValid: true };
  };

  const validateItemName = (
    name: string
  ): { isValid: boolean; message?: string } => {
    if (!name.trim()) {
      return { isValid: false, message: 'Nome do item é obrigatório' };
    }
    if (name.length > 255) {
      return {
        isValid: false,
        message: 'Nome do item deve ter no máximo 255 caracteres',
      };
    }
    return { isValid: true };
  };

  const validateQuantity = (
    quantity: number
  ): { isValid: boolean; message?: string } => {
    if (quantity <= 0) {
      return { isValid: false, message: 'Quantidade deve ser maior que zero' };
    }
    if (!Number.isInteger(quantity)) {
      return {
        isValid: false,
        message: 'Quantidade deve ser um número inteiro',
      };
    }
    return { isValid: true };
  };

  const validatePrice = (
    price: number
  ): { isValid: boolean; message?: string } => {
    if (price < 0) {
      return { isValid: false, message: 'Preço não pode ser negativo' };
    }
    if (price > 999999.99) {
      return { isValid: false, message: 'Preço muito alto' };
    }
    return { isValid: true };
  };

  const validateUnit = (
    unit: string
  ): { isValid: boolean; message?: string } => {
    if (unit.length > 10) {
      return {
        isValid: false,
        message: 'Unidade deve ter no máximo 10 caracteres',
      };
    }
    return { isValid: true };
  };

  // UI helpers
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number): string => {
    if (percentage >= 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 75) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 25) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Common units
  const commonUnits = [
    { value: 'un', label: 'Unidade' },
    { value: 'kg', label: 'Quilograma' },
    { value: 'g', label: 'Grama' },
    { value: 'l', label: 'Litro' },
    { value: 'ml', label: 'Mililitro' },
    { value: 'cx', label: 'Caixa' },
    { value: 'pct', label: 'Pacote' },
    { value: 'dz', label: 'Dúzia' },
    { value: 'm', label: 'Metro' },
    { value: 'cm', label: 'Centímetro' },
  ];

  // Sort helpers
  const sortListsByDate = (
    lists: ShoppingList[],
    ascending = false
  ): ShoppingList[] => {
    return [...lists].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  };

  const sortListsByStatus = (lists: ShoppingList[]): ShoppingList[] => {
    const statusOrder = ['active', 'draft', 'completed', 'cancelled'];
    return [...lists].sort((a, b) => {
      const indexA = statusOrder.indexOf(a.status);
      const indexB = statusOrder.indexOf(b.status);
      return indexA - indexB;
    });
  };

  const sortItemsByName = (
    items: ShoppingListItem[],
    ascending = true
  ): ShoppingListItem[] => {
    return [...items].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return ascending
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  };

  const sortItemsByPurchased = (
    items: ShoppingListItem[]
  ): ShoppingListItem[] => {
    return [...items].sort((a, b) => {
      if (a.is_purchased === b.is_purchased) return 0;
      return a.is_purchased ? 1 : -1;
    });
  };

  // Filter helpers
  const filterItemsByPurchased = (
    items: ShoppingListItem[],
    purchased: boolean
  ): ShoppingListItem[] => {
    return items.filter((item) => item.is_purchased === purchased);
  };

  const filterListsByStatus = (
    lists: ShoppingList[],
    status: ShoppingList['status']
  ): ShoppingList[] => {
    return lists.filter((list) => list.status === status);
  };

  return {
    // Status formatting
    getStatusLabel,
    getStatusVariant,
    getStatusIcon,

    // Statistics
    getListStats,
    getItemSubtotal,
    getItemSubtotalFormatted,

    // Formatting
    formatListDate,
    formatListRelativeDate,
    formatListValue,

    // Validation
    validateListName,
    validateItemName,
    validateQuantity,
    validatePrice,
    validateUnit,

    // UI helpers
    getProgressColor,
    getProgressTextColor,
    commonUnits,

    // Sorting
    sortListsByDate,
    sortListsByStatus,
    sortItemsByName,
    sortItemsByPurchased,

    // Filtering
    filterItemsByPurchased,
    filterListsByStatus,
  };
};

