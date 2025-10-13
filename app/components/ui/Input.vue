<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="inputId"
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

      <input
        :id="inputId"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <button
        v-if="type === 'password'"
        type="button"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        @click="togglePasswordVisibility"
      >
        <Icon
          :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
          class="w-4 h-4"
        />
      </button>
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
interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  icon?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  min?: number
  max?: number
  step?: number
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = `input-${Math.random().toString(36).substr(2, 9)}`
const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const inputClasses = computed(() => {
  const baseClasses = 'block w-full rounded-md border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'

  const stateClasses = props.error
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:focus:border-primary-400'

  const paddingClasses = props.icon
    ? 'pl-9 pr-2.5 py-1.5'
    : 'px-2.5 py-1.5'

  const passwordPaddingClasses = props.type === 'password' ? 'pr-10' : ''

  const disabledClasses = props.disabled
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
    : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white'

  return [
    baseClasses,
    stateClasses,
    paddingClasses,
    passwordPaddingClasses,
    disabledClasses
  ].join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>
