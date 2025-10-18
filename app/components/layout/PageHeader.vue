<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
  >
    <div>
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="text-sm text-gray-600 dark:text-gray-400 mt-0.5"
      >
        {{ subtitle }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}
defineProps<Props>()
</script>
