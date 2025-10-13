<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div>
      <Input
        v-model="form.title"
        type="text"
        label="Título"
        placeholder="Ex.: Férias na Europa"
        :error="errors.title"
        required
      />
    </div>

    <div>
      <Input
        v-model="form.description"
        type="text"
        label="Descrição (opcional)"
        placeholder="Ex.: Economizar para viajar"
      />
    </div>

    <div>
      <Input
        v-model="form.target_amount"
        type="number"
        label="Valor alvo"
        placeholder="0,00"
        :error="errors.target_amount"
        required
        :step="0.01"
        :min="0.01"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        v-model="form.start_date"
        type="date"
        label="Data de início"
        :error="errors.start_date"
        required
      />
      <Input
        v-model="form.end_date"
        type="date"
        label="Data de término"
        :error="errors.end_date"
        required
      />
    </div>

    <div>
      <label class="label">Categoria de Despesa (opcional)</label>
      <select v-model="form.expense_category_id" class="input">
        <option value="">Sem categoria</option>
        <option
          v-for="c in categoriesStore.expenseCategories"
          :key="c.category_id"
          :value="c.category_id"
        >
          {{ c.name }}
        </option>
      </select>
    </div>

    <div class="flex gap-3">
      <Button
        v-if="showCancel"
        type="button"
        variant="outline"
        @click="emit('cancel')"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="primary"
        :loading="goalsStore.isLoading"
        :disabled="!isValid"
      >
        {{ submitLabel }}
      </Button>
    </div>

    <div v-if="goalsStore.error" class="text-center">
      <p class="text-sm text-error-600 dark:text-error-400">
        {{ goalsStore.error }}
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Goal } from '~/types';

const props = withDefaults(defineProps<{
  mode: 'create' | 'edit'
  goal?: Goal | null
  showCancel?: boolean
}>(), {
  mode: 'create',
  goal: null,
  showCancel: false
})

const emit = defineEmits<{
  saved: [goal: Goal]
  cancel: []
}>()

const categoriesStore = useCategoriesStore()
const goalsStore = useGoalsStore()
const { success, error: showError } = useNotifications()

const today = new Date()
const defaultStart = today.toISOString().split('T')[0]
const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0]

const form = reactive({
  title: props.goal?.title || '',
  description: props.goal?.description || '',
  target_amount: props.goal ? String(props.goal.target_amount) : '',
  start_date: props.goal?.start_date || defaultStart,
  end_date: props.goal?.end_date || defaultEnd,
  expense_category_id: (props.goal as any)?.expense_category_id || ''
})

watch(() => props.goal, (g) => {
  if (!g) return
  form.title = g.title
  form.description = g.description || ''
  form.target_amount = String(g.target_amount)
  form.start_date = g.start_date
  form.end_date = g.end_date
  form.expense_category_id = (g as any).expense_category_id || ''
})

const errors = reactive({
  title: '',
  target_amount: '',
  start_date: '',
  end_date: ''
})

const isValid = computed(() => {
  return !!form.title.trim() &&
    !!form.target_amount &&
    !!form.start_date &&
    !!form.end_date &&
    !errors.title &&
    !errors.target_amount &&
    !errors.start_date &&
    !errors.end_date
})

const validate = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true
  if (!form.title.trim()) { errors.title = 'Título é obrigatório'; ok = false }
  const val = parseFloat(form.target_amount)
  if (!form.target_amount || isNaN(val) || val <= 0) {
    errors.target_amount = 'Valor alvo deve ser maior que zero'
    ok = false
  }
  if (!form.start_date) { errors.start_date = 'Data de início é obrigatória'; ok = false }
  if (!form.end_date) { errors.end_date = 'Data de término é obrigatória'; ok = false }
  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
    errors.end_date = 'Término não pode ser antes do início'
    ok = false
  }
  return ok
}

const submitLabel = computed(() => props.mode === 'create' ? 'Criar Meta' : 'Salvar Alterações')

const onSubmit = async () => {
  if (!validate()) return
  try {
    if (props.mode === 'create') {
      const created = await goalsStore.createGoal({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        target_amount: parseFloat(form.target_amount),
        start_date: form.start_date,
        end_date: form.end_date,
        expense_category_id: form.expense_category_id || undefined
      })
      success('Meta criada com sucesso!')
      emit('saved', created)
    } else if (props.goal) {
      const updated = await goalsStore.updateGoal(props.goal.goal_id, {
        title: form.title.trim() || undefined,
        description: form.description?.trim() || undefined,
        target_amount: parseFloat(form.target_amount),
        start_date: form.start_date,
        end_date: form.end_date,
        expense_category_id: form.expense_category_id || undefined
      })
      success('Meta atualizada com sucesso')
      emit('saved', updated)
    }
  } catch (err: any) {
    showError('Erro ao salvar meta', err?.message)
  }
}

onMounted(async () => {
  try {
    // Carregar categorias (apenas ativas é suficiente para vincular a metas)
    await categoriesStore.fetchExpenseCategories(true)
  } catch {}
})

// limpar mensagens de erro enquanto digita
watch(() => form.title, () => { if (errors.title) errors.title = '' })
watch(() => form.target_amount, () => { if (errors.target_amount) errors.target_amount = '' })
watch(() => form.start_date, () => { if (errors.start_date) errors.start_date = '' })
watch(() => form.end_date, () => { if (errors.end_date) errors.end_date = '' })
</script>
