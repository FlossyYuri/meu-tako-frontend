<template>
  <Card class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Transações Recentes
      </h2>
      <div class="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('refresh')"
          :disabled="isLoading"
        >
          <Icon
            name="lucide:refresh-cw"
            :class="{ 'animate-spin': isLoading }"
            class="w-4 h-4"
          />
        </Button>
        <Button variant="outline" size="sm" @click="$emit('view-all')">
          Ver Todas
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div class="space-y-3">
        <Skeleton class="h-16 w-full" />
        <Skeleton class="h-16 w-full" />
        <Skeleton class="h-16 w-full" />
      </div>
    </div>

    <div v-else-if="hasRecentTransactions" class="space-y-3">
      <div
        v-for="transaction in recentTransactions.slice(0, 5)"
        :key="transaction.transaction_id"
        class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
        @click="$emit('view-transaction', transaction.transaction_id)"
      >
        <div class="flex items-center space-x-3">
          <!-- Transaction Icon -->
          <div
            :class="[
              'flex items-center justify-center w-10 h-10 rounded-full',
              getTransactionIconBg(transaction.type)
            ]"
          >
            <Icon
              :name="getTransactionIcon(transaction.type)"
              :class="getTransactionIconColor(transaction.type)"
              class="w-5 h-5"
            />
          </div>

          <!-- Transaction Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <p
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ transaction.description || getDefaultDescription(transaction.type) }}
              </p>
              <Badge
                :variant="getTransactionBadgeVariant(transaction.type)"
                size="sm"
              >
                {{ getTransactionTypeLabel(transaction.type) }}
              </Badge>
            </div>
            <div
              class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400"
            >
              <Icon name="lucide:calendar" class="w-3 h-3" />
              <span>{{ formatRelativeTime(transaction.date) }}</span>
              <span
                v-if="transaction.category"
                class="flex items-center space-x-1"
              >
                <Icon name="lucide:tag" class="w-3 h-3" />
                <span>{{ transaction.category.name }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Amount -->
        <div class="text-right">
          <p
            :class="[
              'text-sm font-semibold',
              getAmountColor(transaction.type)
            ]"
          >
            {{ getAmountPrefix(transaction.type)

            }}{{ formatCurrency(Math.abs(transaction.amount)) }}
          </p>
        </div>
      </div>

      <!-- Show More Button -->
      <div v-if="recentTransactions.length > 5" class="text-center pt-2">
        <Button variant="ghost" size="sm" @click="$emit('view-all')">
          Ver mais
          {{ recentTransactions.length - 5 }}
          transação{{ recentTransactions.length - 5 > 1 ? 'ões' : '' }}
          <Icon name="lucide:chevron-right" class="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <Icon
        name="lucide:receipt"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Nenhuma transação encontrada
      </p>
      <Button variant="outline" @click="$emit('create-transaction')">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Criar Primeira Transação
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
interface Props {
  recentTransactions: Transaction[];
  isLoading: boolean;
  hasRecentTransactions: boolean;
}

defineProps<Props>();

defineEmits<{
  refresh: [];
  'view-all': [];
  'view-transaction': [transactionId: string];
  'create-transaction': [];
}>();

const { formatCurrency, formatRelativeTime } = useApi();

const getTransactionIcon = (type: string): string => {
  switch (type) {
    case 'income':
      return 'lucide:trending-up';
    case 'expense':
      return 'lucide:trending-down';
    case 'transfer':
      return 'lucide:arrow-left-right';
    default:
      return 'lucide:receipt';
  }
};

const getTransactionIconBg = (type: string): string => {
  switch (type) {
    case 'income':
      return 'bg-green-100 dark:bg-green-900/20';
    case 'expense':
      return 'bg-red-100 dark:bg-red-900/20';
    case 'transfer':
      return 'bg-blue-100 dark:bg-blue-900/20';
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
};

const getTransactionIconColor = (type: string): string => {
  switch (type) {
    case 'income':
      return 'text-green-600 dark:text-green-400';
    case 'expense':
      return 'text-red-600 dark:text-red-400';
    case 'transfer':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const getTransactionBadgeVariant = (type: string): string => {
  switch (type) {
    case 'income':
      return 'default';
    case 'expense':
      return 'destructive';
    case 'transfer':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getTransactionTypeLabel = (type: string): string => {
  switch (type) {
    case 'income':
      return 'Receita';
    case 'expense':
      return 'Despesa';
    case 'transfer':
      return 'Transferência';
    default:
      return 'Transação';
  }
};

const getAmountColor = (type: string): string => {
  switch (type) {
    case 'income':
      return 'text-green-600 dark:text-green-400';
    case 'expense':
      return 'text-red-600 dark:text-red-400';
    case 'transfer':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-gray-900 dark:text-white';
  }
};

const getAmountPrefix = (type: string): string => {
  switch (type) {
    case 'income':
      return '+';
    case 'expense':
      return '-';
    case 'transfer':
      return '';
    default:
      return '';
  }
};

const getDefaultDescription = (type: string): string => {
  switch (type) {
    case 'income':
      return 'Receita';
    case 'expense':
      return 'Despesa';
    case 'transfer':
      return 'Transferência';
    default:
      return 'Transação';
  }
};
</script>
