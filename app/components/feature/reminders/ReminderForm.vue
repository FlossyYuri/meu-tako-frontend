<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div>
      <Input
        v-model="form.title"
        type="text"
        label="Título"
        placeholder="Ex.: Pagar conta de luz"
        :error="errors.title"
        required
      />
    </div>

    <div>
      <Input
        v-model="form.description"
        type="text"
        label="Descrição (opcional)"
        placeholder="Ex.: Lembrete para pagar a conta de luz que vence no dia 15"
      />
    </div>

    <div>
      <Input
        v-model="form.amount"
        type="number"
        label="Valor (opcional)"
        placeholder="0,00"
        :error="errors.amount"
        :step="0.01"
        :min="0"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Select
          v-model="form.priority"
          label="Prioridade"
          :options="priorityOptions"
          :error="errors.priority"
        />
      </div>
      <div>
        <Select
          v-model="form.recurrence"
          label="Recorrência"
          :options="recurrenceOptions"
          :error="errors.recurrence"
          required
        />
      </div>
    </div>

    <div>
      <label class="label">Data e Hora Agendada</label>
      <input
        v-model="form.scheduledFor"
        type="datetime-local"
        :class="inputClasses"
        :error="errors.scheduledFor"
        required
      />
      <p
        v-if="errors.scheduledFor"
        class="text-sm text-error-600 dark:text-error-400 mt-1"
      >
        {{ errors.scheduledFor }}
      </p>
      <p
        v-else-if="isPastDate"
        class="text-sm text-warning-600 dark:text-warning-400 mt-1"
      >
        ⚠️ A data selecionada está no passado
      </p>
    </div>

    <div>
      <label class="label">Canais de Notificação</label>
      <div class="space-y-2">
        <label
          v-for="channel in notificationChannelOptions"
          :key="channel.value"
          class="flex items-center space-x-2 cursor-pointer"
        >
          <input
            v-model="form.notificationChannels"
            :value="channel.value"
            type="checkbox"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <Icon :name="channel.icon" class="w-4 h-4 text-gray-500" />
          <span
            class="text-sm text-gray-700 dark:text-gray-300"
            >{{ channel.label }}</span
          >
        </label>
      </div>
      <p
        v-if="errors.notificationChannels"
        class="text-sm text-error-600 dark:text-error-400 mt-1"
      >
        {{ errors.notificationChannels }}
      </p>
    </div>

    <!-- Status (apenas em edição) -->
    <div v-if="mode === 'edit'">
      <Select
        v-model="form.status"
        label="Status"
        :options="statusOptions"
        :error="errors.status"
      />
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
        :loading="remindersStore.isLoading"
        :disabled="!isValid"
      >
        {{ submitLabel }}
      </Button>
    </div>

    <div v-if="remindersStore.error" class="text-center">
      <p class="text-sm text-error-600 dark:text-error-400">
        {{ remindersStore.error }}
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Reminder, ReminderPriority, ReminderRecurrence, ReminderStatus, NotificationChannel } from '~/types';

const props = withDefaults(defineProps<{
  mode: 'create' | 'edit'
  reminder?: Reminder | null
  showCancel?: boolean
}>(), {
  mode: 'create',
  reminder: null,
  showCancel: false
})

const emit = defineEmits<{
  saved: [reminder: Reminder]
  cancel: []
}>()

const remindersStore = useRemindersStore()
const { success, error: showError } = useNotifications()

// Opções para os selects
const priorityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' }
]

const recurrenceOptions = [
  { value: 'once', label: 'Uma vez' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' }
]

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' }
]

const notificationChannelOptions = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'lucide:message-circle' },
  { value: 'email', label: 'E-mail', icon: 'lucide:mail' },
  { value: 'push', label: 'Push', icon: 'lucide:bell' }
]

// Função para converter data para formato do input datetime-local
const formatDateForInput = (date: string | undefined): string => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  // Converter para formato YYYY-MM-DDTHH:MM
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Função para converter data do input para ISO 8601
const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString()
}

