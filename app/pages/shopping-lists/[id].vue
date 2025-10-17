<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading -->
      <div v-if="shoppingListsStore.isLoading" class="py-12">
        <LoadingSpinner center text="Carregando lista..." />
      </div>

      <!-- Error -->
      <div v-else-if="!currentList" class="text-center py-12">
        <Icon
          name="lucide:alert-circle"
          class="w-16 h-16 text-red-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Lista não encontrada
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          A lista que você está procurando não existe ou foi removida
        </p>
        <Button to="/shopping-lists" variant="primary">
          Voltar para Listas
        </Button>
      </div>

      <!-- List Details -->
      <div v-else class="space-y-6">
        <!-- Header -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div class="flex-1 min-w-0">
              <h1
                class="text-2xl font-bold text-gray-900 dark:text-white truncate"
              >
                {{ currentList.name }}
              </h1>
              <p class="text-gray-500 dark:text-gray-400 mt-1">
                {{ currentList.description || 'Lista de compras' }}
              </p>
            </div>

            <div
              class="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <Badge :variant="getStatusVariant(currentList.status)" size="lg">
                <Icon
                  :name="getStatusIcon(currentList.status)"
                  class="w-4 h-4 mr-1"
                />
                {{ getStatusLabel(currentList.status) }}
              </Badge>

              <div class="flex flex-wrap gap-2">
                <Button
                  to="/shopping-lists"
                  variant="outline"
                  icon="lucide:arrow-left"
                  size="sm"
                >
                  <span class="hidden sm:inline">Voltar</span>
                </Button>

                <Button
                  :to="`/shopping-lists/${currentList.shopping_list_id}/edit`"
                  variant="outline"
                  icon="lucide:edit"
                  size="sm"
                >
                  <span class="hidden sm:inline">Editar</span>
                </Button>

                <Button
                  v-if="currentList.status === 'active'"
                  variant="primary"
                  icon="lucide:check-circle"
                  size="sm"
                  @click="onComplete"
                >
                  <span class="hidden sm:inline">Concluir</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Compact Stats and Progress -->
        <Card class="p-4">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <Icon name="lucide:list" class="w-5 h-5 text-blue-600 mr-2" />
                <span
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Total</span
                >
              </div>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ stats.totalItems }}
              </p>
            </div>

            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <Icon
                  name="lucide:check-circle"
                  class="w-5 h-5 text-green-600 mr-2"
                />
                <span
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Comprados</span
                >
              </div>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ stats.purchasedItems }}
              </p>
            </div>

            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <Icon
                  name="lucide:clock"
                  class="w-5 h-5 text-orange-600 mr-2"
                />
                <span
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Pendentes</span
                >
              </div>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ stats.pendingItems }}
              </p>
            </div>

            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <Icon
                  name="lucide:dollar-sign"
                  class="w-5 h-5 text-purple-600 mr-2"
                />
                <span
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Valor</span
                >
              </div>
              <p class="text-lg font-bold text-gray-900 dark:text-white">
                {{ formatListValue(stats.totalValue) }}
              </p>
            </div>
          </div>

          <!-- Compact Progress -->
          <div v-if="stats.totalItems > 0" class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Progresso</span
              >
              <span class="text-sm font-bold text-gray-900 dark:text-white"
                >{{ stats.completionPercentage }}%</span
              >
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500 ease-out"
                :class="getProgressColor(stats.completionPercentage)"
                :style="{ width: `${Math.min(100, stats.completionPercentage)}%` }"
              />
            </div>
            <div
              class="flex justify-between text-xs text-gray-500 dark:text-gray-400"
            >
              <span>Comprado: {{ formatListValue(stats.purchasedValue) }}</span>
              <span>Pendente: {{ formatListValue(stats.pendingValue) }}</span>
            </div>
          </div>
        </Card>

        <!-- Add Item Button -->
        <div
          v-if="currentList.status !== 'completed'"
          class="flex justify-center sm:justify-start"
        >
          <Button
            variant="primary"
            icon="lucide:plus"
            size="lg"
            class="w-full sm:w-auto"
            @click="showAddModal = true"
          >
            Adicionar Item à Lista
          </Button>
        </div>

        <!-- Items List -->
        <div class="space-y-6">
          <!-- Pending Items -->
          <div v-if="pendingItems.length > 0">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Itens Pendentes
              </h3>
              <Badge variant="warning" size="sm">
                {{ pendingItems.length }}
                item{{ pendingItems.length !== 1 ? 's' : '' }}
              </Badge>
            </div>
            <div
              class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                <ShoppingListItemRow
                  v-for="item in pendingItems"
                  :key="item.item_id"
                  :item="item"
                  :loading="shoppingListsStore.isLoading"
                  @toggle="onToggleItem"
                  @edit="onEditItem"
                  @delete="onDeleteItem"
                />
              </div>
            </div>
          </div>

          <!-- Purchased Items -->
          <div v-if="purchasedItems.length > 0">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Itens Comprados
              </h3>
              <Badge variant="success" size="sm">
                {{ purchasedItems.length }}
                item{{ purchasedItems.length !== 1 ? 's' : '' }}
              </Badge>
            </div>
            <div
              class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                <ShoppingListItemRow
                  v-for="item in purchasedItems"
                  :key="item.item_id"
                  :item="item"
                  :loading="shoppingListsStore.isLoading"
                  @toggle="onToggleItem"
                  @edit="onEditItem"
                  @delete="onDeleteItem"
                />
              </div>
            </div>
          </div>

          <!-- Empty Items -->
          <div v-if="currentList.items.length === 0" class="text-center py-12">
            <div class="max-w-md mx-auto">
              <Icon
                name="lucide:shopping-bag"
                class="w-16 h-16 text-gray-400 mx-auto mb-4"
              />
              <h3
                class="text-lg font-medium text-gray-900 dark:text-white mb-2"
              >
                Nenhum item adicionado
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-6">
                Adicione itens à sua lista de compras para começar
              </p>
              <Button
                v-if="currentList.status !== 'completed'"
                variant="primary"
                icon="lucide:plus"
                size="lg"
                @click="showAddModal = true"
              >
                Adicionar Primeiro Item
              </Button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <p>Criada {{ formatListRelativeDate(currentList.created_at) }}</p>
              <p v-if="currentList.completed_at" class="mt-1">
                Concluída {{ formatListRelativeDate(currentList.completed_at) }}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <Button
                :to="`/shopping-lists/${currentList.shopping_list_id}/edit`"
                variant="outline"
                icon="lucide:edit"
                size="sm"
                class="w-full sm:w-auto"
              >
                Editar Lista
              </Button>

              <Button
                variant="outline"
                icon="lucide:trash-2"
                size="sm"
                class="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                @click="onDelete"
              >
                Excluir Lista
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <Modal v-model:is-open="showAddModal" title="Adicionar Item" size="lg">
      <ShoppingListItemForm
        :loading="shoppingListsStore.isLoading || isAddingItem"
        @submit="onAddItem"
        @cancel="showAddModal = false"
      />
    </Modal>

    <!-- Edit Item Modal -->
    <Modal v-model:is-open="showEditModal" title="Editar Item" size="lg">
      <ShoppingListItemForm
        v-if="editingItem"
        :item="editingItem"
        :loading="shoppingListsStore.isLoading"
        @submit="onUpdateItem"
        @cancel="showEditModal = false"
      />
    </Modal>

    <!-- Confirm Purchase Modal -->
    <Modal
      v-model:is-open="showConfirmModal"
      title="Confirmar Compra"
      size="md"
    >
      <div v-if="confirmingItem" class="space-y-4">
        <div class="text-center">
          <Icon
            name="lucide:shopping-cart"
            class="w-12 h-12 text-green-600 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Marcar como Comprado
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Tem certeza que deseja marcar o item
            <strong>"{{ confirmingItem.name }}"</strong> como comprado?
          </p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div
          class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <Button
            variant="outline"
            :disabled="shoppingListsStore.isLoading"
            @click="showConfirmModal = false"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon="lucide:check"
            :loading="shoppingListsStore.isLoading"
            @click="onConfirmPurchase"
          >
            Confirmar Compra
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingListItem, CreateShoppingListItemRequest, UpdateShoppingListItemRequest } from '~/types';

