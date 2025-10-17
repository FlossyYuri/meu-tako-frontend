<template>
  <div class="max-w-2xl mx-auto space-y-6">
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

    <!-- Edit Form -->
    <div v-else>
      <!-- Header -->
      <PageHeader
        title="Editar Lista de Compras"
        :subtitle="`Editando: ${currentList.name}`"
      >
        <template #actions>
          <Button
            :to="`/shopping-lists/${currentList.shopping_list_id}`"
            variant="outline"
            icon="lucide:arrow-left"
          >
            Voltar
          </Button>
        </template>
      </PageHeader>

      <!-- Form -->
      <Card>
        <div class="p-6">
          <ShoppingListForm
            :list="currentList"
            :loading="shoppingListsStore.isLoading"
            @submit="onUpdateList"
            @cancel="onCancel"
          />
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShoppingListForm from '~/components/feature/shopping-lists/ShoppingListForm.vue';

definePageMeta({
  middleware: 'auth'
});

const route = useRoute();
const shoppingListsStore = useShoppingListsStore();
const { success, error: showError } = useNotifications();

const listId = route.params.id as string;

const currentList = computed(() => shoppingListsStore.currentList);

const onUpdateList = async (data: any) => {
  try {
    shoppingListsStore.clearError();
    await shoppingListsStore.updateList(listId, data);
    success('Lista atualizada com sucesso!');
    navigateTo(`/shopping-lists/${listId}`);
  } catch (err: any) {
    showError('Erro ao atualizar lista', err?.message || 'Tente novamente mais tarde');
  }
};

const onCancel = () => {
  navigateTo(`/shopping-lists/${listId}`);
};

// Load list on mount
onMounted(async () => {
  try {
    await shoppingListsStore.fetchListById(listId);
  } catch (error) {
    showError('Erro ao carregar lista de compras');
  }
});
</script>

