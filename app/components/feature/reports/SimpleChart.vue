<template>
  <div class="w-full h-full">
    <!-- Chart Placeholder -->
    <div
      class="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <div class="text-center">
        <Icon
          :name="icon"
          class="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ title }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ description }}
        </p>
        <div v-if="data && data.length > 0" class="mt-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div
              v-for="(item, index) in data.slice(0, 4)"
              :key="index"
              class="flex items-center space-x-2"
            >
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: colors[index % colors.length] }"
              ></div>
              <span class="text-gray-700 dark:text-gray-300">
                {{ item.label || item.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  icon: string;
  data?: Array<{ label?: string; name?: string; value: number }>;
  colors?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  colors: () => [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]
});
</script>
