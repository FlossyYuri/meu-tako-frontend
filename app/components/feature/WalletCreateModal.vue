<template>
  <Modal
    :is-open="isOpen"
    title="Nova Carteira"
    size="md"
    @update:is-open="$emit('update:isOpen', $event)"
    @close="$emit('close')"
  >
    <WalletForm
      submit-label="Criar Carteira"
      :loading="loading"
      @cancel="$emit('close')"
      @submit="onSubmit"
    />

    <template #footer>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Você poderá definir esta carteira como padrão depois de criada.
      </p>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import WalletForm from '~/components/feature/WalletForm.vue'

interface Props {
  isOpen: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  close: []
  submit: [name: string]
}>()

const onSubmit = (name: string) => {
  emit('submit', name)
}
</script>
