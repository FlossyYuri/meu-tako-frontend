<template>
  <VerificationBanner
    type="email"
    :is-visible="needsEmailVerification"
    :dismissible="true"
    :code-sent="emailCodeSent"
    :code="emailCode"
    :is-sending="emailIsSending"
    :is-verifying="emailIsVerifying"
    :countdown="emailCountdown"
    :can-resend="emailCanResend"
    @update:code="handleCodeUpdate"
    @send-code="sendEmailCode"
    @verify="verifyEmailCode"
    @resend="resendEmailCode"
    @dismiss="handleDismiss"
  />
</template>

<script setup lang="ts">
import VerificationBanner from '~/components/ui/VerificationBanner.vue'

const {
  needsEmailVerification,
  emailCodeSent,
  emailCode,
  emailIsSending,
  emailIsVerifying,
  emailCountdown,
  emailCanResend,
  sendEmailCode,
  verifyEmailCode,
  resendEmailCode,
} = useVerification()

const handleCodeUpdate = (value: string) => {
  emailCode.value = value
}

const handleDismiss = () => {
  // Optional: Store dismissal in localStorage to not show again for X hours
  // For now, just emit dismiss event
}
</script>

