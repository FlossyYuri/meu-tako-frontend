<template>
  <div class="space-y-6">
    <PageHeader
      title="Categorias"
      subtitle="Gerencie categorias de receitas e despesas"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <Button variant="primary" icon="lucide:plus" @click="openCreate()">
            Nova Categoria
          </Button>
        </div>
      </template>
    </PageHeader>

    <!-- Toggle centralizado entre headline e filtros -->
    <div class="flex justify-center">
      <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
        <button
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="tab === 'income' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'"
          @click="tab = 'income'"
        >
          Receitas
        </button>
        <button
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="tab === 'expense' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'"
          @click="tab = 'expense'"
        >
          Despesas
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <Card>
      <div class="p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div class="flex-1">
          <Input
            v-model="search"
            type="search"
            placeholder="Buscar por nome/descrição..."
            icon="lucide:search"
          />
        </div>
      </div>
    </Card>

    <!-- Listas -->
    <div v-if="isLoadingAll" class="py-12">
      <LoadingSpinner center text="Carregando categorias..." />
    </div>

    <div v-else>
      <!-- Receitas -->
      <Card v-if="tab === 'income'">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Categorias de Receitas
          </h2>
        </template>

        <div v-if="categoriesStore.isLoading" class="p-6">
          <LoadingSpinner text="Carregando categorias..." />
        </div>

        <div v-else-if="filteredIncome.length === 0" class="p-6 text-center">
          <Icon
            name="lucide:tags"
            class="w-10 h-10 text-gray-400 mx-auto mb-2"
          />
          <p class="text-gray-500 dark:text-gray-400">
            Nenhuma categoria encontrada
          </p>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="c in filteredIncome"
            :key="c.category_id"
            class="p-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ c.name }}
                </p>
                <p
                  v-if="c.description"
                  class="text-sm text-gray-500 dark:text-gray-400"
                >
                  {{ c.description }}
                </p>
              </div>
            </div>
            <!-- Desktop: Show buttons directly -->
            <div class="hidden md:flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon="lucide:edit"
                @click="openEdit(c, 'income')"
                >Editar</Button
              >
              <Button
                size="sm"
                variant="error"
                icon="lucide:trash-2"
                @click="onDelete(c, 'income')"
                >Excluir</Button
              >
            </div>

            <!-- Mobile: Show dropdown -->
            <div class="md:hidden">
              <ActionDropdown>
                <ActionItem
                  label="Editar"
                  icon="lucide:edit"
                  @click="openEdit(c, 'income')"
                />
                <ActionItem
                  label="Excluir"
                  icon="lucide:trash-2"
                  variant="danger"
                  @click="onDelete(c, 'income')"
                />
              </ActionDropdown>
            </div>
          </div>
        </div>
      </Card>

      <!-- Despesas -->
      <Card v-else>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Categorias de Despesas
          </h2>
        </template>

        <div v-if="categoriesStore.isLoading" class="p-6">
          <LoadingSpinner text="Carregando categorias..." />
        </div>

        <div v-else-if="filteredExpense.length === 0" class="p-6 text-center">
          <Icon
            name="lucide:tags"
            class="w-10 h-10 text-gray-400 mx-auto mb-2"
          />
          <p class="text-gray-500 dark:text-gray-400">
            Nenhuma categoria encontrada
          </p>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="c in filteredExpense"
            :key="c.category_id"
            class="p-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ c.name }}
                  </p>
                  <Badge :variant="c.active ? 'success' : 'warning'" size="sm">
                    {{ c.active ? 'Ativa' : 'Inativa' }}
                  </Badge>
                  <Badge
                    v-if="categoryHasLimit(c.category_id)"
                    variant="info"
                    size="sm"
                    >Limite definido</Badge
                  >
                </div>
                <p
                  v-if="c.description"
                  class="text-sm text-gray-500 dark:text-gray-400"
                >
                  {{ c.description }}
                </p>
              </div>
            </div>

            <!-- Desktop: Show buttons directly -->
            <div class="hidden lg:flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                :icon="c.active ? 'lucide:toggle-right' : 'lucide:toggle-left'"
                @click="onToggleActive(c.category_id)"
              >
                {{ c.active ? 'Desativar' : 'Ativar' }}
              </Button>
              <Button
                v-if="categoryHasLimit(c.category_id)"
                size="sm"
                variant="primary"
                icon="lucide:bar-chart-3"
                @click="openLimitStatus(c.category_id)"
              >
                Status do limite
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon="lucide:shield"
                @click="openLimit(c.category_id)"
              >
                {{ categoryHasLimit(c.category_id) ? 'Editar limite' : 'Definir limite' }}
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon="lucide:edit"
                @click="openEdit(c, 'expense')"
                >Editar</Button
              >
              <Button
                size="sm"
                variant="error"
                icon="lucide:trash-2"
                @click="onDelete(c, 'expense')"
                >Excluir</Button
              >
            </div>

            <!-- Mobile/Tablet: Show dropdown -->
            <div class="lg:hidden">
              <ActionDropdown>
                <ActionItem
                  :label="c.active ? 'Desativar' : 'Ativar'"
                  :icon="c.active ? 'lucide:toggle-right' : 'lucide:toggle-left'"
                  @click="onToggleActive(c.category_id)"
                />
                <ActionItem
                  v-if="categoryHasLimit(c.category_id)"
                  label="Status do limite"
                  icon="lucide:bar-chart-3"
                  @click="openLimitStatus(c.category_id)"
                />
                <ActionItem
                  :label="categoryHasLimit(c.category_id) ? 'Editar limite' : 'Definir limite'"
                  icon="lucide:shield"
                  @click="openLimit(c.category_id)"
                />
                <ActionItem
                  label="Editar"
                  icon="lucide:edit"
                  @click="openEdit(c, 'expense')"
                />
                <ActionItem
                  label="Excluir"
                  icon="lucide:trash-2"
                  variant="danger"
                  @click="onDelete(c, 'expense')"
                />
              </ActionDropdown>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Modais -->
    <CategoryModal
      :is-open="showCategoryModal"
      :type="modalType"
      :category="editingCategory"
      @update:is-open="showCategoryModal = $event"
      @saved="onCategorySaved"
    />
    <LimitModal
      :is-open="showLimitModal"
      :expense-category-id="currentExpenseCategoryId"
      @update:is-open="showLimitModal = $event"
      @saved="onLimitSaved"
    />
    <LimitStatusModal
      :is-open="showLimitStatusModal"
      :expense-category-id="currentExpenseCategoryId"
      @update:is-open="showLimitStatusModal = $event"
      @edit-limit="onEditLimitFromStatus"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types';

