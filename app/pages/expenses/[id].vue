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

    <Card v-if="expense">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              Despesa
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ expense.description || 'Sem descrição' }}
            </p>
          </div>
          <Badge
            :variant="expense.paid ? 'success' : 'warning'"
            >{{ expense.paid ? 'Pago' : 'Pendente' }}</Badge
          >
        </div>
      </template>

      <form class="space-y-6" @submit.prevent="onSave">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              v-model="form.amount"
              type="number"
              label="Valor"
              :error="errors.amount"
              required
              :step="0.01"
              :min="0.01"
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
        </div>

        <div>
          <Input
            v-model="form.description"
            type="text"
            label="Descrição"
            :error="errors.description"
          />
        </div>

        <div>
          <label class="label">Categoria</label>
          <select
            v-model="form.expense_category_id"
            class="input"
            :class="{ 'border-error-300': errors.expense_category_id }"
          >
            <option
              v-for="c in categoriesStore.expenseCategories"
              :key="c.category_id"
              :value="c.category_id"
            >
              {{ c.name }}
            </option>
          </select>
          <p
            v-if="errors.expense_category_id"
            class="text-sm text-error-600 dark:text-error-400 mt-1"
          >
            {{ errors.expense_category_id }}
          </p>
        </div>

        <div class="flex items-center">
          <input
            id="paid"
            v-model="form.paid"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label
            for="paid"
            class="ml-2 text-sm text-gray-900 dark:text-gray-300"
            >Pago</label
          >
        </div>

        <div class="flex flex-wrap gap-3">
          <Button
            type="submit"
            variant="primary"
            :loading="transactionsStore.isLoading"
            :disabled="!isFormValid"
            icon="lucide:save"
          >
            Salvar alterações
          </Button>
          <Button
            v-if="!expense.paid"
            variant="success"
            @click="onMarkPaid"
            icon="lucide:check"
          >
            Marcar como pago
          </Button>
          <Button variant="error" @click="onDelete" icon="lucide:trash-2">
            Excluir
          </Button>
        </div>

        <div v-if="transactionsStore.error" class="text-center">
          <p class="text-sm text-error-600 dark:text-error-400">
            {{ transactionsStore.error }}
          </p>
        </div>
      </form>

      <template #footer>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Carteira:
          <span
            class="font-medium text-gray-700 dark:text-gray-200"
            >{{ walletName }}</span
          >
        </div>
      </template>
    </Card>

    <div v-else class="py-12">
      <LoadingSpinner center text="Carregando despesa..." />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const { success, error: showError } = useNotifications()

const expense = ref<import('~/types').Expense | null>(null)

const form = reactive({
  amount: '',
  date: '',
  description: '',
  expense_category_id: '',
  paid: false
})

const errors = reactive({
  amount: '',
  date: '',
  description: '',
  expense_category_id: ''
})

const isFormValid = computed(() => form.amount && form.date && form.expense_category_id && !errors.amount && !errors.date && !errors.expense_category_id)
const walletName = computed(() => expense.value ? (walletsStore.wallets.find(w => w.wallet_id === expense.value!.wallet_id)?.wallet_name || 'Carteira') : '')

const loadExpense = async () => {
  const data = await transactionsStore.fetchExpenseById(id)
  expense.value = data
  form.amount = String(data.amount)
  form.date = data.date
  form.description = data.description || ''
  form.expense_category_id = data.expense_category_id
  form.paid = data.paid
}

const onSave = async () => {
  if (!isFormValid.value) return
  try {
    await transactionsStore.updateExpense(id, {
      expense_category_id: form.expense_category_id,
      amount: parseFloat(form.amount),
      date: form.date,
      description: form.description?.trim() || undefined,
      paid: form.paid
    })
    success('Despesa atualizada com sucesso')
    await loadExpense()
  } catch (err: any) {
    showError('Erro ao salvar', err?.message)
  }
}

const onMarkPaid = async () => {
  try {
    await transactionsStore.markExpenseAsPaid(id)
    success('Despesa marcada como paga')
    await loadExpense()
  } catch (err: any) {
    showError('Erro ao marcar como paga', err?.message)
  }
}

const onDelete = async () => {
  if (!confirm('Tem certeza que deseja excluir esta despesa?')) return
  try {
    await transactionsStore.deleteExpense(id)
    success('Despesa excluída com sucesso')
    await navigateTo('/expenses')
  } catch (err: any) {
    showError('Erro ao excluir', err?.message)
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      walletsStore.fetchWallets(),
      categoriesStore.fetchExpenseCategories(false),
    ])
    await loadExpense()
  } catch (err: any) {
    showError('Erro ao carregar despesa', err?.message)
  }
})
</script>
