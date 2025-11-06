<template>
  <VerificationBanner
    type="whatsapp"
    :is-visible="needsWhatsAppVerification"
    :dismissible="true"
    :code-sent="whatsappCodeSent"
    :code="whatsappCode"
    :is-sending="whatsappIsSending"
    :is-verifying="whatsappIsVerifying"
    :countdown="whatsappCountdown"
    :can-resend="whatsappCanResend"
    @update:code="handleCodeUpdate"
    @send-code="sendWhatsAppCode"
    @verify="verifyWhatsAppCode"
    @resend="resendWhatsAppCode"
    @dismiss="handleDismiss"
  />
</template>

<script setup lang="ts">
import VerificationBanner from '~/components/ui/VerificationBanner.vue'

const {
  needsWhatsAppVerification,
  whatsappCodeSent,
  whatsappCode,
  whatsappIsSending,
  whatsappIsVerifying,
  whatsappCountdown,
  whatsappCanResend,
  sendWhatsAppCode,
  verifyWhatsAppCode,
  resendWhatsAppCode,
} = useVerification()

const handleCodeUpdate = (value: string) => {
  whatsappCode.value = value
}

const handleDismiss = () => {
  // Optional: Store dismissal in localStorage to not show again for X hours
  // For now, just emit dismiss event
}
</script>

