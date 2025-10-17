<template>
  <div
    class="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    :class="{
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700': item.is_purchased,
      'opacity-60': item.is_purchased
    }"
  >
    <!-- Checkbox -->
    <div class="flex-shrink-0">
      <button
        @click="handleTogglePurchased"
        class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
        :class="{
          'bg-green-500 border-green-500 text-white': item.is_purchased,
          'border-gray-300 dark:border-gray-600 hover:border-green-400': !item.is_purchased
        }"
        :disabled="loading"
      >
        <Icon v-if="item.is_purchased" name="lucide:check" class="w-3 h-3" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h4
            class="text-sm font-medium text-gray-900 dark:text-white truncate"
            :class="{ 'line-through': item.is_purchased }"
          >
            {{ item.name }}
          </h4>

          <div
            class="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400"
          >
            <span>{{ item.quantity }} {{ item.unit }}</span>
            <span v-if="item.price > 0"
              >{{ formatListValue(item.price) }} cada</span
            >
            <span v-if="item.category" class="flex items-center space-x-1">
              <Icon name="lucide:tag" class="w-3 h-3" />
              <span>{{ item.category.name }}</span>
            </span>
          </div>

          <p
            v-if="item.notes"
            class="text-xs text-gray-600 dark:text-gray-400 mt-1"
          >
            {{ item.notes }}
          </p>
        </div>

        <!-- Subtotal -->
        <div class="flex-shrink-0 text-right">
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ getItemSubtotalFormatted(item) }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ item.quantity }} × {{ formatListValue(item.price) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex-shrink-0 flex items-center space-x-2">
      <button
        @click="handleEdit"
        class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        :disabled="loading"
      >
        <Icon name="lucide:edit" class="w-4 h-4" />
      </button>

      <button
        @click="handleDelete"
        class="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
        :disabled="loading"
      >
        <Icon name="lucide:trash-2" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingListItem } from '~/types';

interface Props {
  item: ShoppingListItem;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  toggle: [item: ShoppingListItem];
  edit: [item: ShoppingListItem];
  delete: [item: ShoppingListItem];
}>();

const { getItemSubtotalFormatted, formatListValue } = useShoppingLists();

const handleTogglePurchased = () => {
  emit('toggle', props.item);
};

const handleEdit = () => {
  emit('edit', props.item);
};

const handleDelete = () => {
  emit('delete', props.item);
};
</script>

