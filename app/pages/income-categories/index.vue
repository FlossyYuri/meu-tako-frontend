<template>
  <div class="space-y-6">
    <PageHeader title="Categorias de Receitas" subtitle="Gerencie categorias usadas nas suas receitas">
      <template #actions>
        <Button variant="primary" icon="lucide:plus" @click="openCreate">Nova Categoria</Button>
      </template>
    </PageHeader>

    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Categorias</h2>
        </div>
      </template>

      <div v-if="categoriesStore.isLoading" class="p-6">
        <LoadingSpinner text="Carregando categorias..." />
      </div>

      <div v-else-if="categoriesStore.incomeCategories.length === 0" class="p-6 text-center">
        <Icon name="lucide:tags" class="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500 dark:text-gray-400">Nenhuma categoria encontrada</p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="c in categoriesStore.incomeCategories" :key="c.category_id" class="p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: c.color || '#9ca3af' }" />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ c.name }}</p>
              <p v-if="c.description" class="text-sm text-gray-500 dark:text-gray-400">{{ c.description }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button size="sm" variant="outline" icon="lucide:edit" @click="openEdit(c)">Editar</Button>
            <Button size="sm" variant="error" icon="lucide:trash-2" @click="onDelete(c.category_id)">Excluir</Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Modal Categoria -->
    <Modal :isOpen="isOpen" :title="isEditing ? 'Editar Categoria' : 'Nova Categoria'" size="md" @update:isOpen="isOpen = $event">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <Input v-model="form.name" label="Nome" required :error="errors.name" />
        <Input v-model="form.description" label="Descrição" />
        <Input v-model="form.color" label="Cor (hex)" placeholder="#00FF00" />
        <Input v-model="form.icon" label="Ícone (emoji ou nome)" placeholder="💰" />
        <div class="flex justify-end gap-2 mt-2">
          <Button type="button" variant="outline" @click="isOpen = false">Cancelar</Button>
          <Button type="submit" variant="primary" :loading="categoriesStore.isLoading" :disabled="!form.name">
            {{ isEditing ? 'Salvar' : 'Criar' }}
          </Button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const categoriesStore = useCategoriesStore()
const { success, error: showError } = useNotifications()

const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  description: '',
  color: '',
  icon: ''
})

const errors = reactive({
  name: ''
})

const loadCategories = async () => {
  try {
    await categoriesStore.fetchIncomeCategories()
  } catch (err: any) {
    showError('Erro ao carregar categorias', err?.message)
  }
}

const openCreate = () => {
  isEditing.value = false
  editingId.value = null
  form.name = ''
  form.description = ''
  form.color = ''
  form.icon = ''
  isOpen.value = true
}

const openEdit = (c: import('~/types').Category) => {
  isEditing.value = true
  editingId.value = c.category_id
  form.name = c.name
  form.description = c.description || ''
  form.color = c.color || ''
  form.icon = c.icon || ''
  isOpen.value = true
}

const onSubmit = async () => {
  try {
    if (isEditing.value && editingId.value) {
      await categoriesStore.updateIncomeCategory(editingId.value, {
        name: form.name || undefined,
        description: form.description || undefined,
        color: form.color || undefined,
        icon: form.icon || undefined
      })
      success('Categoria atualizada')
    } else {
      await categoriesStore.createIncomeCategory({
        name: form.name,
        description: form.description || undefined,
        color: form.color || undefined,
        icon: form.icon || undefined
      })
      success('Categoria criada')
    }
    isOpen.value = false
  } catch (err: any) {
    showError('Erro ao salvar categoria', err?.message)
  }
}

const onDelete = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
  try {
    await categoriesStore.deleteIncomeCategory(id)
    success('Categoria excluída')
  } catch (err: any) {
    showError('Erro ao excluir categoria', err?.message)
  }
}

onMounted(loadCategories)
</script>