<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink to="/incomes" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Voltar para receitas
      </NuxtLink>
    </div>

    <Card v-if="income">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Receita</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ income.description || 'Sem descrição' }}</p>
          </div>
          <Badge :variant="income.received ? 'success' : 'warning'">{{ income.received ? 'Recebido' : 'Pendente' }}</Badge>
        </div>
      </template>

      <form class="space-y-6" @submit.prevent="onSave">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input v-model="form.amount" type="number" label="Valor" :error="errors.amount" required step="0.01" min="0.01" />
          </div>
          <div>
            <Input v-model="form.date" type="date" label="Data" :error="errors.date" required />
          </div>
        </div>

        <div>
          <Input v-model="form.description" type="text" label="Descrição" :error="errors.description" />
        </div>

        <div>
          <label class="label">Categoria</label>
          <select v-model="form.income_category_id" class="input" :class="{ 'border-error-300': errors.income_category_id }">
            <option v-for="c in categoriesStore.incomeCategories" :key="c.category_id" :value="c.category_id">
              {{ c.name }}
            </option>
          </select>
          <p v-if="errors.income_category_id" class="text-sm text-error-600 dark:text-error-400 mt-1">{{ errors.income_category_id }}</p>
        </div>

        <div class="flex items-center">
          <input id="received" v-model="form.received" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
          <label for="received" class="ml-2 text-sm text-gray-900 dark:text-gray-300">Recebido</label>
        </div>

        <div class="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" :loading="transactionsStore.isLoading" :disabled="!isFormValid" icon="lucide:save">
            Salvar alterações
          </Button>
          <Button v-if="!income.received" variant="success" @click="onMarkReceived" icon="lucide:check">
            Marcar como recebido
          </Button>
          <Button variant="error" @click="onDelete" icon="lucide:trash-2">
            Excluir
          </Button>
        </div>

        <div v-if="transactionsStore.error" class="text-center">
          <p class="text-sm text-error-600 dark:text-error-400">{{ transactionsStore.error }}</p>
        </div>
      </form>

      <template #footer>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Carteira: <span class="font-medium text-gray-700 dark:text-gray-200">{{ walletName }}</span>
        </div>
      </template>
    </Card>

    <div v-else class="py-12">
      <LoadingSpinner center text="Carregando receita..." />
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

const income = ref<import('~/types').Income | null>(null)

const form = reactive({
  amount: '',
  date: '',
  description: '',
  income_category_id: '',
  received: false
})

const errors = reactive({
  amount: '',
  date: '',
  description: '',
  income_category_id: ''
})

const isFormValid = computed(() => form.amount && form.date && form.income_category_id && !errors.amount && !errors.date && !errors.income_category_id)
const walletName = computed(() => income.value ? (walletsStore.wallets.find(w => w.wallet_id === income.value!.wallet_id)?.wallet_name || 'Carteira') : '')

const loadIncome = async () => {
  const data = await transactionsStore.fetchIncomeById(id)
  income.value = data
  form.amount = String(data.amount)
  form.date = data.date
  form.description = data.description || ''
  form.income_category_id = data.income_category_id
  form.received = data.received
}

const onSave = async () => {
  if (!isFormValid.value) return
  try {
    await transactionsStore.updateIncome(id, {
      income_category_id: form.income_category_id || undefined,
      amount: parseFloat(form.amount),
      date: form.date,
      description: form.description?.trim() || undefined,
      received: form.received
    })
    success('Receita atualizada com sucesso')
    await loadIncome()
  } catch (err: any) {
    showError('Erro ao salvar', err?.message)
  }
}

const onMarkReceived = async () => {
  try {
    await transactionsStore.markIncomeAsReceived(id)
    success('Receita marcada como recebida')
    await loadIncome()
  } catch (err: any) {
    showError('Erro ao marcar como recebida', err?.message)
  }
}

const onDelete = async () => {
  if (!confirm('Tem certeza que deseja excluir esta receita?')) return
  try {
    await transactionsStore.deleteIncome(id)
    success('Receita excluída com sucesso')
    await navigateTo('/incomes')
  } catch (err: any) {
    showError('Erro ao excluir', err?.message)
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      walletsStore.fetchWallets(),
      categoriesStore.fetchIncomeCategories(),
    ])
    await loadIncome()
  } catch (err: any) {
    showError('Erro ao carregar receita', err?.message)
  }
})
</script>