definePageMeta({
  middleware: 'auth'
});

const route = useRoute();
const shoppingListsStore = useShoppingListsStore();
const {
  getStatusLabel,
  getStatusVariant,
  getStatusIcon,
  getListStats,
  formatListValue,
  formatListRelativeDate,
  getProgressColor,
  filterItemsByPurchased
} = useShoppingLists();
const { success, error: showError } = useNotifications();

const listId = route.params.id as string;

const currentList = computed(() => shoppingListsStore.currentList);
const stats = computed(() => currentList.value ? getListStats(currentList.value) : {
  totalItems: 0,
  purchasedItems: 0,
  pendingItems: 0,
  completionPercentage: 0,
  totalValue: 0,
  purchasedValue: 0,
  pendingValue: 0,
});

const pendingItems = computed(() => {
  if (!currentList.value) return [];
  return filterItemsByPurchased(currentList.value.items, false);
});

const purchasedItems = computed(() => {
  if (!currentList.value) return [];
  return filterItemsByPurchased(currentList.value.items, true);
});

const showAddModal = ref(false);
const showEditModal = ref(false);
const showConfirmModal = ref(false);
const editingItem = ref<ShoppingListItem | null>(null);
const confirmingItem = ref<ShoppingListItem | null>(null);
const isAddingItem = ref(false);

