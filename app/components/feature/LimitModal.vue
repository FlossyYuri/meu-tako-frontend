<template>
  <Modal
    :is-open="isOpen"
    :title="limitTitle"
    size="md"
    @update:is-open="emit('update:isOpen', $event)"
  >
    <!-- Informações da Categoria -->
    <div
      v-if="categoryInfo"
      class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: categoryInfo.color || '#6B7280' }"
        >
          <Icon
            :name="categoryInfo.icon || 'lucide:tag'"
            class="w-5 h-5 text-white"
          />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ categoryInfo.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ categoryInfo.description || 'Sem descrição' }}
          </p>
          <div class="flex items-center gap-2 mt-2">
            <Badge
              :variant="categoryInfo.active ? 'success' : 'warning'"
              size="sm"
            >
              {{ categoryInfo.active ? 'Ativa' : 'Inativa' }}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          v-model="form.limit_amount"
          type="number"
          label="Valor do limite"
          :step="0.01"
          :min="0.01"
          required
          :error="errors.limit_amount"
        />
        <Input
          v-model="form.start_date"
          type="text"
          label="Início"
          required
          :error="errors.start_date"
        />
      </div>

      <Input
        v-model="form.end_date"
        type="text"
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
const categoriesStore = useCategoriesStore()
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

const categoryInfo = computed(() => {
  return categoriesStore.expenseCategories.find(c => c.category_id === props.expenseCategoryId)
})

const limitTitle = computed(() => currentLimit.value ? 'Editar Limite' : 'Definir Limite')

const isValid = computed(() => {
  return !!form.limit_amount && !!form.start_date && !!form.end_date &&
    !errors.limit_amount && !errors.start_date && !errors.end_date
})

watch(() => props.isOpen, async (open) => {
  if (open) {
    try {
      // Carregar categorias se necessário
      if (!categoriesStore.expenseCategories.length) {
        await categoriesStore.fetchExpenseCategories()
      }

      if (!limitsStore.limits.length) await limitsStore.fetchLimits()

      // Preencher se já tiver limite
      if (currentLimit.value) {
        form.limit_amount = String(currentLimit.value.limit_amount)
        form.start_date = currentLimit.value.start_date
        form.end_date = currentLimit.value.end_date
        form.description = (currentLimit.value as any).description ?? ''
      } else {
        form.limit_amount = ''
        form.start_date = today
        form.end_date = endOfMonth
        form.description = ''
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      showError('Erro ao carregar limite', errorMessage)
    }
  }
})

const validate = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true
  const val = parseFloat(form.limit_amount)
  if (!form.limit_amount || isNaN(val) || val <= 0) { errors.limit_amount = 'Valor inválido'; ok = false }
  if (!form.start_date) { errors.start_date = 'Data inicial é obrigatória'; ok = false }
  if (!form.end_date) { errors.end_date = 'Data final é obrigatória'; ok = false }
  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
    errors.end_date = 'Data final não pode ser anterior à inicial'; ok = false
  }
  return ok
}

const formatDate = (dateString: string) => {
  if (!dateString || dateString.trim() === '') return 'Data não disponível'

  // Tentar diferentes formatos de data
  let date: Date

  // Se já é um objeto Date válido
  if (typeof dateString === 'object' && dateString instanceof Date && !isNaN(dateString.getTime())) {
    date = dateString
  } else {
    // Tentar criar um novo Date
    date = new Date(dateString)

    // Se falhar, tentar parsear como ISO
    if (isNaN(date.getTime())) {
      // Tentar formatos comuns
      const isoDate = dateString.replace(/[^\d-]/g, '-')
      date = new Date(isoDate)
    }
  }

  if (isNaN(date.getTime())) return 'Data inválida'

  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const onSubmit = async () => {
  if (!validate()) return
  try {
    if (currentLimit.value) {
      await limitsStore.updateLimit(currentLimit.value.limit_id, {
        expense_category_id: props.expenseCategoryId,
        limit_amount: parseFloat(form.limit_amount),
        start_date: form.start_date,
        end_date: form.end_date,
        description: form.description || undefined
      })
    } else {
      await limitsStore.createLimit({
        expense_category_id: props.expenseCategoryId,
        limit_amount: parseFloat(form.limit_amount),
        start_date: form.start_date,
        end_date: form.end_date,
        description: form.description || undefined
      })
    }
    success('Limite salvo com sucesso')
    emit('saved')
    emit('update:isOpen', false)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    showError('Erro ao salvar limite', errorMessage)
  }
}
</script>
