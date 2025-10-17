<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Name -->
    <div>
      <label
        for="item-name"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Nome do Item *
      </label>
      <Input
        id="item-name"
        v-model="form.name"
        type="text"
        placeholder="Ex: Leite integral"
        :error="errors.name"
        required
        @blur="validateName"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.name }}
      </p>
    </div>

    <!-- Quantity and Unit -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label
          for="quantity"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Quantidade *
        </label>
        <Input
          id="quantity"
          v-model.number="form.quantity"
          type="number"
          min="1"
          step="1"
          placeholder="1"
          :error="errors.quantity"
          required
          @blur="validateQuantity"
        />
        <p
          v-if="errors.quantity"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ errors.quantity }}
        </p>
      </div>

      <div>
        <label
          for="unit"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Unidade
        </label>
        <Select
          id="unit"
          v-model="form.unit"
          :options="commonUnits"
          placeholder="Selecione"
        />
      </div>
    </div>

    <!-- Price -->
    <div>
      <label
        for="price"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Preço por unidade
      </label>
      <Input
        id="price"
        v-model.number="form.price"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        :error="errors.price"
        @blur="validatePrice"
      />
      <p
        v-if="errors.price"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.price }}
      </p>
    </div>

    <!-- Category -->
    <div>
      <label
        for="category"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Categoria
      </label>
      <Select
        id="category"
        v-model="form.expense_category_id"
        :options="categoryOptions"
        placeholder="Selecione uma categoria (opcional)"
      />
    </div>

    <!-- Notes -->
    <div>
      <label
        for="notes"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Observações
      </label>
      <textarea
        id="notes"
        v-model="form.notes"
        rows="2"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
        placeholder="Observações sobre o item..."
      />
    </div>

    <!-- Preview -->
    <div v-if="isFormValid" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <span class="font-medium">{{ form.name }}</span>
        <span class="mx-2">•</span>
        <span>{{ form.quantity }} {{ form.unit }}</span>
        <span v-if="form.price > 0" class="mx-2">•</span>
        <span v-if="form.price > 0"
          >{{ formatListValue(form.price) }} cada</span
        >
      </div>
      <div class="text-sm font-medium text-gray-900 dark:text-white mt-1">
        Subtotal: {{ getItemSubtotalFormatted() }}
      </div>
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
        {{ isEdit ? 'Atualizar' : 'Adicionar' }} Item
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { ShoppingListItem, CreateShoppingListItemRequest, UpdateShoppingListItemRequest } from '~/types';

interface Props {
  item?: ShoppingListItem;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  submit: [data: CreateShoppingListItemRequest | UpdateShoppingListItemRequest];
  cancel: [];
}>();

const { validateItemName, validateQuantity: validateQuantityHelper, validatePrice: validatePriceHelper, commonUnits, getItemSubtotalFormatted: getItemSubtotalFormattedHelper, formatListValue } = useShoppingLists();
const categoriesStore = useCategoriesStore();

const isEdit = computed(() => !!props.item);
const isSubmitting = ref(false);

const form = reactive({
  name: props.item?.name || '',
  quantity: props.item?.quantity || 1,
  unit: props.item?.unit || 'un',
  price: props.item?.price || 0,
  expense_category_id: props.item?.expense_category_id || '',
  notes: props.item?.notes || '',
});

const errors = reactive({
  name: '',
  quantity: '',
  price: '',
});

const categoryOptions = computed(() => {
  return categoriesStore.expenseCategories.map(category => ({
    value: category.category_id,
    label: category.name,
  }));
});

const isFormValid = computed(() => {
  return form.name.trim() !== '' &&
         !errors.name &&
         !errors.quantity &&
         !errors.price &&
         !isSubmitting.value;
});

const validateName = () => {
  const validation = validateItemName(form.name);
  errors.name = validation.isValid ? '' : validation.message || '';
};

const validateQuantity = () => {
  const validation = validateQuantityHelper(form.quantity);
  errors.quantity = validation.isValid ? '' : validation.message || '';
};

const validatePrice = () => {
  const validation = validatePriceHelper(form.price);
  errors.price = validation.isValid ? '' : validation.message || '';
};

const getItemSubtotalFormatted = () => {
  const subtotal = form.quantity * form.price;
  return formatListValue(subtotal);
};

const handleSubmit = () => {
  if (isSubmitting.value) return;

  validateName();
  validateQuantity();
  validatePrice();

  if (!isFormValid.value) return;

  isSubmitting.value = true;

  const data = {
    name: form.name.trim(),
    quantity: form.quantity,
    unit: form.unit,
    price: form.price,
    expense_category_id: form.expense_category_id || undefined,
    notes: form.notes.trim() || undefined,
  };

  emit('submit', data);
};

const handleCancel = () => {
  emit('cancel');
};

// Watch for prop changes
watch(() => props.item, (newItem) => {
  if (newItem) {
    form.name = newItem.name;
    form.quantity = newItem.quantity;
    form.unit = newItem.unit;
    form.price = newItem.price;
    form.expense_category_id = newItem.expense_category_id || '';
    form.notes = newItem.notes || '';
  }
}, { immediate: true });

// Reset submitting flag when loading changes
watch(() => props.loading, (newLoading) => {
  if (!newLoading) {
    isSubmitting.value = false;
  }
});

// Load categories if not already loaded
onMounted(async () => {
  if (categoriesStore.expenseCategories.length === 0) {
    try {
      await categoriesStore.fetchExpenseCategories();
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }
});
</script>