const onAddItem = async (data: CreateShoppingListItemRequest | UpdateShoppingListItemRequest) => {
  if (isAddingItem.value) return;

  try {
    isAddingItem.value = true;
    // Type assertion for addItem since we know it's a create request in this context
    await shoppingListsStore.addItem(listId, data as CreateShoppingListItemRequest);
    success('Item adicionado com sucesso!');
    showAddModal.value = false;
  } catch {
    showError('Erro ao adicionar item');
  } finally {
    isAddingItem.value = false;
  }
};

const onToggleItem = async (item: ShoppingListItem) => {
  // Only allow marking as purchased (one-way)
  if (!item.is_purchased) {
    confirmingItem.value = item;
    showConfirmModal.value = true;
  }
};

const onConfirmPurchase = async () => {
  if (!confirmingItem.value) return;

  try {
    await shoppingListsStore.toggleItemPurchased(listId, confirmingItem.value.item_id);
    success('Item marcado como comprado');
    showConfirmModal.value = false;
    confirmingItem.value = null;
  } catch {
    showError('Erro ao marcar item como comprado');
  }
};

const onEditItem = (item: ShoppingListItem) => {
  editingItem.value = item;
  showEditModal.value = true;
};

const onUpdateItem = async (data: UpdateShoppingListItemRequest) => {
  if (!editingItem.value) return;

  try {
    await shoppingListsStore.updateItem(listId, editingItem.value.item_id, data);
    success('Item atualizado com sucesso!');
    showEditModal.value = false;
    editingItem.value = null;
  } catch {
    showError('Erro ao atualizar item');
  }
};

const onDeleteItem = async (item: ShoppingListItem) => {
  if (confirm(`Tem certeza que deseja excluir o item "${item.name}"?`)) {
    try {
      await shoppingListsStore.deleteItem(listId, item.item_id);
      success('Item excluído com sucesso');
    } catch {
      showError('Erro ao excluir item');
    }
  }
};

const onComplete = async () => {
  if (confirm(`Tem certeza que deseja marcar a lista "${currentList.value?.name}" como concluída?`)) {
    try {
      await shoppingListsStore.completeList(listId);
      success('Lista marcada como concluída');
    } catch {
      showError('Erro ao concluir lista');
    }
  }
};

const onDelete = async () => {
  if (confirm(`Tem certeza que deseja excluir a lista "${currentList.value?.name}"? Esta ação não pode ser desfeita.`)) {
    try {
      await shoppingListsStore.deleteList(listId);
      success('Lista excluída com sucesso');
      navigateTo('/shopping-lists');
    } catch {
      showError('Erro ao excluir lista');
    }
  }
};

// Load list on mount
onMounted(async () => {
  try {
    await shoppingListsStore.fetchListById(listId);
  } catch {
    showError('Erro ao carregar lista de compras');
  }
});
</script>
