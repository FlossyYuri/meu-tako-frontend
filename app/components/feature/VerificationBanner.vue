<template>
  <div
    v-if="needsAnyVerification && !isBannerDismissed"
    class="bg-warning-50 dark:bg-warning-900 border-l-4 border-warning-400 p-4"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <Icon name="lucide:shield-alert" class="h-5 w-5 text-warning-400" />
      </div>
      <div class="ml-3 flex-1">
        <div class="flex items-start justify-between">
          <div>
            <h3
              class="text-sm font-medium text-warning-800 dark:text-warning-200"
            >
              Verificação Necessária
            </h3>
            <div class="mt-1 text-sm text-warning-700 dark:text-warning-300">
              <p v-if="needsEmailVerification && needsWhatsAppVerification">
                Verifique seu email e WhatsApp para acessar todas as
                funcionalidades.
              </p>
              <p v-else-if="needsEmailVerification">
                Verifique seu email para acessar todas as funcionalidades.
              </p>
              <p v-else-if="needsWhatsAppVerification">
                Verifique seu WhatsApp para acessar todas as funcionalidades.
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="sm" @click="openVerificationModal">
              Verificar
            </Button>
            <button
              @click="dismissBanner"
              class="text-warning-400 hover:text-warning-600 dark:text-warning-300 dark:hover:text-warning-100"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  needsAnyVerification,
  needsEmailVerification,
  needsWhatsAppVerification,
  openModal
} = useVerification()

// Banner dismissal state
const isBannerDismissed = ref(false)

// Check if banner was dismissed in this session
onMounted(() => {
  if (import.meta.client) {
    const dismissed = localStorage.getItem('verification_banner_dismissed')
    if (dismissed) {
      const dismissTime = parseInt(dismissed)
      const now = Date.now()
      // Show banner again after 24 hours
      if (now - dismissTime < 24 * 60 * 60 * 1000) {
        isBannerDismissed.value = true
      } else {
        localStorage.removeItem('verification_banner_dismissed')
      }
    }
  }
})

const openVerificationModal = () => {
  if (needsEmailVerification.value) {
    openModal('email')
  } else if (needsWhatsAppVerification.value) {
    openModal('whatsapp')
  }
}

const dismissBanner = () => {
  isBannerDismissed.value = true
  if (import.meta.client) {
    localStorage.setItem('verification_banner_dismissed', Date.now().toString())
  }
}
</script>
