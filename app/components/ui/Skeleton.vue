<template>
  <div
    :class="containerClasses"
    :style="styleVars"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  circle?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  rounded: 'md',
  circle: false,
  className: ''
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
  return [
    'skeleton',
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