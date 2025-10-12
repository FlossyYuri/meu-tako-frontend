<template>
  <div :class="containerClasses">
    <Icon name="lucide:loader-2" :class="spinnerClasses" />
    <span v-if="text" :class="textClasses">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  center?: boolean
  fullScreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  center: false,
  fullScreen: false
})

const containerClasses = computed(() => {
  const baseClasses = 'flex items-center justify-center'

  if (props.fullScreen) {
    return `${baseClasses} fixed inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50`
  }

  if (props.center) {
    return `${baseClasses} min-h-[200px]`
  }

  return baseClasses
})

const spinnerClasses = computed(() => {
  const baseClasses = 'animate-spin text-primary-600'

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return [baseClasses, sizeClasses[props.size]].join(' ')
})

const textClasses = computed(() => {
  const baseClasses = 'ml-2 text-gray-600 dark:text-gray-400'

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return [baseClasses, sizeClasses[props.size]].join(' ')
})
</script>
