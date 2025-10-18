<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <PageHeader
      title="Nova Lista de Compras"
      subtitle="Crie uma nova lista para organizar suas compras"
    >
      <template #actions>
        <Button to="/shopping-lists" variant="outline" icon="lucide:arrow-left">
          Voltar
        </Button>
      </template>
    </PageHeader>

    <!-- Form -->
    <Card>
      <div class="p-6">
        <ShoppingListForm
          :loading="shoppingListsStore.isLoading || isCreating"
          @submit="onCreateList"
          @cancel="onCancel"
        />
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import ShoppingListForm from '~/components/feature/shopping-lists/ShoppingListForm.vue';

definePageMeta({
  middleware: 'auth'
});

const shoppingListsStore = useShoppingListsStore();
const { success, error: showError } = useNotifications();
const isCreating = ref(false);

const onCreateList = async (data: any) => {
  if (isCreating.value) return;

  try {
    isCreating.value = true;
    shoppingListsStore.clearError();
    const newList = await shoppingListsStore.createList(data);
    success('Lista criada com sucesso!');
    navigateTo(`/shopping-lists/${newList.shopping_list_id}`);
  } catch (err: any) {
    showError('Erro ao criar lista', err?.message || 'Tente novamente mais tarde');
  } finally {
    isCreating.value = false;
  }
};

const onCancel = () => {
  navigateTo('/shopping-lists');
};
</script>
