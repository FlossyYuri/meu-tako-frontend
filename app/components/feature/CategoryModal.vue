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

const form = reactive({
  name: props.category?.name || '',
  description: props.category?.description || ''
})

const errors = reactive({
  name: ''
})

const modalTitle = computed(() => {
  const action = props.category ? 'Editar' : 'Nova'
  const tipo = props.type === 'income' ? 'Categoria de Receita' : 'Categoria de Despesa'
  return `${action} ${tipo}`
})

watch(() => props.category, (c) => {
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
      if (props.category) {
        saved = await categoriesStore.updateIncomeCategory(props.category.category_id, {
          name: form.name || undefined,
          description: form.description || undefined
        })
      } else {
        saved = await categoriesStore.createIncomeCategory({
          name: form.name,
          description: form.description || undefined
        })
      }
    } else {
      if (props.category) {
        saved = await categoriesStore.updateExpenseCategory(props.category.category_id, {
          name: form.name || undefined,
          description: form.description || undefined
        })
      } else {
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