export default defineNuxtPlugin(() => {
  // Inicializa o gerenciamento de tema no lado do cliente
  // para aplicar a classe 'dark' assim que possível.
  const themeStore = useThemeStore();

  // Apply theme immediately to prevent hydration mismatch
  if (process.client) {
    // Apply theme before any components render
    themeStore.updateTheme();
  }

  const cleanup = themeStore.initializeTheme();

  // Store cleanup function for potential future use
  if (cleanup) {
    // In a real app, you might want to store this for cleanup on app unmount
    // For now, we'll let the browser handle cleanup when the page unloads
  }
});
