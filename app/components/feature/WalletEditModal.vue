<template>
  <Modal
    :is-open="isOpen"
    title="Editar Carteira"
    size="md"
    @update:is-open="$emit('update:isOpen', $event)"
    @close="$emit('close')"
  >
    <WalletForm
      :wallet-name="walletName"
      submit-label="Salvar Alterações"
      :loading="loading"
      @cancel="$emit('close')"
      @submit="onSubmit"
    />

    <template #footer>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        ID: <span class="font-mono">{{ walletId }}</span>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import WalletForm from '~/components/feature/WalletForm.vue'

interface Props {
  isOpen: boolean
  walletId: string
  walletName: string
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
