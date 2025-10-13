<template>
  <Card class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Saldos das Carteiras
      </h2>
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
    </div>

    <div v-if="isLoading" class="space-y-4">
      <Skeleton class="h-16 w-full" />
      <div class="space-y-3">
        <Skeleton class="h-16 w-full" />
        <Skeleton class="h-16 w-full" />
      </div>
    </div>

    <div v-else-if="balance" class="space-y-6">
      <!-- Saldo Total -->
      <div class="text-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Saldo Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ totalBalanceFormatted }}
        </p>
      </div>

      <!-- Lista de Carteiras -->
      <div class="space-y-3">
        <div
          v-for="wallet in balance.wallets"
          :key="wallet.wallet_id"
          class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2">
              <Icon
                name="lucide:wallet"
                class="w-5 h-5 text-gray-600 dark:text-gray-400"
              />
              <span class="font-medium text-gray-900 dark:text-white">
                {{ wallet.wallet_name }}
              </span>
              <Badge v-if="wallet.is_default" variant="secondary" size="sm">
                Padrão
              </Badge>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ formatCurrency(parseFloat(wallet.balance)) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ wallet.wallet_id.slice(0, 8) }}...
            </p>
          </div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div
        class="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <Button variant="outline" size="sm" @click="$emit('view-wallets')">
          <Icon name="lucide:eye" class="w-4 h-4 mr-2" />
          Ver Todas
        </Button>
        <Button variant="outline" size="sm" @click="$emit('add-wallet')">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          Nova Carteira
        </Button>
        <Button variant="outline" size="sm" @click="$emit('transfer')">
          <Icon name="lucide:arrow-left-right" class="w-4 h-4 mr-2" />
          Transferir
        </Button>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <Icon name="lucide:wallet" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Nenhuma carteira encontrada
      </p>
      <Button variant="outline" @click="$emit('add-wallet')">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Criar Primeira Carteira
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
interface Props {
  balance: DashboardBalance | null;
  isLoading: boolean;
  totalBalanceFormatted: string;
}

defineProps<Props>();

defineEmits<{
  refresh: [];
  'view-wallets': [];
  'add-wallet': [];
  transfer: [];
}>();

const { formatCurrency } = useApi();
</script>
