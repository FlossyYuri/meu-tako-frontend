export const useVerification = () => {
  const authStore = useAuthStore();
  const { success, error: showError } = useNotifications();

  // State
  const isModalOpen = ref(false);
  const activeTab = ref<'email' | 'whatsapp'>('email');
  const verificationCode = ref('');
  const isVerifying = ref(false);
  const isSending = ref(false);
  const countdown = ref(0);
  const countdownInterval = ref<NodeJS.Timeout | null>(null);

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

  // Cleanup on unmount
  onUnmounted(() => {
    stopCountdown();
  });

  return {
    // State
    isModalOpen,
    activeTab,
    verificationCode,
    isVerifying,
    isSending,
    countdown,
    user,

    // Computed
    needsEmailVerification,
    needsWhatsAppVerification,
    needsAnyVerification,
    isCodeValid,
    canResend,

    // Methods
    openModal,
    closeModal,
    handleSendCode,
    handleVerify,
    resendCode,
    formatCountdown,
  };
};
