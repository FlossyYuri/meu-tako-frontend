<template>
  <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="onSubmit">
    <Input
      v-model="amount"
      type="number"
      placeholder="Valor da contribuição"
      :error="errorText"
      :step="0.01"
      :min="0.01"
    />
    <Button
      type="submit"
      variant="primary"
      :loading="goalsStore.isLoading"
      :disabled="!canSubmit"
      icon="lucide:plus"
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
const errorText = ref('')

const canSubmit = computed(() => {
  const val = parseFloat(amount.value)
  return !!amount.value && !isNaN(val) && val > 0 && !errorText.value
})

watch(amount, () => { if (errorText.value) errorText.value = '' })

const onSubmit = async () => {
  errorText.value = ''
  const val = parseFloat(amount.value)
  if (!amount.value || isNaN(val) || val <= 0) {
    errorText.value = 'Informe um valor válido'
    return
  }
  try {
    await goalsStore.contributeToGoal(props.goalId, { amount: val })
    success('Contribuição registrada!')
    amount.value = ''
    emit('contributed')
  } catch (err: any) {
    showError('Erro ao contribuir', err?.message)
  }
}
</script>
