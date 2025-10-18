// Service Worker para Push Notifications
const CACHE_NAME = 'meu-tako-sw-v1';

// Evento de instalação
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Evento de ativação
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Evento para receber push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification recebida:', event);

  let notificationData = {
    title: 'Meu Tako',
    body: 'Você tem uma nova notificação',
    icon: '/icons/192-192.png',
    badge: '/icons/48-48.png',
    tag: 'meu-tako-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  // Se há dados no push, usar eles
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (e) {
      console.error('Erro ao processar dados do push:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Evento para cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Abrir ou focar na janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Se já há uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      // Se não há janela aberta, abrir uma nova
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Evento para fechar notificações
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event);
});