const form = reactive({
  title: props.reminder?.title || '',
  description: props.reminder?.description || '',
  amount: props.reminder?.amount ? String(props.reminder.amount) : '',
  priority: props.reminder?.priority || 'medium',
  recurrence: props.reminder?.recurrence || 'once',
  scheduledFor: formatDateForInput(props.reminder?.scheduledFor) || '',
  notificationChannels: props.reminder?.notificationChannels || ['push'],
  status: props.reminder?.status || 'active'
})

watch(() => props.reminder, (r) => {
  if (!r) return
  form.title = r.title
  form.description = r.description || ''
  form.amount = r.amount ? String(r.amount) : ''
  form.priority = r.priority
  form.recurrence = r.recurrence
  form.scheduledFor = formatDateForInput(r.scheduledFor)
  form.notificationChannels = [...r.notificationChannels]
  form.status = r.status
})

const errors = reactive({
  title: '',
  amount: '',
  priority: '',
  recurrence: '',
  scheduledFor: '',
  notificationChannels: '',
  status: ''
})

const isValid = computed(() => {
  return !!form.title.trim() &&
    !!form.recurrence &&
    !!form.scheduledFor &&
    form.notificationChannels.length > 0 &&
    !errors.title &&
    !errors.amount &&
    !errors.priority &&
    !errors.recurrence &&
    !errors.scheduledFor &&
    !errors.notificationChannels &&
    !errors.status
})

const isPastDate = computed(() => {
  if (!form.scheduledFor) return false
  const selectedDate = new Date(form.scheduledFor)
  const now = new Date()
  return selectedDate < now
})

const submitLabel = computed(() => props.mode === 'create' ? 'Criar Lembrete' : 'Salvar Alterações')

const inputClasses = computed(() => {
  const baseClasses = 'block w-full rounded-md border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
  const stateClasses = errors.scheduledFor
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:focus:border-primary-400'
  const paddingClasses = 'px-3 py-1.5'
  const backgroundClasses = 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white'

  return [baseClasses, stateClasses, paddingClasses, backgroundClasses].join(' ')
})

const validate = () => {
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))
  let ok = true

  if (!form.title.trim()) {
    errors.title = 'Título é obrigatório'
    ok = false
  }

  if (form.amount && (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) < 0)) {
    errors.amount = 'Valor deve ser maior ou igual a zero'
    ok = false
  }

  if (!form.recurrence) {
    errors.recurrence = 'Recorrência é obrigatória'
    ok = false
  }

  if (!form.scheduledFor) {
    errors.scheduledFor = 'Data e hora são obrigatórias'
    ok = false
  }

  if (form.notificationChannels.length === 0) {
    errors.notificationChannels = 'Selecione pelo menos um canal de notificação'
    ok = false
  }

  return ok
}

const onSubmit = async () => {
  if (!validate()) return

  try {
    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      amount: form.amount ? parseFloat(form.amount) : undefined,
      priority: form.priority as ReminderPriority,
      recurrence: form.recurrence as ReminderRecurrence,
      scheduledFor: formatDateForAPI(form.scheduledFor),
      notificationChannels: form.notificationChannels as NotificationChannel[],
      ...(props.mode === 'edit' && { status: form.status as ReminderStatus })
    }

    if (props.mode === 'create') {
      const created = await remindersStore.createReminder(payload)
      success('Lembrete criado com sucesso!')
      emit('saved', created)
    } else if (props.reminder) {
      const updated = await remindersStore.updateReminder(props.reminder.id, payload)
      success('Lembrete atualizado com sucesso')
      emit('saved', updated)
    }
  } catch (err: any) {
    showError('Erro ao salvar lembrete', err?.message)
  }
}

// Limpar mensagens de erro enquanto digita
watch(() => form.title, () => { if (errors.title) errors.title = '' })
watch(() => form.amount, () => { if (errors.amount) errors.amount = '' })
watch(() => form.priority, () => { if (errors.priority) errors.priority = '' })
watch(() => form.recurrence, () => { if (errors.recurrence) errors.recurrence = '' })
watch(() => form.scheduledFor, () => { if (errors.scheduledFor) errors.scheduledFor = '' })
watch(() => form.notificationChannels, () => { if (errors.notificationChannels) errors.notificationChannels = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
</script>
