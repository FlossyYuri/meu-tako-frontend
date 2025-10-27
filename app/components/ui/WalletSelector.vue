<template>
  <div>
    <div class="flex gap-2">
      <Select
        v-model="selectedWalletId"
        label="Carteira"
        :options="formattedWalletOptions"
        placeholder="Selecione uma carteira"
        :error="error"
        :disabled="isLoading"
      />
      <Button
        type="button"
        variant="outline"
        icon="lucide:plus"
        @click="showWalletModal = true"
        :disabled="isLoading"
      >
        Nova
      </Button>
    </div>
    <p
      v-if="!isLoading && walletOptions.length === 0"
      class="text-sm text-gray-500 dark:text-gray-400 mt-1"
    >
      Nenhuma carteira encontrada. Crie uma nova carteira.
    </p>
  </div>

  <WalletCreateModal
    :is-open="showWalletModal"
    :loading="isLoading"
    @update:is-open="showWalletModal = $event"
    @close="showWalletModal = false"
    @submit="onWalletCreated"
  />
</template>

<script setup lang="ts">
import type { Wallet } from '~/types'

interface Props {
  modelValue?: string
  error?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  error: '',
  disabled: false
})

const emit = defineEmits<Emits>()

const walletsStore = useWalletsStore()
const { formatCurrency } = useCurrency()

const showWalletModal = ref(false)

const selectedWalletId = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const walletOptions = computed(() => walletsStore.walletOptions)
const isLoading = computed(() => walletsStore.isLoading)

const formattedWalletOptions = computed(() => {
  return walletOptions.value.map(wallet => ({
    value: wallet.value,
    label: `${wallet.label} (${formatCurrency(wallet.balance)})`
  }))
})

// Set default wallet when wallets are loaded
watch(() => walletsStore.wallets, (wallets) => {
  if (wallets.length > 0 && !selectedWalletId.value) {
    const defaultWallet = walletsStore.defaultWallet
    if (defaultWallet) {
      selectedWalletId.value = defaultWallet.wallet_id
    }
  }
}, { immediate: true })

// Load wallets on mount
onMounted(async () => {
  try {
    await walletsStore.fetchWallets()
  } catch (error) {
    console.error('Erro ao carregar carteiras:', error)
  }
})

const onWalletCreated = async (name: string) => {
  try {
    await walletsStore.createWallet({ wallet_name: name })
    showWalletModal.value = false
    // The wallet will be automatically selected due to the watch on wallets
  } catch (error) {
    console.error('Erro ao criar carteira:', error)
  }
}
</script>
