<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div>
      <label class="label">Categoria</label>
      <select
        v-model="form.expense_category_id"
        class="input"
        :class="{ 'border-error-300': errors.expense_category_id }"
        :disabled="isLoading"
      >
        <option value="">Selecione uma categoria</option>
        <option
          v-for="category in categories"
          :key="category.category_id"
          :value="category.category_id"
        >
          {{ category.name }}
        </option>
      </select>
      <p
        v-if="errors.expense_category_id"
        class="text-sm text-error-600 dark:text-error-400 mt-1"
      >
        {{ errors.expense_category_id }}
      </p>
    </div>

    <div>
      <label class="label">Valor do limite</label>
      <input
        v-model="form.limit_amount"
        type="number"
        class="input"
        :class="{ 'border-error-300': errors.limit_amount }"
        :disabled="isLoading"
        required
        :step="0.01"
        :min="0.01"
      />
      <p
        v-if="errors.limit_amount"
        class="text-sm text-error-600 dark:text-error-400 mt-1"
      >
        {{ errors.limit_amount }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="label">Data de início</label>
        <input
          v-model="form.start_date"
          type="date"
          class="input"
          :class="{ 'border-error-300': errors.start_date }"
          :disabled="isLoading"
          required
        />
        <p
          v-if="errors.start_date"
          class="text-sm text-error-600 dark:text-error-400 mt-1"
        >
          {{ errors.start_date }}
        </p>
      </div>
      <div>
        <label class="label">Data de fim</label>
        <input
          v-model="form.end_date"
          type="date"
          class="input"
          :class="{ 'border-error-300': errors.end_date }"
          :disabled="isLoading"
          required
        />
        <p
          v-if="errors.end_date"
          class="text-sm text-error-600 dark:text-error-400 mt-1"
        >
          {{ errors.end_date }}
        </p>
      </div>
    </div>

    <div>
      <label class="label">Descrição (opcional)</label>
      <input
        v-model="form.description"
        type="text"
        class="input"
        :disabled="isLoading"
      />
    </div>

    <div class="flex gap-3">
      <Button
        type="button"
        variant="outline"
        @click="$emit('cancel')"
        :disabled="isLoading"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="primary"
        :loading="isLoading"
        :disabled="!isValid"
      >
        {{ isEditing ? 'Atualizar' : 'Criar' }} Limite
      </Button>
    </div>

    <div v-if="error" class="text-center">
      <p class="text-sm text-error-600 dark:text-error-400">{{ error }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, watch, withDefaults, defineProps, defineEmits } from 'vue'
import type { Category, CreateLimitRequest, UpdateLimitRequest } from '../../types'

interface Props {
  initialData?: Partial<CreateLimitRequest & { limit_id?: string }>
  categories: Category[]
  isLoading?: boolean
  error?: string | null
}

interface Emits {
  submit: [data: CreateLimitRequest | UpdateLimitRequest]
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null
})

const emit = defineEmits<Emits>()

const isEditing = computed(() => !!props.initialData?.limit_id)

const form = reactive({
  expense_category_id: props.initialData?.expense_category_id || '',
  limit_amount: props.initialData?.limit_amount?.toString() || '',
  start_date: props.initialData?.start_date || new Date().toISOString().split('T')[0],
  end_date: props.initialData?.end_date || new Date().toISOString().split('T')[0],
  description: props.initialData?.description || ''
})

const errors = reactive({
  expense_category_id: '',
  limit_amount: '',
  start_date: '',
  end_date: ''
})

const isValid = computed(() => {
  return form.expense_category_id &&
         form.limit_amount &&
         form.start_date &&
         form.end_date &&
         !errors.expense_category_id &&
         !errors.limit_amount &&
         !errors.start_date &&
         !errors.end_date
})

const validate = () => {
  Object.keys(errors).forEach(key => (errors[key as keyof typeof errors] = ''))
  let isValid = true

  if (!form.expense_category_id) {
    errors.expense_category_id = 'Categoria é obrigatória'
    isValid = false
  }

  const amount = parseFloat(form.limit_amount)
  if (!form.limit_amount || isNaN(amount) || amount <= 0) {
    errors.limit_amount = 'Valor deve ser maior que zero'
    isValid = false
  }

  if (!form.start_date) {
    errors.start_date = 'Data inicial é obrigatória'
    isValid = false
  }

  if (!form.end_date) {
    errors.end_date = 'Data final é obrigatória'
    isValid = false
  }

  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
    errors.end_date = 'Data final não pode ser anterior à inicial'
    isValid = false
  }

  return isValid
}

const onSubmit = () => {
  if (!validate()) return

  const data = {
    expense_category_id: form.expense_category_id,
    limit_amount: parseFloat(form.limit_amount),
    start_date: form.start_date,
    end_date: form.end_date,
    description: form.description || undefined
  }

  emit('submit', data)
}

// Watch for changes to clear errors
watch(() => form.expense_category_id, () => {
  if (errors.expense_category_id) errors.expense_category_id = ''
})

watch(() => form.limit_amount, () => {
  if (errors.limit_amount) errors.limit_amount = ''
})

watch(() => form.start_date, () => {
  if (errors.start_date) errors.start_date = ''
})

watch(() => form.end_date, () => {
  if (errors.end_date) errors.end_date = ''
})

// Update form when initialData changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.expense_category_id = newData.expense_category_id || ''
    form.limit_amount = newData.limit_amount?.toString() || ''
    form.start_date = newData.start_date || new Date().toISOString().split('T')[0]
    form.end_date = newData.end_date || new Date().toISOString().split('T')[0]
    form.description = newData.description || ''
  }
}, { deep: true })
</script>
