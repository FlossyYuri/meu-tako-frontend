<template>
  <div class="space-y-6">
    <PageHeader
      title="Limites de Despesa"
      subtitle="Defina e acompanhe limites por categoria"
    >
      <template #actions>
        <Button to="/limits/new" variant="primary" icon="lucide:plus"
          >Novo Limite</Button
        >
      </template>
    </PageHeader>

    <!-- Filters -->
    <Card>
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            placeholder="Buscar por categoria ou descrição..."
            icon="lucide:search"
          />
        </div>
        <div class="flex gap-2">
          <select v-model="statusFilter" class="input">
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="expired">Expirados</option>
          </select>
          <Button
            variant="outline"
            icon="lucide:filter"
            @click="showFilters = !showFilters"
          >
            Filtros
          </Button>
        </div>
      </div>

      <!-- Advanced filters -->
      <div
        v-if="showFilters"
        class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="label">Categoria</label>
            <select v-model="categoryFilter" class="input">
              <option value="">Todas as categorias</option>
              <option
                v-for="category in categoriesStore.expenseCategories"
                :key="category.category_id"
                :value="category.category_id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label">Data de início</label>
            <Input v-model="startDateFilter" type="date" />
          </div>
          <div>
            <label class="label">Data de fim</label>
            <Input v-model="endDateFilter" type="date" />
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <Button variant="outline" @click="clearFilters">Limpar</Button>
          <Button variant="primary" @click="applyFilters">Aplicar</Button>
        </div>
      </div>
    </Card>

    <!-- Limits Grid -->
    <div
      v-if="limitsStore.isLoading"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
      </div>
    </div>

    <div v-else-if="filteredLimits.length === 0" class="text-center py-12">
      <Icon name="lucide:shield" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ searchQuery || statusFilter || categoryFilter ? 'Nenhum limite encontrado' : 'Nenhum limite configurado' }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        {{ searchQuery || statusFilter || categoryFilter ? 'Tente ajustar os filtros de busca' : 'Comece criando seu primeiro limite de despesa' }}
      </p>
      <Button to="/limits/new" variant="primary" icon="lucide:plus">
        Criar Primeiro Limite
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LimitCard
        v-for="limit in filteredLimits"
        :key="limit.limit_id"
        :limit="limit"
        :status="limitStatuses[limit.limit_id]"
        :category="getCategoryById(limit.expense_category_id)"
        @view="onView"
        @edit="onEdit"
        @delete="onDelete"
      />
    </div>

    <!-- Error message -->
    <div v-if="limitsStore.error" class="text-center">
      <div
        class="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4"
      >
        <Icon
          name="lucide:alert-circle"
          class="w-5 h-5 text-error-600 dark:text-error-400 mx-auto mb-2"
        />
        <p class="text-error-600 dark:text-error-400">
          {{ limitsStore.error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Limit, LimitStatus, Category } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const limitsStore = useLimitsStore()
const categoriesStore = useCategoriesStore()
const { success, error: showError } = useNotifications()

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const startDateFilter = ref('')
const endDateFilter = ref('')
const showFilters = ref(false)

// Limit statuses cache
const limitStatuses = ref<Record<string, LimitStatus>>({})

const filteredLimits = computed(() => {
  let filtered = limitsStore.limits

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(limit => {
      const category = getCategoryById(limit.expense_category_id)
      return (
        category?.name.toLowerCase().includes(query) ||
        (limit as any).description?.toLowerCase().includes(query)
      )
    })
  }

  // Status filter
  if (statusFilter.value) {
    const now = new Date()
    filtered = filtered.filter(limit => {
      const startDate = new Date(limit.start_date)
      const endDate = new Date(limit.end_date)

      switch (statusFilter.value) {
        case 'active':
          return now >= startDate && now <= endDate
        case 'inactive':
          return now < startDate
        case 'expired':
          return now > endDate
        default:
          return true
      }
    })
  }

  // Category filter
  if (categoryFilter.value) {
    filtered = filtered.filter(limit => limit.expense_category_id === categoryFilter.value)
  }

  // Date filters
  if (startDateFilter.value) {
    filtered = filtered.filter(limit => limit.start_date >= startDateFilter.value)
  }

  if (endDateFilter.value) {
    filtered = filtered.filter(limit => limit.end_date <= endDateFilter.value)
  }

  return filtered
})

const getCategoryById = (id: string): Category | null => {
  return categoriesStore.getExpenseCategoryById(id) || null
}

const loadLimitStatuses = async () => {
  for (const limit of limitsStore.limits) {
    try {
      const status = await limitsStore.getLimitStatus(limit.limit_id)
      limitStatuses.value[limit.limit_id] = status
    } catch (err) {
      console.error(`Failed to load status for limit ${limit.limit_id}:`, err)
      // Set a default status object to prevent undefined errors
      limitStatuses.value[limit.limit_id] = {
        limit: {
          limit_id: limit.limit_id,
          user_id: limit.user_id,
          expense_category_id: limit.expense_category_id,
          limit_amount: limit.limit_amount.toString(),
          start_date: limit.start_date,
          end_date: limit.end_date,
          active: limit.is_active,
          created_at: limit.created_at,
          updated_at: limit.updated_at,
          category: {
            expense_category_id: limit.expense_category_id,
            name: getCategoryById(limit.expense_category_id)?.name || 'Categoria',
            description: '',
            priority: 0,
            active: true
          }
        },
        totalSpent: 0,
        remainingAmount: limit.limit_amount,
        percentageUsed: 0,
        isExceeded: false,
        isNearLimit: false
      }
    }
  }
}

const onView = (limit: Limit) => {
  navigateTo(`/limits/${limit.limit_id}`)
}

const onEdit = (limit: Limit) => {
  navigateTo(`/limits/${limit.limit_id}`)
}

const onDelete = async (limit: Limit) => {
  if (!confirm(`Tem certeza que deseja excluir o limite para ${getCategoryById(limit.expense_category_id)?.name}?`)) return

  try {
    await limitsStore.deleteLimit(limit.limit_id)
    success('Limite excluído com sucesso')
    // Remove from statuses cache
    delete limitStatuses.value[limit.limit_id]
  } catch (err: any) {
    showError('Erro ao excluir limite', err?.message)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
  startDateFilter.value = ''
  endDateFilter.value = ''
}

const applyFilters = () => {
  showFilters.value = false
}

onMounted(async () => {
  try {
    await Promise.all([
      categoriesStore.fetchExpenseCategories(false),
      limitsStore.fetchLimits()
    ])
    await loadLimitStatuses()
  } catch (err: any) {
    showError('Erro ao carregar dados', err?.message)
  }
})

// Watch for changes in limits to reload statuses
watch(() => limitsStore.limits, () => {
  loadLimitStatuses()
}, { deep: true })
</script>
