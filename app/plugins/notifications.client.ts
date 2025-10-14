// Plugin de notificações usando vue-sonner
import { Toaster } from 'vue-sonner';

export default defineNuxtPlugin((nuxtApp) => {
  // Registrar o componente Toaster globalmente
  nuxtApp.vueApp.component('Toaster', Toaster);

  // Configurar tema reativo para o toast
  const themeStore = useThemeStore();

  // Inicializar o tema
  themeStore.initializeTheme();

  // Fornecer o tema reativo para uso global
  nuxtApp.provide(
    'toastTheme',
    computed(() => {
      return themeStore.isDarkMode ? 'dark' : 'light';
    })
  );
});
