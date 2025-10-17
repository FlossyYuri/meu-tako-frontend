<template>
  <Card
    class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    @click="emit('select', list)"
  >
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"
          >
            <Icon
              :name="getStatusIcon(list.status)"
              class="w-5 h-5 text-primary-600"
            />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ list.name }}
            </h3>
            <p
              v-if="list.description"
              class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
            >
              {{ list.description }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Badge :variant="getStatusVariant(list.status)" size="sm">
            {{ getStatusLabel(list.status) }}
          </Badge>

          <div ref="menuRef" class="relative">
            <button
              class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              @click.stop="toggleMenu"
            >
              <Icon
                name="lucide:more-horizontal"
                class="w-4 h-4 text-gray-500"
              />
            </button>

            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                <div class="py-1">
                  <button
                    class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    @click.stop="emit('view', list)"
                  >
                    <Icon name="lucide:eye" class="w-4 h-4" />
                    <span>Visualizar</span>
                  </button>

                  <button
                    class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    @click.stop="emit('edit', list)"
                  >
                    <Icon name="lucide:edit" class="w-4 h-4" />
                    <span>Editar</span>
                  </button>

                  <button
                    v-if="list.status === 'active'"
                    class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
                    @click.stop="emit('complete', list)"
                  >
                    <Icon name="lucide:check-circle" class="w-4 h-4" />
                    <span>Concluir</span>
                  </button>

                  <button
                    v-if="canDelete"
                    class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                    @click.stop="emit('delete', list)"
                  >
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <!-- Progress -->
        <div v-if="stats.totalItems > 0">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600 dark:text-gray-400">Progresso</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ stats.completionPercentage }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="getProgressColor(stats.completionPercentage)"
              :style="{ width: `${Math.min(100, stats.completionPercentage)}%` }"
            />
          </div>
        </div>

        <!-- Items count -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Itens</span>
          <span class="font-medium text-gray-900 dark:text-white">
            {{ stats.purchasedItems }}/{{ stats.totalItems }}
          </span>
        </div>

        <!-- Total value -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Valor total</span>
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ formatListValue(stats.totalValue) }}
          </span>
        </div>

        <!-- Purchased value -->
        <div
          v-if="stats.purchasedValue > 0"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-gray-600 dark:text-gray-400">Comprado</span>
          <span class="font-medium text-green-600 dark:text-green-400">
            {{ formatListValue(stats.purchasedValue) }}
          </span>
        </div>

        <!-- Pending value -->
        <div
          v-if="stats.pendingValue > 0"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-gray-600 dark:text-gray-400">Pendente</span>
          <span class="font-medium text-orange-600 dark:text-orange-400">
            {{ formatListValue(stats.pendingValue) }}
          </span>
        </div>

        <!-- Date info -->
        <div
          class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
        >
          <span>Criada {{ formatListRelativeDate(list.created_at) }}</span>
          <span v-if="list.completed_at">
            Concluída {{ formatListRelativeDate(list.completed_at) }}
          </span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/types';

interface Props {
  list: ShoppingList;
  canDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canDelete: true,
});

const emit = defineEmits<{
  select: [list: ShoppingList];
  view: [list: ShoppingList];
  edit: [list: ShoppingList];
  complete: [list: ShoppingList];
  delete: [list: ShoppingList];
}>();

const {
  getStatusLabel,
  getStatusVariant,
  getStatusIcon,
  getListStats,
  formatListValue,
  formatListRelativeDate,
  getProgressColor,
} = useShoppingLists();

const showMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const toggleMenu = () => (showMenu.value = !showMenu.value);

const stats = computed(() => getListStats(props.list));

onClickOutside(menuRef, () => (showMenu.value = false));
</script>
