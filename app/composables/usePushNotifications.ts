import { ref, computed } from 'vue';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const usePushNotifications = () => {
  const isSupported = ref(false);
  const permission = ref<NotificationPermission>({
    granted: false,
    denied: false,
    default: false,
  });
  const isRegistered = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Verificar se o browser suporta push notifications
  const checkSupport = () => {
    isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window;
    return isSupported.value;
  };

  // Verificar permissão atual
  const checkPermission = () => {
    if (!isSupported.value) return;

    const currentPermission = Notification.permission;
    permission.value = {
      granted: currentPermission === 'granted',
      denied: currentPermission === 'denied',
      default: currentPermission === 'default',
    };
  };

  // Solicitar permissão para notificações
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      error.value = 'Push notifications não são suportadas neste browser';
      return false;
    }

    try {
      isLoading.value = true;
      error.value = null;

      const result = await Notification.requestPermission();
      checkPermission();

      return result === 'granted';
    } catch (err) {
      error.value = 'Erro ao solicitar permissão para notificações';
      console.error('Erro ao solicitar permissão:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Converter ArrayBuffer para base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Registrar subscription no servidor
  const registerSubscription = async (
    subscription: PushSubscription
  ): Promise<boolean> => {
    console.log('🚀 [PUSH] Iniciando registro de subscription...');

    try {
      isLoading.value = true;
      error.value = null;

      // Obter token de autorização do localStorage
      const token = localStorage.getItem('auth_token');
      console.log('🔑 [PUSH] Token encontrado:', token ? 'Sim' : 'Não');

      if (!token) {
        console.error('❌ [PUSH] Token de autorização não encontrado');
        error.value = 'Token de autorização não encontrado';
        return false;
      }

      // Converter subscription para o formato esperado pelo servidor
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');

      console.log('🔐 [PUSH] Chaves de criptografia:', {
        p256dh: p256dhKey ? 'Presente' : 'Ausente',
        auth: authKey ? 'Presente' : 'Ausente',
      });

      if (!p256dhKey || !authKey) {
        console.error('❌ [PUSH] Chaves de criptografia não encontradas');
        error.value = 'Chaves de criptografia não encontradas na subscription';
        return false;
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(p256dhKey),
          auth: arrayBufferToBase64(authKey),
        },
      };

      console.log('📤 [PUSH] Enviando dados para API:', {
        endpoint: subscriptionData.endpoint,
        keysLength: {
          p256dh: subscriptionData.keys.p256dh.length,
          auth: subscriptionData.keys.auth.length,
        },
      });

      // Obter base URL da configuração
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBase;

      console.log('🌐 [PUSH] Usando API Base:', apiBase);
      console.log(
        '🔗 [PUSH] Endpoint completo:',
        `${apiBase}/users/push-subscription`
      );

      // Enviar para o servidor
      const response = await fetch(`${apiBase}/users/push-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      console.log('📡 [PUSH] Resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [PUSH] Erro na API:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        error.value =
          errorData.message ||
          `Erro ${response.status}: ${response.statusText}`;
        return false;
      }

      const responseData = await response.json().catch(() => ({}));
      console.log(
        '✅ [PUSH] Subscription registrada com sucesso!',
        responseData
      );

      isRegistered.value = true;
      return true;
    } catch (err) {
      console.error('❌ [PUSH] Erro ao registrar subscription:', err);
      error.value = 'Erro ao registrar subscription no servidor';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Registrar para push notifications
  const registerForPushNotifications = async (): Promise<boolean> => {
    console.log('🎯 [PUSH] Iniciando processo de registro completo...');

    if (!isSupported.value) {
      console.error('❌ [PUSH] Browser não suporta push notifications');
      error.value = 'Push notifications não são suportadas neste browser';
      return false;
    }

    try {
      // 1. Solicitar permissão
      console.log('🔐 [PUSH] Solicitando permissão...');
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.error('❌ [PUSH] Permissão negada pelo usuário');
        error.value = 'Permissão para notificações negada';
        return false;
      }
      console.log('✅ [PUSH] Permissão concedida');

      // 2. Registrar service worker
      console.log('⚙️ [PUSH] Registrando service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ [PUSH] Service Worker registrado:', registration);

      // 3. Aguardar service worker estar pronto
      console.log('⏳ [PUSH] Aguardando service worker estar pronto...');
      await navigator.serviceWorker.ready;
      console.log('✅ [PUSH] Service Worker pronto');

      // 4. Obter subscription
      console.log('🔑 [PUSH] Obtendo VAPID key...');
      const vapidKey = useRuntimeConfig().public.vapidPublicKey;
      if (!vapidKey) {
        console.error('❌ [PUSH] VAPID key não configurada');
        throw new Error('VAPID public key não configurada');
      }
      console.log('✅ [PUSH] VAPID key encontrada');

      console.log('📝 [PUSH] Criando push subscription...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      console.log('✅ [PUSH] Push subscription criada:', {
        endpoint: subscription.endpoint,
        hasKeys:
          !!subscription.getKey('p256dh') && !!subscription.getKey('auth'),
      });

      // 5. Registrar no servidor
      console.log('🌐 [PUSH] Registrando no servidor...');
      const success = await registerSubscription(subscription);

      if (success) {
        console.log('🎉 [PUSH] Registro completo realizado com sucesso!');
      } else {
        console.error('❌ [PUSH] Falha no registro no servidor');
      }

      return success;
    } catch (err) {
      console.error('❌ [PUSH] Erro no processo de registro:', err);
      error.value = 'Erro ao registrar push notifications';
      return false;
    }
  };

  // Verificar se já está registrado
  const checkExistingSubscription = async (): Promise<boolean> => {
    if (!isSupported.value) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        isRegistered.value = true;
        return true;
      }

      return false;
    } catch (err) {
      console.error('Erro ao verificar subscription existente:', err);
      return false;
    }
  };

  // Cancelar registro
  const unsubscribe = async (): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        isRegistered.value = false;
        return true;
      }

      return false;
    } catch (err) {
      error.value = 'Erro ao cancelar subscription';
      console.error('Erro ao cancelar subscription:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Computed properties
  const canRegister = computed(
    () => isSupported.value && permission.value.granted && !isRegistered.value
  );

  const canUnsubscribe = computed(
    () => isSupported.value && isRegistered.value
  );

  const status = computed(() => {
    if (!isSupported.value) return 'not-supported';
    if (permission.value.denied) return 'denied';
    if (permission.value.default) return 'default';
    if (isRegistered.value) return 'registered';
    return 'ready';
  });

  return {
    // State
    isSupported: readonly(isSupported),
    permission: readonly(permission),
    isRegistered: readonly(isRegistered),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    canRegister,
    canUnsubscribe,
    status,

    // Methods
    checkSupport,
    checkPermission,
    requestPermission,
    registerForPushNotifications,
    checkExistingSubscription,
    unsubscribe,
  };
};
