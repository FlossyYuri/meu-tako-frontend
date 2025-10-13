import type { ThemeMode } from '~/stores/theme';

export const useTheme = () => {
  const themeStore = useThemeStore();

  // Inicializa o tema na primeira execução
  if (process.client && !themeStore.mode) {
    themeStore.initializeTheme();
  }

  return {
    // Estado reativo da store
    mode: themeStore.mode,
    isDark: themeStore.isDark,
    currentMode: themeStore.currentMode,
    isDarkMode: themeStore.isDarkMode,

    // Ações da store
    setTheme: themeStore.setTheme,
    toggle: themeStore.toggleTheme,
    updateTheme: themeStore.updateTheme,
    initializeTheme: themeStore.initializeTheme,

    // Compatibilidade com código existente
    effective: computed(() => (themeStore.isDark ? 'dark' : 'light')),
  };
};
