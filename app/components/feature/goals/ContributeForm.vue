<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input
        v-model="amount"
        type="number"
        placeholder="Valor da contribuição"
        :error="errorText"
        :step="0.01"
        :min="0.01"
        label="Valor"
      />
      <Input
        v-model="description"
        placeholder="Descrição (opcional)"
        label="Descrição"
      />
    </div>
    <Button
      type="submit"
      variant="primary"
      :loading="goalsStore.isLoading"
      :disabled="!canSubmit"
      icon="lucide:plus"
      class="w-full sm:w-auto"
    >
      Contribuir
    </Button>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{ goalId: string }>()
const emit = defineEmits<{ contributed: [] }>()

const goalsStore = useGoalsStore()
const { success, error: showError } = useNotifications()

const amount = ref('')
const description = ref('')
const errorText = ref('')

const canSubmit = computed(() => {
  const val = parseFloat(amount.value)
  return !!amount.value && !isNaN(val) && val > 0 && !errorText.value
})

watch([amount, description], () => { if (errorText.value) errorText.value = '' })

const onSubmit = async () => {
  errorText.value = ''
  const val = parseFloat(amount.value)
  if (!amount.value || isNaN(val) || val <= 0) {
    errorText.value = 'Informe um valor válido'
    return
  }
  try {
    await goalsStore.contributeToGoal(props.goalId, {
      amount: val,
      description: description.value || undefined
    })
    success('Contribuição registrada!')
    amount.value = ''
    description.value = ''
    emit('contributed')
  } catch (err: any) {
    showError('Erro ao contribuir', err?.message)
  }
}
</script>
