<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/incomes"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para receitas
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Nova Receita
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Registre uma nova receita
        </p>
      </template>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div>
          <Input
            v-model="form.amount"
            type="number"
            label="Valor"
            placeholder="0,00"
            :error="errors.amount"
            required
            :step="0.01"
            :min="0.01"
          />
        </div>

        <div>
          <Input
            v-model="form.description"
            type="text"
            label="Descrição"
            placeholder="Ex: Salário mensal"
            :error="errors.description"
          />
        </div>

        <div>
          <Input
            v-model="form.date"
            type="date"
            label="Data"
            :error="errors.date"
            required
          />
        </div>

        <div>
          <label class="label">Categoria</label>
          <div class="flex gap-2">
            <select
              v-model="form.income_category_id"
              class="input"
              :class="{ 'border-error-300': errors.income_category_id }"
            >
              <option value="">Selecione uma categoria</option>
              <option
                v-for="c in categoriesStore.incomeCategories"
                :key="c.category_id"
                :value="c.category_id"
              >
                {{ c.name }}
              </option>
            </select>
            <Button
              type="button"
              variant="outline"
              icon="lucide:plus"
              @click="showCategoryModal = true"
            >
              Nova
            </Button>
          </div>
          <p
            v-if="errors.income_category_id"
            class="text-sm text-error-600 dark:text-error-400 mt-1"
          >
            {{ errors.income_category_id }}
          </p>
        </div>

        <div class="flex items-center">
          <input
            id="received"
            v-model="form.received"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label
            for="received"
            class="ml-2 text-sm text-gray-900 dark:text-gray-300"
            >Já recebido</label
          >
        </div>

        <div class="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            full-width
            @click="navigateTo('/incomes')"
            >Cancelar</Button
          >
          <Button
            type="submit"
            variant="success"
            :loading="transactionsStore.isLoading"
            :disabled="!isFormValid"
            full-width
          >
            Adicionar Receita
          </Button>
        </div>

        <div v-if="transactionsStore.error" class="text-center">
          <p class="text-sm text-error-600 dark:text-error-400">
            {{ transactionsStore.error }}
          </p>
        </div>
      </form>
    </Card>

    <CategoryModal
      :isOpen="showCategoryModal"
      type="income"
      @update:isOpen="showCategoryModal = $event"
      @saved="onCategoryCreated"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const { success, error: showError } = useNotifications()

const form = reactive({
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  income_category_id: '',
  received: false
})

const errors = reactive({
  amount: '',
  description: '',
  date: '',
  income_category_id: ''
})

const showCategoryModal = ref(false)

const isFormValid = computed(() => {
  return form.amount && form.date && form.income_category_id &&
    !errors.amount && !errors.date && !errors.income_category_id
})

const validateForm = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true
  if (!form.amount || parseFloat(form.amount) <= 0) { errors.amount = 'Valor deve ser maior que zero'; ok = false }
  if (!form.date) { errors.date = 'Data é obrigatória'; ok = false }
  if (!form.income_category_id) { errors.income_category_id = 'Categoria é obrigatória'; ok = false }
  return ok
}

const handleSubmit = async () => {
  if (!validateForm()) return
  try {
    transactionsStore.clearError()
    await transactionsStore.createIncome({
      income_category_id: form.income_category_id,
      amount: parseFloat(form.amount),
      description: form.description?.trim() || undefined,
      date: form.date,
      received: form.received
    })
    success('Receita adicionada com sucesso!')
    await navigateTo('/incomes')
  } catch (err: any) {
    showError('Erro ao adicionar receita', err?.message || 'Tente novamente')
  }
}

onMounted(async () => {
  try {
    await categoriesStore.fetchIncomeCategories()
  } catch {}
})

const onCategoryCreated = async (created: import('~/types').Category) => {
  await categoriesStore.fetchIncomeCategories()
  form.income_category_id = created.category_id
}

watch(() => form.amount, () => { if (errors.amount) errors.amount = '' })
watch(() => form.date, () => { if (errors.date) errors.date = '' })
watch(() => form.income_category_id, () => { if (errors.income_category_id) errors.income_category_id = '' })
</script>
