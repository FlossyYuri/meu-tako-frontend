<template>
  <Modal
    :is-open="isModalOpen"
    :on-close="closeModal"
    title="Verificação de Conta"
    size="md"
  >
    <div class="space-y-6">
      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button
            class="py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            :class="[
              activeTab === 'email'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
            @click="activeTab = 'email'"
          >
            <div class="flex items-center space-x-2">
              <Icon name="lucide:mail" class="w-4 h-4" />
              <span>Email</span>
            </div>
          </button>
          <button
            class="py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            :class="[
              activeTab === 'whatsapp'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
            @click="activeTab = 'whatsapp'"
          >
            <div class="flex items-center space-x-2">
              <Icon name="lucide:message-circle" class="w-4 h-4" />
              <span>WhatsApp</span>
            </div>
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="space-y-4">
        <!-- Instructions -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex">
            <Icon name="lucide:info" class="h-5 w-5 text-gray-400 mt-0.5" />
            <div class="ml-3">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                <span v-if="activeTab === 'email'">
                  Enviamos um código de 6 dígitos para seu email. Digite o
                  código abaixo para verificar sua conta.
                </span>
                <span v-else>
                  Enviamos um código de 6 dígitos para seu WhatsApp. Digite o
                  código abaixo para verificar sua conta.
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Verification Code Input -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Código de Verificação
          </label>
          <Input
            v-model="verificationCode"
            type="text"
            placeholder="000000"
            maxlength="6"
            class="text-center text-lg tracking-widest"
            :class="{ 'border-error-300 focus:border-error-500 focus:ring-error-500': !isCodeValid && verificationCode.length > 0 }"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Digite o código de 6 dígitos
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            :loading="isVerifying"
            :disabled="!isCodeValid"
            @click="handleVerify"
            class="flex-1"
          >
            Verificar
          </Button>
          <Button
            variant="outline"
            :loading="isSending"
            :disabled="!canResend"
            @click="resendCode"
            class="flex-1"
          >
            <span v-if="canResend">Reenviar Código</span>
            <span v-else>Reenviar em {{ formatCountdown(countdown) }}</span>
          </Button>
        </div>

        <!-- Send Code Button (if not sent yet) -->
        <div v-if="!canResend && countdown === 0" class="text-center">
          <Button
            variant="outline"
            :loading="isSending"
            @click="handleSendCode"
            class="w-full"
          >
            Enviar Código
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
const {
  isModalOpen,
  activeTab,
  verificationCode,
  isVerifying,
  isSending,
  countdown,
  isCodeValid,
  canResend,
  closeModal,
  handleSendCode,
  handleVerify,
  resendCode,
  formatCountdown
} = useVerification()

// Auto-send code when modal opens
watch(isModalOpen, (isOpen) => {
  if (isOpen && countdown.value === 0) {
    handleSendCode()
  }
})

// Clear code when tab changes
watch(activeTab, () => {
  verificationCode.value = ''
})
</script>
