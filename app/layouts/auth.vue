<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo -->
      <div class="flex justify-center">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div
            class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center"
          >
            <Icon name="lucide:wallet" class="w-7 h-7 text-white" />
          </div>
          <span class="text-2xl font-bold text-gray-900 dark:text-white">
            Meu Tako
          </span>
        </NuxtLink>
      </div>

      <!-- Page Title -->
      <h2
        class="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </h2>

      <!-- Page Subtitle -->
      <p
        v-if="subtitle"
        class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
      >
        {{ subtitle }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

const props = defineProps<Props>()
</script>
