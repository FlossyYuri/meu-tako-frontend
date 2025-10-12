<template>
  <div v-if="transactions.length" class="space-y-4">
    <TransactionItem
      v-for="tx in transactions"
      :key="tx.transaction_id"
      :transaction="tx"
      :wallet-name="getWalletName(tx.wallet_id)"
      :show-wallet="showWallet"
      :show-category="showCategory && !!tx.category"
      :variant="variant"
      :clickable="clickable"
      @select="onSelect"
    />
  </div>

  <div v-else class="text-center py-12">
    <Icon name="lucide:credit-card" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Nenhuma transação encontrada
    </h3>
    <p class="text-gray-500 dark:text-gray-400">
      Comece adicionando a sua primeira transação
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~/types';

const props = withDefaults(defineProps<{
  transactions: Transaction[]
  showWallet?: boolean
  showCategory?: boolean
  clickable?: boolean
  variant?: 'list' | 'card'
}>(), {
  showWallet: true,
  showCategory: true,
  clickable: true,
  variant: 'card'
})

const walletsStore = useWalletsStore()

const getWalletName = (walletId: string) => {
  const wallet = walletsStore.wallets.find(w => w.wallet_id === walletId)
  return wallet?.wallet_name || 'Carteira'
}

const onSelect = (tx: Transaction) => {
  navigateTo(`/transactions/${tx.transaction_id}`)
}
</script>