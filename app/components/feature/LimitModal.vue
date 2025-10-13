<template>
  <Modal
    :is-open="isOpen"
    :title="limitTitle"
    size="md"
    @update:is-open="emit('update:isOpen', $event)"
  >
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          v-model="form.amount"
          type="number"
          label="Valor do limite"
          step="0.01"
          min="0.01"
          required
          :error="errors.amount"
        />
        <Input
          v-model="form.start_date"
          type="date"
          label="Início"
          required
          :error="errors.start_date"
        />
      </div>

      <Input
        v-model="form.end_date"
        type="date"
        label="Fim"
        required
        :error="errors.end_date"
      />

      <Input
        v-model="form.description"
        type="text"
        label="Descrição (opcional)"
      />

      <div class="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          @click="emit('update:isOpen', false)"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          :loading="limitsStore.isLoading"
          :disabled="!isValid"
        >
          Salvar
        </Button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  expenseCategoryId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  saved: []
}>()

const limitsStore = useLimitsStore()
const { success, error: showError } = useNotifications()

const today = new Date().toISOString().split('T')[0]
const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  .toISOString().split('T')[0]

const form = reactive({
  limit_amount: '',
  start_date: today,
  end_date: endOfMonth,
  description: ''
})

const errors = reactive({
  limit_amount: '',
  start_date: '',
  end_date: ''
})

const currentLimit = computed(() =>
  limitsStore.limits.find(l => l.expense_category_id === props.expenseCategoryId)
)

const limitTitle = computed(() => currentLimit.value ? 'Editar Limite' : 'Definir Limite')

const isValid = computed(() => {
  return !!form.amount && !!form.start_date && !!form.end_date &&
    !errors.amount && !errors.start_date && !errors.end_date
})

watch(() => props.isOpen, async (open) => {
  if (open) {
    try {
      if (!limitsStore.limits.length) await limitsStore.fetchLimits()
      // Preencher se já tiver limite
      if (currentLimit.value) {
        form.amount = String(currentLimit.value.amount)
        form.start_date = currentLimit.value.start_date
        form.end_date = currentLimit.value.end_date
        form.description = (currentLimit.value as any).description || ''
      } else {
        form.amount = ''
        form.start_date = today
        form.end_date = endOfMonth
        form.description = ''
      }
    } catch (err: any) {
      showError('Erro ao carregar limite', err?.message)
    }
  }
})

const validate = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true
  const val = parseFloat(form.amount)
  if (!form.amount || isNaN(val) || val <= 0) { errors.amount = 'Valor inválido'; ok = false }
  if (!form.start_date) { errors.start_date = 'Data inicial é obrigatória'; ok = false }
  if (!form.end_date) { errors.end_date = 'Data final é obrigatória'; ok = false }
  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
    errors.end_date = 'Data final não pode ser anterior à inicial'; ok = false
  }
  return ok
}

const onSubmit = async () => {
  if (!validate()) return
  try {
    if (currentLimit.value) {
      await limitsStore.updateLimit(currentLimit.value.limit_id, {
        expense_category_id: props.expenseCategoryId,
        limit_amount: parseFloat(form.amount),
        start_date: form.start_date,
        end_date: form.end_date,
        description: form.description || undefined
      })
    } else {
      await limitsStore.createLimit({
        expense_category_id: props.expenseCategoryId,
        limit_amount: parseFloat(form.amount),
        start_date: form.start_date,
        end_date: form.end_date,
        description: form.description || undefined
      })
    }
    success('Limite salvo com sucesso')
    emit('saved')
    emit('update:isOpen', false)
  } catch (err: any) {
    showError('Erro ao salvar limite', err?.message)
  }
}
</script>
