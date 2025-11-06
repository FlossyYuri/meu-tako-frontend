export const useVerification = () => {
  const authStore = useAuthStore();
  const { success, error: showError } = useNotifications();

  // Modal State
  const isModalOpen = ref(false);
  const activeTab = ref<'email' | 'whatsapp'>('email');
  const verificationCode = ref('');
  const isVerifying = ref(false);
  const isSending = ref(false);
  const countdown = ref(0);
  const countdownInterval = ref<NodeJS.Timeout | null>(null);

  // Banner State (separate from modal)
  const emailCodeSent = ref(false);
  const whatsappCodeSent = ref(false);
  const emailCode = ref('');
  const whatsappCode = ref('');
  const emailIsSending = ref(false);
  const whatsappIsSending = ref(false);
  const emailIsVerifying = ref(false);
  const whatsappIsVerifying = ref(false);
  const emailCountdown = ref(0);
  const whatsappCountdown = ref(0);
  const emailCountdownInterval = ref<NodeJS.Timeout | null>(null);
  const whatsappCountdownInterval = ref<NodeJS.Timeout | null>(null);

  // Computed
  const user = computed(() => authStore.user);
  const needsEmailVerification = computed(
    () => user.value && !user.value.email_verified
  );
  const needsWhatsAppVerification = computed(
    () => user.value && user.value.whatsapp && !user.value.whatsapp_verified
  );
  const needsAnyVerification = computed(
    () => needsEmailVerification.value || needsWhatsAppVerification.value
  );
  const isCodeValid = computed(
    () =>
      verificationCode.value.length === 6 &&
      /^\d{6}$/.test(verificationCode.value)
  );
  const canResend = computed(() => countdown.value === 0);

  // Methods
  const openModal = (tab: 'email' | 'whatsapp' = 'email') => {
    activeTab.value = tab;
    isModalOpen.value = true;
    verificationCode.value = '';
  };

  const closeModal = () => {
    isModalOpen.value = false;
    verificationCode.value = '';
    stopCountdown();
  };

  const startCountdown = () => {
    countdown.value = 600; // 10 minutes in seconds
    countdownInterval.value = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        stopCountdown();
      }
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
      countdownInterval.value = null;
    }
    countdown.value = 0;
  };

  // Banner-specific countdown functions
  const startEmailCountdown = () => {
    emailCountdown.value = 600; // 10 minutes in seconds
    emailCountdownInterval.value = setInterval(() => {
      emailCountdown.value--;
      if (emailCountdown.value <= 0) {
        stopEmailCountdown();
      }
    }, 1000);
  };

  const stopEmailCountdown = () => {
    if (emailCountdownInterval.value) {
      clearInterval(emailCountdownInterval.value);
      emailCountdownInterval.value = null;
    }
    emailCountdown.value = 0;
  };

  const startWhatsAppCountdown = () => {
    whatsappCountdown.value = 600; // 10 minutes in seconds
    whatsappCountdownInterval.value = setInterval(() => {
      whatsappCountdown.value--;
      if (whatsappCountdown.value <= 0) {
        stopWhatsAppCountdown();
      }
    }, 1000);
  };

  const stopWhatsAppCountdown = () => {
    if (whatsappCountdownInterval.value) {
      clearInterval(whatsappCountdownInterval.value);
      whatsappCountdownInterval.value = null;
    }
    whatsappCountdown.value = 0;
  };

  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const sendEmailVerification = async () => {
    try {
      isSending.value = true;
      await authStore.sendEmailVerification();
      success('Código de verificação enviado para seu email!');
      startCountdown();
    } catch (err: any) {
      showError('Erro ao enviar código', err.message || 'Tente novamente');
    } finally {
      isSending.value = false;
    }
  };

  const sendWhatsAppVerification = async () => {
    try {
      isSending.value = true;
      await authStore.sendWhatsAppVerification();
      success('Código de verificação enviado para seu WhatsApp!');
      startCountdown();
    } catch (err: any) {
      showError('Erro ao enviar código', err.message || 'Tente novamente');
    } finally {
      isSending.value = false;
    }
  };

  const verifyEmail = async () => {
    try {
      isVerifying.value = true;
      await authStore.verifyEmail(verificationCode.value);
      success('Email verificado com sucesso!');
      closeModal();
    } catch (err: any) {
      showError('Erro ao verificar email', err.message || 'Código inválido');
    } finally {
      isVerifying.value = false;
    }
  };

  const verifyWhatsApp = async () => {
    try {
      isVerifying.value = true;
      await authStore.verifyWhatsApp(verificationCode.value);
      success('WhatsApp verificado com sucesso!');
      closeModal();
    } catch (err: any) {
      showError('Erro ao verificar WhatsApp', err.message || 'Código inválido');
    } finally {
      isVerifying.value = false;
    }
  };

  const handleSendCode = async () => {
    if (activeTab.value === 'email') {
      await sendEmailVerification();
    } else {
      await sendWhatsAppVerification();
    }
  };

  const handleVerify = async () => {
    if (activeTab.value === 'email') {
      await verifyEmail();
    } else {
      await verifyWhatsApp();
    }
  };

  const resendCode = async () => {
    await handleSendCode();
  };

  // Banner-specific methods
  const sendEmailCode = async () => {
    try {
      emailIsSending.value = true;
      await authStore.sendEmailVerification();
      success('Código de verificação enviado para seu email!');
      emailCodeSent.value = true;
      startEmailCountdown();
    } catch (err: any) {
      showError('Erro ao enviar código', err.message || 'Tente novamente');
    } finally {
      emailIsSending.value = false;
    }
  };

  const sendWhatsAppCode = async () => {
    try {
      whatsappIsSending.value = true;
      await authStore.sendWhatsAppVerification();
      success('Código de verificação enviado para seu WhatsApp!');
      whatsappCodeSent.value = true;
      startWhatsAppCountdown();
    } catch (err: any) {
      showError('Erro ao enviar código', err.message || 'Tente novamente');
    } finally {
      whatsappIsSending.value = false;
    }
  };

  const verifyEmailCode = async () => {
    try {
      emailIsVerifying.value = true;
      await authStore.verifyEmail(emailCode.value);
      success('Email verificado com sucesso!');
      emailCodeSent.value = false;
      emailCode.value = '';
      stopEmailCountdown();
      // User data is already refreshed in verifyEmail method
    } catch (err: any) {
      showError('Erro ao verificar email', err.message || 'Código inválido');
    } finally {
      emailIsVerifying.value = false;
    }
  };

  const verifyWhatsAppCode = async () => {
    try {
      whatsappIsVerifying.value = true;
      await authStore.verifyWhatsApp(whatsappCode.value);
      success('WhatsApp verificado com sucesso!');
      whatsappCodeSent.value = false;
      whatsappCode.value = '';
      stopWhatsAppCountdown();
      // User data is already refreshed in verifyWhatsApp method
    } catch (err: any) {
      showError('Erro ao verificar WhatsApp', err.message || 'Código inválido');
    } finally {
      whatsappIsVerifying.value = false;
    }
  };

  const resendEmailCode = async () => {
    await sendEmailCode();
  };

  const resendWhatsAppCode = async () => {
    await sendWhatsAppCode();
  };

  const emailCanResend = computed(() => emailCountdown.value === 0);
  const whatsappCanResend = computed(() => whatsappCountdown.value === 0);

  const emailCodeValid = computed(() => {
    return emailCode.value.length === 6 && /^\d{6}$/.test(emailCode.value);
  });

  const whatsappCodeValid = computed(() => {
    return whatsappCode.value.length === 6 && /^\d{6}$/.test(whatsappCode.value);
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stopCountdown();
    stopEmailCountdown();
    stopWhatsAppCountdown();
  });

  return {
    // Modal State
    isModalOpen,
    activeTab,
    verificationCode,
    isVerifying,
    isSending,
    countdown,
    user,

    // Banner State
    emailCodeSent,
    whatsappCodeSent,
    emailCode,
    whatsappCode,
    emailIsSending,
    whatsappIsSending,
    emailIsVerifying,
    whatsappIsVerifying,
    emailCountdown,
    whatsappCountdown,
    emailCanResend,
    whatsappCanResend,
    emailCodeValid,
    whatsappCodeValid,

    // Computed
    needsEmailVerification,
    needsWhatsAppVerification,
    needsAnyVerification,
    isCodeValid,
    canResend,

    // Modal Methods
    openModal,
    closeModal,
    handleSendCode,
    handleVerify,
    resendCode,
    formatCountdown,

    // Banner Methods
    sendEmailCode,
    sendWhatsAppCode,
    verifyEmailCode,
    verifyWhatsAppCode,
    resendEmailCode,
    resendWhatsAppCode,
  };
};
