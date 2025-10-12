<template>
  <div :class="cardClasses">
    <div
      v-if="$slots.header"
      class="px-6 py-4 border-b border-gray-200 dark:border-gray-700"
    >
      <slot name="header" />
    </div>

    <div class="p-6">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hover: false
})

const cardClasses = computed(() => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg'

  const variantClasses = {
    default: 'border border-gray-200 dark:border-gray-700',
    outlined: 'border-2 border-gray-200 dark:border-gray-700',
    elevated: 'shadow-lg border border-gray-100 dark:border-gray-800'
  }

  const hoverClasses = props.hover
    ? 'transition-shadow duration-200 hover:shadow-md'
    : ''

  return [baseClasses, variantClasses[props.variant], hoverClasses].join(' ')
})
</script>
