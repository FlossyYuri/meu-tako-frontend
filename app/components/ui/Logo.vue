<template>
  <div class="flex items-center gap-2">
    <img
      :src="logoSrc"
      :alt="alt"
      :class="logoClasses"
      :width="computedSize"
      :height="computedSize"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  variant?: 'default' | 'white' | 'dark'
  showText?: boolean
  text?: string
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  showText: true,
  text: 'Meu Tako',
  alt: 'Meu Tako Logo'
})

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 128
}

const computedSize = computed(() => {
  return typeof props.size === 'number' ? props.size : sizeMap[props.size]
})

const logoSrc = computed(() => {
  return '/icons/512-512-transparent.png'
})

const logoClasses = computed(() => {
  const baseClasses = 'object-contain'
  const variantClasses = {
    default: '',
    white: 'brightness-0 invert',
    dark: 'brightness-0'
  }
  return `${baseClasses} ${variantClasses[props.variant]}`
})

const textClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-xl font-bold'
  }

  const variantClasses = {
    default: 'text-gray-900 dark:text-white',
    white: 'text-white',
    dark: 'text-gray-900'
  }

  const size = typeof props.size === 'number' ? 'md' : props.size
  return `${sizeClasses[size]} ${variantClasses[props.variant]}`
})
</script>
