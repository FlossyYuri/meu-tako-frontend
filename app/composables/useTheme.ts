export const useTheme = () => {
  const themeStore = useThemeStore();

  // Ensure theme is applied consistently
  const applyTheme = () => {
    if (process.client) {
      themeStore.updateTheme();
    }
  };

  // Initialize theme on mount
  onMounted(() => {
    applyTheme();
  });

  return {
    applyTheme,
    themeStore,
  };
};
