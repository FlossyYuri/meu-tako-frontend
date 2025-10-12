<template>
  <Card>
    <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Período -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Período
          </label>
          <select
            v-model="period"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Todos</option>
            <option value="today">Hoje</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mês</option>
            <option value="year">Este ano</option>
          </select>
        </div>

        <!-- Tipo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo
          </label>
          <select
            v-model="type"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
            <option value="transfer">Transferências</option>
          </select>
        </div>

        <!-- Carteira -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Carteira
          </label>
          <select
            v-model="walletId"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Todas</option>
            <option
              v-for="wallet in walletsStore.wallets"
              :key="wallet.wallet_id"
              :value="wallet.wallet_id"
            >
              {{ wallet.wallet_name }}
            </option>
          </select>
        </div>

        <!-- Busca -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar
          </label>
          <Input
            v-model="search"
            type="search"
            placeholder="Descrição..."
            icon="lucide:search"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
interface Filters {
  period: 'all' | 'today' | 'week' | 'month' | 'year'
  type: '' | 'income' | 'expense' | 'transfer'
  wallet_id: string
  search: string
}

const props = defineProps<{
  modelValue: Filters
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Filters]
}>()

const walletsStore = useWalletsStore()

const update = (patch: Partial<Filters>) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

// Writable computeds para campos individuais
const period = computed({
  get: () => props.modelValue.period,
  set: (v: Filters['period']) => update({ period: v })
})
const type = computed({
  get: () => props.modelValue.type,
  set: (v: Filters['type']) => update({ type: v })
})
const walletId = computed({
  get: () => props.modelValue.wallet_id,
  set: (v: string) => update({ wallet_id: v })
})
const search = computed({
  get: () => props.modelValue.search,
  set: (v: string) => update({ search: v })
})
</script>