<template>
  <button
    class="flex items-center space-x-2 w-full px-4 py-2 text-sm transition-colors"
    :class="itemClasses"
    @click.stop="handleClick"
  >
    <Icon v-if="icon" :name="icon" class="w-4 h-4" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  label: string
  icon?: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  disabled: false
})

const emit = defineEmits<{
  click: []
}>()

const itemClasses = computed(() => {
  const base = 'hover:bg-gray-100 dark:hover:bg-gray-700'
  const disabled = 'opacity-50 cursor-not-allowed'

  if (props.disabled) {
    return `${base} ${disabled}`
  }

  switch (props.variant) {
    case 'danger':
      return `${base} text-red-600 hover:bg-red-50 dark:hover:bg-red-900`
    case 'warning':
      return `${base} text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900`
    case 'success':
      return `${base} text-green-600 hover:bg-green-50 dark:hover:bg-green-900`
    default:
      return `${base} text-gray-700 dark:text-gray-300`
  }
})

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>
