<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-[-10px]"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-[-10px]"
  >
    <div
      v-if="isVisible"
      class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-4 rounded-r-md shadow-sm"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <Icon
            :name="type === 'email' ? 'lucide:mail' : 'lucide:message-circle'"
            class="w-5 h-5 text-yellow-600 dark:text-yellow-400"
          />
        </div>

        <div class="ml-3 flex-1">
          <div class="flex items-center justify-between">
            <h3
              class="text-sm font-medium text-yellow-800 dark:text-yellow-200"
            >
              {{ title }}
            </h3>
            <button
              v-if="dismissible"
              type="button"
              class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
              @click="$emit('dismiss')"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>

          <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            {{ description }}
          </p>

          <!-- Initial State: Send Code Button -->
          <div v-if="!codeSent" class="mt-4">
            <Button
              :loading="isSending"
              :disabled="isSending"
              size="sm"
              variant="primary"
              @click="handleSendCode"
            >
              <Icon
                v-if="!isSending"
                :name="type === 'email' ? 'lucide:mail' : 'lucide:send'"
                class="w-4 h-4 mr-2"
              />
              {{ isSending ? 'Enviando...' : 'Enviar código de verificação' }}
            </Button>
          </div>

          <!-- Code Sent State: Input and Verify -->
          <div v-else class="mt-4 space-y-3">
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="flex-1">
                <Input
                  :model-value="code"
                  type="text"
                  placeholder="Digite o código de 6 dígitos"
                  :maxlength="6"
                  class="text-center text-lg tracking-widest font-mono"
                  @update:model-value="handleCodeInput"
                />
              </div>
              <Button
                :loading="isVerifying"
                :disabled="!isCodeValid || isVerifying"
                size="md"
                variant="primary"
                class="sm:w-auto"
                @click="handleVerify"
              >
                <Icon
                  v-if="!isVerifying"
                  name="lucide:check"
                  class="w-4 h-4 mr-2"
                />
                {{ isVerifying ? 'Verificando...' : 'Verificar' }}
              </Button>
            </div>

            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span
                  v-if="countdown > 0"
                  class="text-yellow-600 dark:text-yellow-400"
                >
                  Código expira em: {{ formatCountdown(countdown) }}
                </span>
                <span
                  v-else
                  class="text-yellow-600 dark:text-yellow-400"
                >
                  Código expirado
                </span>
              </div>
              <Button
                :disabled="!canResend || isSending"
                size="sm"
                variant="ghost"
                @click="handleResend"
              >
                <Icon name="lucide:refresh-cw" class="w-3 h-3 mr-1" />
                {{ isSending ? 'Enviando...' : 'Reenviar código' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  type: 'email' | 'whatsapp'
  isVisible: boolean
  dismissible?: boolean
  codeSent: boolean
  code: string
  isSending: boolean
  isVerifying: boolean
  countdown: number
  canResend: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true,
  codeSent: false,
  code: '',
  isSending: false,
  isVerifying: false,
  countdown: 0,
  canResend: false,
})

const emit = defineEmits<{
  'update:code': [value: string]
  sendCode: []
  verify: []
  resend: []
  dismiss: []
}>()

const title = computed(() => {
  return props.type === 'email'
    ? 'Verifique seu email'
    : 'Verifique seu WhatsApp'
})

const description = computed(() => {
  if (!props.codeSent) {
    return props.type === 'email'
      ? 'Para receber notificações por email, verifique seu endereço de email.'
      : 'Para receber notificações por WhatsApp, verifique seu número de WhatsApp.'
  }
  return props.type === 'email'
    ? 'Digite o código de 6 dígitos que enviamos para seu email.'
    : 'Digite o código de 6 dígitos que enviamos para seu WhatsApp.'
})

const isCodeValid = computed(() => {
  return props.code.length === 6 && /^\d{6}$/.test(props.code)
})

const handleCodeInput = (value: string | number) => {
  const stringValue = typeof value === 'number' ? value.toString() : value
  const cleanedValue = stringValue.replace(/\D/g, '').slice(0, 6)
  emit('update:code', cleanedValue)
}

const handleSendCode = () => {
  emit('sendCode')
}

const handleVerify = () => {
  if (isCodeValid.value) {
    emit('verify')
  }
}

const handleResend = () => {
  if (props.canResend) {
    emit('resend')
  }
}

const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

