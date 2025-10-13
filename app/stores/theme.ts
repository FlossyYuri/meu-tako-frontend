import { defineStore } from 'pinia';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const useThemeStore = defineStore('theme', () => {
  // Estado
  const mode = ref<ThemeMode>('auto');
  const isDark = ref(false);

  // Getters
  const currentMode = computed(() => mode.value);
  const isDarkMode = computed(() => isDark.value);

  // Actions
  const setTheme = (newMode: ThemeMode) => {
    mode.value = newMode;
    updateTheme();
    saveToLocalStorage();
  };

  const toggleTheme = () => {
    const newMode = isDark.value ? 'light' : 'dark';
    setTheme(newMode);
  };

  const updateTheme = () => {
    if (process.client) {
      const html = document.documentElement;

      if (mode.value === 'dark') {
        html.classList.add('dark');
        isDark.value = true;
      } else if (mode.value === 'light') {
        html.classList.remove('dark');
        isDark.value = false;
      } else {
        // Auto mode - detecta preferência do sistema
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        if (prefersDark) {
          html.classList.add('dark');
          isDark.value = true;
        } else {
          html.classList.remove('dark');
          isDark.value = false;
        }
      }
    }
  };

  const saveToLocalStorage = () => {
    if (process.client) {
      try {
        localStorage.setItem('meu-tako-theme', mode.value);
      } catch (error) {
        console.error('Erro ao salvar tema no localStorage:', error);
      }
    }
  };

  const loadFromLocalStorage = () => {
    if (process.client) {
      try {
        const savedTheme = localStorage.getItem('meu-tako-theme') as ThemeMode;
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
          mode.value = savedTheme;
          updateTheme();
        }
      } catch (error) {
        console.error('Erro ao carregar tema do localStorage:', error);
        // Fallback para auto se houver erro
        mode.value = 'auto';
        updateTheme();
      }
    }
  };

  const initializeTheme = () => {
    loadFromLocalStorage();

    // Listener para mudanças na preferência do sistema (modo auto)
    if (process.client) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        if (mode.value === 'auto') {
          updateTheme();
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);

      // Store the cleanup function for later use
      // This will be called when the store is destroyed
      const cleanup = () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };

      // Return cleanup function instead of using onUnmounted
      return cleanup;
    }
  };

  return {
    // State
    mode: readonly(mode),
    isDark: readonly(isDark),

    // Getters
    currentMode,
    isDarkMode,

    // Actions
    setTheme,
    toggleTheme,
    updateTheme,
    initializeTheme,
    loadFromLocalStorage,
    saveToLocalStorage,
  };
});
