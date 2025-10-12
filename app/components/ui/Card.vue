<template>
  <div :class="cardClasses">
    <div
      v-if="$slots.header"
      :class="['border-b border-gray-200 dark:border-gray-700', headerPaddingClass]"
    >
      <slot name="header" />
    </div>

    <div :class="contentPaddingClass">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      :class="['border-t border-gray-200 dark:border-gray-700', footerPaddingClass]"
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

// Padding responsivo por tamanho
const paddingMap = {
  none: { content: 'p-0', header: 'px-0 py-0', footer: 'px-0 py-0' },
  sm:   { content: 'p-3 sm:p-4', header: 'px-3 sm:px-4 py-2 sm:py-3', footer: 'px-3 sm:px-4 py-2 sm:py-3' },
  md:   { content: 'p-4 sm:p-6', header: 'px-4 sm:px-6 py-3 sm:py-4', footer: 'px-4 sm:px-6 py-3 sm:py-4' },
  lg:   { content: 'p-6 sm:p-8', header: 'px-6 sm:px-8 py-4 sm:py-5', footer: 'px-6 sm:px-8 py-4 sm:py-5' }
} as const

const contentPaddingClass = computed(() => paddingMap[props.padding].content)
const headerPaddingClass = computed(() => paddingMap[props.padding].header)
const footerPaddingClass = computed(() => paddingMap[props.padding].footer)
</script>