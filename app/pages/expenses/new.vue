<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/expenses"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para despesas
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Nova Despesa
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Registre uma nova despesa
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
            placeholder="Ex: Supermercado"
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
          <WalletSelector v-model="form.wallet_id" :error="errors.wallet_id" />
        </div>

        <div>
          <label class="label">Categoria</label>
          <div class="flex gap-2">
            <select
              v-model="form.expense_category_id"
              class="input"
              :class="{ 'border-error-300': errors.expense_category_id }"
            >
              <option value="">Selecione uma categoria</option>
              <option
                v-for="c in categoriesStore.expenseCategories"
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
            v-if="errors.expense_category_id"
            class="text-sm text-error-600 dark:text-error-400 mt-1"
          >
            {{ errors.expense_category_id }}
          </p>
        </div>

        <!-- Status de pagamento -->
        <div class="p-4 rounded-lg border-2 transition-colors duration-200"
          :class="form.paid 
            ? 'border-success-300 bg-success-50 dark:bg-success-900/20 dark:border-success-700' 
            : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'"
        >
          <button
            type="button"
            @click="form.paid = !form.paid"
            class="flex items-center justify-between w-full"
          >
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors duration-200"
                :class="form.paid 
                  ? 'bg-success-600 border-success-600' 
                  : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-500'"
              >
                <Icon 
                  v-if="form.paid"
                  name="lucide:check" 
                  class="w-4 h-4 text-white" 
                />
              </div>
              <div class="text-left">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  Já pago
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Marque se esta despesa já foi paga
                </p>
              </div>
            </div>
            <Icon 
              :name="form.paid ? 'lucide:check-circle' : 'lucide:circle'" 
              class="w-5 h-5 transition-colors duration-200"
              :class="form.paid 
                ? 'text-success-600 dark:text-success-400' 
                : 'text-gray-400 dark:text-gray-500'"
            />
          </button>
        </div>

        <div class="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            full-width
            @click="navigateTo('/expenses')"
            >Cancelar</Button
          >
          <Button
            type="submit"
            variant="error"
            :loading="transactionsStore.isLoading"
            :disabled="!isFormValid"
            full-width
          >
            Adicionar Despesa
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
      type="expense"
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
  expense_category_id: '',
  paid: true,
  wallet_id: ''
})

const errors = reactive({
  amount: '',
  description: '',
  date: '',
  expense_category_id: '',
  wallet_id: ''
})

const showCategoryModal = ref(false)

const isFormValid = computed(() => {
  return form.amount && form.date && form.expense_category_id && form.wallet_id && !errors.amount && !errors.date && !errors.expense_category_id && !errors.wallet_id
})

const validateForm = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true
  if (!form.amount || parseFloat(form.amount) <= 0) { errors.amount = 'Valor deve ser maior que zero'; ok = false }
  if (!form.date) { errors.date = 'Data é obrigatória'; ok = false }
  if (!form.expense_category_id) { errors.expense_category_id = 'Categoria é obrigatória'; ok = false }
  if (!form.wallet_id) { errors.wallet_id = 'Carteira é obrigatória'; ok = false }
  return ok
}

const handleSubmit = async () => {
  if (!validateForm()) return
  try {
    transactionsStore.clearError()
    await transactionsStore.createExpense({
      expense_category_id: form.expense_category_id,
      amount: parseFloat(form.amount),
      description: form.description?.trim() || undefined,
      date: form.date,
      paid: form.paid,
      wallet_id: form.wallet_id
    })
    success('Despesa adicionada com sucesso!')
    await navigateTo('/expenses')
  } catch (err: any) {
    showError('Erro ao adicionar despesa', err?.message || 'Tente novamente')
  }
}

onMounted(async () => {
  try {
    await categoriesStore.fetchExpenseCategories()
  } catch {}
})

const onCategoryCreated = async (created: import('~/types').Category) => {
  await categoriesStore.fetchExpenseCategories(true)
  form.expense_category_id = created.category_id
}

watch(() => form.amount, () => { if (errors.amount) errors.amount = '' })
watch(() => form.date, () => { if (errors.date) errors.date = '' })
watch(() => form.expense_category_id, () => { if (errors.expense_category_id) errors.expense_category_id = '' })
watch(() => form.wallet_id, () => { if (errors.wallet_id) errors.wallet_id = '' })
</script>
