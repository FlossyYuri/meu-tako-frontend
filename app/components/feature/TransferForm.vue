<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Select
          v-model="form.from_wallet_id"
          label="Carteira de origem"
          :options="walletOptions"
          placeholder="Selecione"
          :error="errors.from_wallet_id"
        />
      </div>

      <div>
        <Select
          v-model="form.to_wallet_id"
          label="Carteira de destino"
          :options="walletOptions"
          placeholder="Selecione"
          :error="errors.to_wallet_id"
        />
      </div>
    </div>

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
        v-model="form.description"
        type="text"
        label="Descrição (opcional)"
        placeholder="Ex.: Transferência entre carteiras"
      />
    </div>

    <div class="flex gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')"
        >Cancelar</Button
      >
      <Button
        type="submit"
        variant="primary"
        :loading="transactionsStore.isLoading"
        :disabled="!isValid"
        >Transferir</Button
      >
    </div>

    <div v-if="transactionsStore.error" class="text-center">
      <p class="text-sm text-error-600 dark:text-error-400">
        {{ transactionsStore.error }}
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()
const { success, error: showError } = useNotifications()

const form = reactive({
  from_wallet_id: '',
  to_wallet_id: '',
  amount: '',
  description: ''
})

const errors = reactive({
  from_wallet_id: '',
  to_wallet_id: '',
  amount: ''
})

const walletOptions = computed(() => {
  return walletsStore.wallets.map(wallet => ({
    value: wallet.wallet_id,
    label: wallet.wallet_name
  }))
})

const isValid = computed(() => {
  return !!form.from_wallet_id && !!form.to_wallet_id && !!form.amount &&
    !errors.from_wallet_id && !errors.to_wallet_id && !errors.amount
})

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const validate = () => {
  errors.from_wallet_id = ''
  errors.to_wallet_id = ''
  errors.amount = ''

  if (!form.from_wallet_id) errors.from_wallet_id = 'Selecione a carteira de origem'
  if (!form.to_wallet_id) errors.to_wallet_id = 'Selecione a carteira de destino'
  if (form.from_wallet_id && form.to_wallet_id && form.from_wallet_id === form.to_wallet_id) {
    errors.to_wallet_id = 'Carteiras devem ser diferentes'
  }

  const val = parseFloat(form.amount)
  if (!form.amount || isNaN(val) || val <= 0) errors.amount = 'Valor deve ser maior que zero'

  return !errors.from_wallet_id && !errors.to_wallet_id && !errors.amount
}

const onSubmit = async () => {
  if (!validate()) return
  try {
    await transactionsStore.transferBetweenWallets({
      from_wallet_id: form.from_wallet_id,
      to_wallet_id: form.to_wallet_id,
      amount: parseFloat(form.amount),
      description: form.description || undefined
    })
    success('Transferência realizada com sucesso!')
    emit('success')
  } catch (err: any) {
    showError('Erro ao transferir', err?.message)
  }
}

onMounted(async () => {
  if (!walletsStore.wallets.length) {
    try {
      await walletsStore.fetchWallets()
    } catch {}
  }
})
</script>
