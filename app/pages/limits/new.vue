<template>
  <div class="max-w-xl mx-auto">
    <div class="mb-6">
      <NuxtLink to="/limits" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para limites
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Novo Limite</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Defina um limite para uma categoria de despesa</p>
      </template>

      <form class="space-y-6" @submit.prevent="onSubmit">
        <div>
          <label class="label">Categoria</label>
          <select v-model="form.expense_category_id" class="input" :class="{ 'border-error-300': errors.expense_category_id }">
            <option value="">Selecione uma categoria</option>
            <option v-for="c in categoriesStore.expenseCategories" :key="c.category_id" :value="c.category_id">{{ c.name }}</option>
          </select>
          <p v-if="errors.expense_category_id" class="text-sm text-error-600 dark:text-error-400 mt-1">{{ errors.expense_category_id }}</p>
        </div>

        <div>
          <Input v-model="form.amount" type="number" label="Valor" :error="errors.amount" required step="0.01" min="0.01" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input v-model="form.start_date" type="date" label="Início" :error="errors.start_date" required />
          <Input v-model="form.end_date" type="date" label="Fim" :error="errors.end_date" required />
        </div>

        <div>
          <Input v-model="form.description" type="text" label="Descrição (opcional)" />
        </div>

        <div class="flex gap-3">
          <Button type="button" variant="outline" @click="navigateTo('/limits')">Cancelar</Button>
          <Button type="submit" variant="primary" :loading="limitsStore.isLoading" :disabled="!isValid">Criar Limite</Button>
        </div>

        <div v-if="limitsStore.error" class="text-center">
          <p class="text-sm text-error-600 dark:text-error-400">{{ limitsStore.error }}</p>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const categoriesStore = useCategoriesStore()
const limitsStore = useLimitsStore()
const { success, error: showError } = useNotifications()

const form = reactive({
  expense_category_id: '',
  amount: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
  description: ''
})

const errors = reactive({
  expense_category_id: '',
  amount: '',
  start_date: '',
  end_date: ''
})

const isValid = computed(() => {
  return form.expense_category_id && form.amount && form.start_date && form.end_date && !errors.expense_category_id && !errors.amount && !errors.start_date && !errors.end_date
})

const validate = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true
  if (!form.expense_category_id) { errors.expense_category_id = 'Categoria é obrigatória'; ok = false }
  const val = parseFloat(form.amount)
  if (!form.amount || isNaN(val) || val <= 0) { errors.amount = 'Valor deve ser maior que zero'; ok = false }
  if (!form.start_date) { errors.start_date = 'Data inicial é obrigatória'; ok = false }
  if (!form.end_date) { errors.end_date = 'Data final é obrigatória'; ok = false }
  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
    errors.end_date = 'Data final não pode ser anterior à inicial'; ok = false
  }
  return ok
}

const onSubmit = async () => {
  if (!validate()) return
  try {
    await limitsStore.createLimit({
      expense_category_id: form.expense_category_id,
      amount: parseFloat(form.amount),
      start_date: form.start_date,
      end_date: form.end_date,
      description: form.description || undefined
    })
    success('Limite criado')
    await navigateTo('/limits')
  } catch (err: any) {
    showError('Erro ao criar limite', err?.message)
  }
}

onMounted(async () => {
  try {
    await categoriesStore.fetchExpenseCategories()
  } catch {}
})

watch(() => form.expense_category_id, () => { if (errors.expense_category_id) errors.expense_category_id = '' })
watch(() => form.amount, () => { if (errors.amount) errors.amount = '' })
watch(() => form.start_date, () => { if (errors.start_date) errors.start_date = '' })
watch(() => form.end_date, () => { if (errors.end_date) errors.end_date = '' })
</script>