<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Name -->
    <div>
      <label
        for="name"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Nome da Lista *
      </label>
      <Input
        id="name"
        v-model="form.name"
        type="text"
        placeholder="Ex: Compras do supermercado"
        :error="errors.name"
        required
        @blur="validateName"
      />
    </div>

    <!-- Description -->
    <div>
      <label
        for="description"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Descrição
      </label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
        placeholder="Descrição opcional da lista..."
      />
    </div>

    <!-- Status -->
    <div>
      <label
        for="status"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Status
      </label>
      <Select
        id="status"
        v-model="form.status"
        :options="statusOptions"
        placeholder="Selecione o status"
      />
    </div>

    <!-- Actions -->
    <div
      class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <Button
        type="button"
        variant="outline"
        @click="handleCancel"
        :disabled="loading"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="primary"
        :loading="loading"
        :disabled="!isFormValid"
      >
        {{ isEdit ? 'Atualizar' : 'Criar' }} Lista
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { ShoppingList, CreateShoppingListRequest, UpdateShoppingListRequest } from '~/types';

interface Props {
  list?: ShoppingList;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  submit: [data: CreateShoppingListRequest | UpdateShoppingListRequest];
  cancel: [];
}>();

const { validateListName } = useShoppingLists();

const isEdit = computed(() => !!props.list);
const isSubmitting = ref(false);

const form = reactive({
  name: props.list?.name || '',
  description: props.list?.description || '',
  status: props.list?.status || 'draft',
});

const errors = reactive({
  name: '',
});

const statusOptions = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Ativa' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
];

const isFormValid = computed(() => {
  return form.name.trim() !== '' && !errors.name && !isSubmitting.value;
});

const validateName = () => {
  const validation = validateListName(form.name);
  errors.name = validation.isValid ? '' : validation.message || '';
};

const handleSubmit = () => {
  if (isSubmitting.value) return;

  validateName();

  if (!isFormValid.value) return;

  isSubmitting.value = true;

  const data = {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    status: form.status,
  };

  emit('submit', data);
};

const handleCancel = () => {
  emit('cancel');
};

// Watch for prop changes
watch(() => props.list, (newList) => {
  if (newList) {
    form.name = newList.name;
    form.description = newList.description || '';
    form.status = newList.status;
  }
}, { immediate: true });

// Reset submitting flag when loading changes
watch(() => props.loading, (newLoading) => {
  if (!newLoading) {
    isSubmitting.value = false;
  }
});
</script>
