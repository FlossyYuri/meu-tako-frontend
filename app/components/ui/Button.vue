<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :aria-disabled="disabled || loading"
    :aria-busy="loading ? 'true' : 'false'"
    @click="handleClick"
  >
    <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
    <Icon v-else-if="icon" :name="icon" class="w-4 h-4" />
    <span v-if="$slots.default" :class="{ 'ml-2': icon || loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface RouteLocationLike {
  path?: string
  name?: string
  params?: Record<string, string | number>
  query?: Record<string, any>
  hash?: string
}

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  icon?: string
  fullWidth?: boolean
  to?: string | RouteLocationLike
  href?: string
  newTab?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
  newTab: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800'
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  }

  const widthClasses = props.fullWidth ? 'w-full' : ''

  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    widthClasses
  ].join(' ')
})

const handleClick = async (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', event)

  // Navegação interna (rota)
  if (props.to) {
    await navigateTo(props.to as any)
    return
  }

  // Link externo
  if (props.href) {
    if (props.newTab) window.open(props.href, '_blank', 'noopener,noreferrer')
    else window.location.href = props.href
  }
}
</script>
