<template>
  <Modal
    :isOpen="isOpen"
    :title="modalTitle"
    size="md"
    @update:isOpen="emit('update:isOpen', $event)"
  >
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          v-model="form.name"
          label="Nome"
          required
          :error="errors.name"
        />
        <Input
          v-model="form.color"
          label="Cor (hex)"
          placeholder="#3B82F6"
        />
      </div>

      <Input
        v-model="form.icon"
        label="Ícone (emoji ou nome)"
        placeholder="💰 ou lucide:wallet"
      />

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
  description: props.category?.description || '',
  color: props.category?.color || '',
  icon: props.category?.icon || ''
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
  form.color = c?.color || ''
  form.icon = c?.icon || ''
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
          description: form.description || undefined,
          color: form.color || undefined,
          icon: form.icon || undefined
        })
      } else {
        saved = await categoriesStore.createIncomeCategory({
          name: form.name,
          description: form.description || undefined,
          color: form.color || undefined,
          icon: form.icon || undefined
        })
      }
    } else {
      if (props.category) {
        saved = await categoriesStore.updateExpenseCategory(props.category.category_id, {
          name: form.name || undefined,
          description: form.description || undefined,
          color: form.color || undefined,
          icon: form.icon || undefined
        })
      } else {
        saved = await categoriesStore.createExpenseCategory({
          name: form.name,
          description: form.description || undefined,
          color: form.color || undefined,
          icon: form.icon || undefined
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