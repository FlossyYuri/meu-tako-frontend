<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/transactions"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para transações
      </NuxtLink>
    </div>

    <Card>
      <template #header>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ isIncome ? 'Nova Receita' : 'Nova Despesa' }}
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ isIncome ? 'Registre uma nova receita' : 'Registre uma nova despesa' }}
        </p>
      </template>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Type Toggle -->
        <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200',
              isIncome
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            ]"
            @click="transactionType = 'income'"
          >
            <Icon name="lucide:arrow-up" class="w-4 h-4 inline mr-2" />
            Receita
          </button>
          <button
            type="button"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200',
              !isIncome
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            ]"
            @click="transactionType = 'expense'"
          >
            <Icon name="lucide:arrow-down" class="w-4 h-4 inline mr-2" />
            Despesa
          </button>
        </div>

        <!-- Amount -->
        <div>
          <Input
            v-model="form.amount"
            type="number"
            :label="isIncome ? 'Valor da receita' : 'Valor da despesa'"
            placeholder="0,00"
            :error="errors.amount"
            required
            step="0.01"
            min="0.01"
          />
        </div>

        <!-- Description -->
        <div>
          <Input
            v-model="form.description"
            type="text"
            label="Descrição"
            :placeholder="isIncome ? 'Ex: Salário mensal' : 'Ex: Supermercado'"
            :error="errors.description"
            required
          />
        </div>

        <!-- Date -->
        <div>
          <Input
            v-model="form.date"
            type="date"
            label="Data"
            :error="errors.date"
            required
          />
        </div>

        <!-- Wallet -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Carteira
          </label>
          <select
            v-model="form.wallet_id"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            :class="{ 'border-error-300': errors.wallet_id }"
          >
            <option value="">Selecione uma carteira</option>
            <option
              v-for="wallet in walletsStore.wallets"
              :key="wallet.wallet_id"
              :value="wallet.wallet_id"
            >
              {{ wallet.wallet_name }} ({{ formatCurrency(wallet.balance) }})
            </option>
          </select>
          <p
            v-if="errors.wallet_id"
            class="text-sm text-error-600 dark:text-error-400 mt-1"
          >
            {{ errors.wallet_id }}
          </p>
        </div>

        <!-- Category -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Categoria
          </label>
          <select
            v-model="form.category_id"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            :class="{ 'border-error-300': errors.category_id }"
          >
            <option value="">Selecione uma categoria</option>
            <option
              v-for="category in availableCategories"
              :key="category.category_id"
              :value="category.category_id"
            >
              {{ category.name }}
            </option>
          </select>
          <p
            v-if="errors.category_id"
            class="text-sm text-error-600 dark:text-error-400 mt-1"
          >
            {{ errors.category_id }}
          </p>

          <div v-if="categoriesStore.isLoading" class="mt-2">
            <LoadingSpinner size="sm" text="Carregando categorias..." />
          </div>
        </div>

        <!-- Status -->
        <div class="flex items-center">
          <input
            :id="isIncome ? 'received' : 'paid'"
            v-model="form.status"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label
            :for="isIncome ? 'received' : 'paid'"
            class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            {{ isIncome ? 'Já recebido' : 'Já pago' }}
          </label>
        </div>

        <!-- Submit Buttons -->
        <div class="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            full-width
            @click="navigateTo('/transactions')"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            :loading="transactionsStore.isLoading"
            :disabled="!isFormValid"
            full-width
          >
            {{ isIncome ? 'Adicionar Receita' : 'Adicionar Despesa' }}
          </Button>
        </div>

        <!-- Error Message -->
        <div v-if="transactionsStore.error" class="text-center">
          <p class="text-sm text-error-600 dark:text-error-400">
            {{ transactionsStore.error }}
          </p>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const { formatCurrency } = useApi()
const { success, error: showError } = useNotifications()

// State
const transactionType = ref<'income' | 'expense'>('expense')
const form = reactive({
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  wallet_id: '',
  category_id: '',
  status: false
})

const errors = reactive({
  amount: '',
  description: '',
  date: '',
  wallet_id: '',
  category_id: ''
})

// Computed
const isIncome = computed(() => transactionType.value === 'income')

const availableCategories = computed(() => {
  return isIncome.value
    ? categoriesStore.incomeCategories
    : categoriesStore.expenseCategories
})

const isFormValid = computed(() => {
  return (
    form.amount &&
    form.description &&
    form.date &&
    form.wallet_id &&
    form.category_id &&
    !errors.amount &&
    !errors.description &&
    !errors.date &&
    !errors.wallet_id &&
    !errors.category_id
  )
})

// Methods
const validateForm = () => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  if (!form.amount) {
    errors.amount = 'Valor é obrigatório'
    isValid = false
  } else if (parseFloat(form.amount) <= 0) {
    errors.amount = 'Valor deve ser maior que zero'
    isValid = false
  }

  if (!form.description.trim()) {
    errors.description = 'Descrição é obrigatória'
    isValid = false
  }

  if (!form.date) {
    errors.date = 'Data é obrigatória'
    isValid = false
  }

  if (!form.wallet_id) {
    errors.wallet_id = 'Carteira é obrigatória'
    isValid = false
  }

  if (!form.category_id) {
    errors.category_id = 'Categoria é obrigatória'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    transactionsStore.clearError()

    if (isIncome.value) {
      await transactionsStore.createIncome({
        wallet_id: form.wallet_id,
        income_category_id: form.category_id,
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        date: form.date,
        received: form.status
      })
      success('Receita adicionada com sucesso!')
    } else {
      await transactionsStore.createExpense({
        wallet_id: form.wallet_id,
        expense_category_id: form.category_id,
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        date: form.date,
        paid: form.status
      })
      success('Despesa adicionada com sucesso!')
    }

    await navigateTo('/transactions')
  } catch (err: any) {
    showError('Erro ao adicionar transação', err.message || 'Tente novamente mais tarde')
  }
}

// Initialize
onMounted(async () => {
  // Set transaction type from query
  if (route.query.type === 'income') {
    transactionType.value = 'income'
  }

  try {
    await Promise.all([
      walletsStore.fetchWallets(),
      categoriesStore.fetchIncomeCategories(),
      categoriesStore.fetchExpenseCategories()
    ])

    // Set default wallet if available
    if (walletsStore.wallets.length > 0 && !form.wallet_id) {
      const defaultWallet = walletsStore.defaultWallet
      if (defaultWallet) {
        form.wallet_id = defaultWallet.wallet_id
      }
    }
  } catch (error) {
    showError('Erro ao carregar dados iniciais')
  }
})

// Clear errors when typing
watch(() => form.amount, () => { if (errors.amount) errors.amount = '' })
watch(() => form.description, () => { if (errors.description) errors.description = '' })
watch(() => form.date, () => { if (errors.date) errors.date = '' })
watch(() => form.wallet_id, () => { if (errors.wallet_id) errors.wallet_id = '' })
watch(() => form.category_id, () => { if (errors.category_id) errors.category_id = '' })
</script>