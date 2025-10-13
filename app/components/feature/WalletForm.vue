<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <Input
      v-model="localName"
      type="text"
      label="Nome da carteira"
      placeholder="Ex: Carteira Principal"
      :error="errorText"
      required
      autocomplete="off"
    />

    <div class="flex gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">
        Cancelar
      </Button>
      <Button type="submit" variant="primary" :loading="loading" :disabled="!canSubmit">
        {{ submitLabel }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
interface Props {
  walletName?: string
  loading?: boolean
  submitLabel?: string
}
const props = withDefaults(defineProps<Props>(), {
  walletName: '',
  loading: false,
  submitLabel: 'Salvar'
})

const emit = defineEmits<{
  submit: [name: string]
  cancel: []
}>()

const localName = ref(props.walletName)
const errorText = ref('')

watch(() => props.walletName, (v) => { localName.value = v || '' })

const canSubmit = computed(() => {
  const name = (localName.value || '').trim()
  return name.length >= 2 && name.length <= 50 && !errorText.value
})

watch(localName, () => { if (errorText.value) errorText.value = '' })

const validate = (): boolean => {
  const name = (localName.value || '').trim()
  errorText.value = ''
  if (!name) { errorText.value = 'Nome da carteira é obrigatório'; return false }
  if (name.length < 2) { errorText.value = 'Nome deve ter pelo menos 2 caracteres'; return false }
  if (name.length > 50) { errorText.value = 'Nome deve ter no máximo 50 caracteres'; return false }
  return true
}

const onSubmit = () => {
  if (!validate()) return
  emit('submit', localName.value.trim())
}
</script>