definePageMeta({
  middleware: 'auth'
})

const categoriesStore = useCategoriesStore()
const limitsStore = useLimitsStore()
const { success, error: showError } = useNotifications()

// Estado
const tab = ref<'income' | 'expense'>('income')
const search = ref('')
const isLoadingAll = ref(true)

const showCategoryModal = ref(false)
const modalType = ref<'income' | 'expense'>('income')
const editingCategory = ref<Category | null>(null)

const showLimitModal = ref(false)
const showLimitStatusModal = ref(false)
const currentExpenseCategoryId = ref('')

// Computed filtros
const filteredIncome = computed(() => {
  const q = search.value.trim().toLowerCase()
  return categoriesStore.incomeCategories
    .filter(c => c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const filteredExpense = computed(() => {
  const q = search.value.trim().toLowerCase()
  return categoriesStore.expenseCategories
    .filter(c => c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const categoryHasLimit = (categoryId: string) =>
  limitsStore.limits.some(l => l.expense_category_id === categoryId)

// Ações
const loadIncomes = async () => {
  await categoriesStore.fetchIncomeCategories()
}

const loadExpenses = async () => {
  // Buscar todas as categorias (sem filtrar apenas ativas)
  await categoriesStore.fetchExpenseCategories(false)
}

const loadInitial = async () => {
  isLoadingAll.value = true
  try {
    await Promise.all([
      loadIncomes(),
      loadExpenses(),
      limitsStore.fetchLimits()
    ])
  } catch (err: any) {
    showError('Erro ao carregar categorias', err?.message)
  } finally {
    isLoadingAll.value = false
  }
}

const openCreate = () => {
  modalType.value = tab.value
  editingCategory.value = null
  showCategoryModal.value = true
}

const openEdit = (c: Category, type: 'income' | 'expense') => {
  modalType.value = type
  editingCategory.value = c
  showCategoryModal.value = true
}

const onDelete = async (c: Category, type: 'income' | 'expense') => {
  if (!confirm(`Tem certeza que deseja excluir a categoria "${c.name}"?`)) return
  try {
    if (type === 'income') {
      await categoriesStore.deleteIncomeCategory(c.category_id)
      await loadIncomes()
    } else {
      await categoriesStore.deleteExpenseCategory(c.category_id)
      await loadExpenses()
    }
    success('Categoria excluída')
  } catch (err: any) {
    showError('Erro ao excluir categoria', err?.message)
  }
}

const onToggleActive = async (categoryId: string) => {
  try {
    await categoriesStore.toggleExpenseCategoryActive(categoryId)
    await loadExpenses()
    success('Status atualizado')
  } catch (err: any) {
    showError('Erro ao atualizar status', err?.message)
  }
}

const openLimit = (expenseCategoryId: string) => {
  currentExpenseCategoryId.value = expenseCategoryId
  showLimitModal.value = true
}

const openLimitStatus = (expenseCategoryId: string) => {
  currentExpenseCategoryId.value = expenseCategoryId
  showLimitStatusModal.value = true
}

const onCategorySaved = async () => {
  if (modalType.value === 'income') await loadIncomes()
  else await loadExpenses()
}

const onLimitSaved = async () => {
  await limitsStore.fetchLimits()
}

const onEditLimitFromStatus = (categoryId: string) => {
  currentExpenseCategoryId.value = categoryId
  showLimitModal.value = true
}

// Init
onMounted(loadInitial)
</script>
