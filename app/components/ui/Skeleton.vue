<template>
  <div :class="containerClasses" :style="styleVars" aria-hidden="true" />
</template>

<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  circle?: boolean
  className?: string
  lines?: number
  variant?: 'default' | 'card' | 'text' | 'avatar'
}

const props = withDefaults(defineProps<Props>(), {
  rounded: 'md',
  circle: false,
  className: '',
  lines: 1,
  variant: 'default'
})

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
} as const

const containerClasses = computed(() => {
  const baseClasses = 'skeleton animate-pulse bg-gray-200 dark:bg-gray-700'

  if (props.variant === 'card') {
    return [
      baseClasses,
      'p-4 border border-gray-200 dark:border-gray-600',
      props.className
    ].join(' ')
  }

  if (props.variant === 'avatar') {
    return [
      baseClasses,
      'rounded-full',
      props.className
    ].join(' ')
  }

  return [
    baseClasses,
    props.circle ? 'rounded-full' : roundedMap[props.rounded],
    props.className
  ].join(' ')
})

const styleVars = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  if (!props.height) style.height = '1rem'
  return style
})
</script>
