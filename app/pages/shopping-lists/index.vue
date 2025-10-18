<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Listas de Compras"
      subtitle="Organize suas compras e economize"
    >
      <template #actions>
        <Button to="/shopping-lists/new" variant="primary" icon="lucide:plus">
          Nova Lista
        </Button>
      </template>
    </PageHeader>

    <!-- Loading State with Skeletons -->
    <div
      v-if="shoppingListsStore.isLoading"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <Card v-for="i in 6" :key="i" class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <Skeleton width="2.5rem" height="2.5rem" rounded="lg" />
            <div>
              <Skeleton width="10rem" height="1rem" className="mb-2" />
              <Skeleton width="6rem" height="0.75rem" />
            </div>
          </div>
          <Skeleton width="5rem" height="1.75rem" rounded="full" />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Skeleton width="6rem" height="0.875rem" />
            <Skeleton width="8rem" height="1.5rem" />
          </div>
          <div class="flex items-center justify-between">
            <Skeleton width="7rem" height="0.875rem" />
            <Skeleton width="5rem" height="0.875rem" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="shoppingListsStore.lists.length === 0"
      class="text-center py-12"
    >
      <Icon
        name="lucide:shopping-cart"
        class="w-16 h-16 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhuma lista de compras encontrada
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Crie sua primeira lista de compras para organizar suas compras
      </p>
      <Button to="/shopping-lists/new" variant="primary" icon="lucide:plus">
        Criar Primeira Lista
      </Button>
    </div>

    <!-- Lists Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ShoppingListCard
        v-for="list in sortedLists"
        :key="list.shopping_list_id"
        :list="list"
        @select="onSelect"
        @view="onView"
        @edit="onEdit"
        @complete="onComplete"
        @delete="onDelete"
      />
    </div>

    <!-- Summary Cards -->
    <div
      v-if="shoppingListsStore.lists.length > 0"
      class="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      <Card class="p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon
              name="lucide:shopping-cart"
              class="w-8 h-8 text-primary-600"
            />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total de Listas
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ shoppingListsStore.totalLists }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="lucide:activity" class="w-8 h-8 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Listas Ativas
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ shoppingListsStore.activeListsCount }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="lucide:check-circle" class="w-8 h-8 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Concluídas
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ shoppingListsStore.completedListsCount }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="lucide:dollar-sign" class="w-8 h-8 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Valor Total
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ formatListValue(totalValue) }}
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Error -->
    <div
      v-if="shoppingListsStore.error"
      class="text-center text-error-600 dark:text-error-400"
    >
      {{ shoppingListsStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import ShoppingListCard from '~/components/feature/shopping-lists/ShoppingListCard.vue';

definePageMeta({
  middleware: 'auth'
});

const shoppingListsStore = useShoppingListsStore();
const { formatListValue, sortListsByStatus } = useShoppingLists();
const { success, error: showError } = useNotifications();

const sortedLists = computed(() => {
  return sortListsByStatus(shoppingListsStore.lists);
});

const totalValue = computed(() => {
  return shoppingListsStore.lists.reduce((total, list) => total + list.total_value, 0);
});

const onSelect = (list: any) => {
  shoppingListsStore.setCurrentList(list);
  navigateTo(`/shopping-lists/${list.shopping_list_id}`);
};

const onView = (list: any) => {
  navigateTo(`/shopping-lists/${list.shopping_list_id}`);
};

const onEdit = (list: any) => {
  navigateTo(`/shopping-lists/${list.shopping_list_id}/edit`);
};

const onComplete = async (list: any) => {
  if (confirm(`Tem certeza que deseja marcar a lista "${list.name}" como concluída?`)) {
    try {
      await shoppingListsStore.completeList(list.shopping_list_id);
      success('Lista marcada como concluída');
    } catch (error) {
      showError('Erro ao concluir lista');
    }
  }
};

const onDelete = async (list: any) => {
  if (confirm(`Tem certeza que deseja excluir a lista "${list.name}"? Esta ação não pode ser desfeita.`)) {
    try {
      await shoppingListsStore.deleteList(list.shopping_list_id);
      success('Lista excluída com sucesso');
    } catch (error) {
      showError('Erro ao excluir lista');
    }
  }
};

// Load lists on mount
onMounted(async () => {
  try {
    await shoppingListsStore.fetchLists();
  } catch (error) {
    showError('Erro ao carregar listas de compras');
  }
});
</script>

