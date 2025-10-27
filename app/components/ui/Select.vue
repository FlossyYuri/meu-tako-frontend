<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1">*</span>
    </label>

    <div class="relative">
      <Icon
        v-if="icon"
        :name="icon"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
      />

      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="selectClasses"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <Icon
        name="lucide:chevron-down"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
      />
    </div>

    <p v-if="error" class="text-sm text-error-600 dark:text-error-400">
      {{ error }}
    </p>

    <p v-else-if="hint" class="text-sm text-gray-500 dark:text-gray-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: Option[]
  label?: string
  hint?: string
  error?: string
  icon?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const selectId = `select-${Math.random().toString(36).substr(2, 9)}`

const selectClasses = computed(() => {
  const baseClasses = 'block w-full rounded-md border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none'

  const stateClasses = props.error
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:focus:border-primary-400'

  const paddingClasses = props.icon
    ? 'pl-9 pr-10 py-1.5'
    : 'px-3 py-1.5'

  const disabledClasses = props.disabled
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
    : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white'

  return [
    baseClasses,
    stateClasses,
    paddingClasses,
    disabledClasses
  ].join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  // Convert empty string to undefined for better handling
  emit('update:modelValue', value === '' ? undefined : value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>
