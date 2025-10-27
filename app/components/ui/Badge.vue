<template>
  <span :class="badgeClasses">
    <Icon
      v-if="icon"
      :name="icon"
      class="w-3 h-3"
      :class="{ 'mr-1': $slots.default }"
    />
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  dot: false
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
    error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }

  const sizeClasses = {
    sm: props.dot ? 'w-2 h-2' : 'px-2 py-0.5 text-xs',
    md: props.dot ? 'w-2.5 h-2.5' : 'px-2.5 py-0.5 text-sm',
    lg: props.dot ? 'w-3 h-3' : 'px-3 py-1 text-base'
  }

  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size]
  ].join(' ')
})
</script>
