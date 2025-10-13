<template>
  <aside class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
    <nav class="space-y-1">
      <NuxtLink
        v-for="item in items"
        :key="item.name"
        :to="item.href"
        class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
        :class="isActive(item.href)
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'"
      >
        <Icon :name="item.icon" class="w-4 h-4" />
        <span>{{ item.name }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
interface NavItem {
  name: string
  href: string
  icon: string
}

defineProps<{
  items: NavItem[]
}>()

const route = useRoute()
const isActive = (href: string) => route.path === href
</script>