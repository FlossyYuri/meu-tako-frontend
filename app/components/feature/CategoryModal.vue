<template>
  <Modal
    :isOpen="isOpen"
    :title="modalTitle"
    size="md"
    @update:isOpen="emit('update:isOpen', $event)"
  >
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Input
          v-model="form.name"
          label="Nome"
          required
          :error="errors.name"
        />
      </div>

      <Input
        v-model="form.description"
        label="Descrição (opcional)"
        placeholder="Ex.: Salários, Vendas, Alimentação"
      />

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" @click="emit('update:isOpen', false)">
          Cancelar
        </Button>
        <Button type="submit" variant="primary" :loading="categoriesStore.isLoading" :disabled="!form.name.trim()">
          Salvar
        </Button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import type { Category } from '~/types';

interface Props {
  isOpen: boolean
  type: 'income' | 'expense'
  category?: Category | null
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  category: null
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  saved: [category: Category]
}>()

const categoriesStore = useCategoriesStore()
const { success, error: showError } = useNotifications()

// Mantém um ID estável da categoria em edição para evitar 'undefined'
const editingId = ref<string | null>(props.category?.category_id ?? null)

const form = reactive({
  name: props.category?.name || '',
  description: props.category?.description || ''
})

const errors = reactive({
  name: ''
})

const modalTitle = computed(() => {
  const action = editingId.value ? 'Editar' : 'Nova'
  const tipo = props.type === 'income' ? 'Categoria de Receita' : 'Categoria de Despesa'
  return `${action} ${tipo}`
})

// Sincroniza quando a categoria prop muda (abrir modal de edição vs criação)
watch(() => props.category, (c) => {
  editingId.value = c?.category_id ?? null
  form.name = c?.name || ''
  form.description = c?.description || ''
})

const onSubmit = async () => {
  errors.name = ''
  if (!form.name.trim()) {
    errors.name = 'Nome é obrigatório'
    return
  }

  try {
    let saved: Category | null = null

    if (props.type === 'income') {
      if (editingId.value) {
        // Editar categoria de receita
        saved = await categoriesStore.updateIncomeCategory(editingId.value, {
          name: form.name || undefined,
          description: form.description || undefined
        })
      } else {
        // Criar categoria de receita
        saved = await categoriesStore.createIncomeCategory({
          name: form.name,
          description: form.description || undefined
        })
      }
    } else {
      if (editingId.value) {
        // Editar categoria de despesa
        saved = await categoriesStore.updateExpenseCategory(editingId.value, {
          name: form.name || undefined,
          description: form.description || undefined
        })
      } else {
        // Criar categoria de despesa
        saved = await categoriesStore.createExpenseCategory({
          name: form.name,
          description: form.description || undefined
        })
      }
    }

    if (saved) {
      success('Categoria salva com sucesso')
      emit('saved', saved)
      emit('update:isOpen', false)
    }
  } catch (err: any) {
    showError('Erro ao salvar categoria', err?.message)
  }
}
</script>