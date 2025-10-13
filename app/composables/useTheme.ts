import { useColorMode } from '@vueuse/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const useTheme = () => {
  const colorMode = useColorMode<ThemeMode>({
    selector: 'html',
    attribute: 'class',
    // Tailwind usa 'dark' como classe; useColorMode alterna essa classe automaticamente
    storageKey: 'meu-tako-theme',
    emitAuto: true,
  });

  // Preferência salva: 'light' | 'dark' | 'auto'
  const mode = computed<ThemeMode>({
    get: () => (colorMode.preference as ThemeMode) || 'auto',
    set: (v) => {
      colorMode.preference = v;
    },
  });

  // Valor efetivo aplicado: 'light' | 'dark'
  const effective = computed<'light' | 'dark'>(() =>
    (colorMode.value as 'light' | 'dark') || 'light'
  );

  const isDark = computed(() => effective.value === 'dark');

  const setTheme = (newMode: ThemeMode) => {
    mode.value = newMode;
  };

  const toggle = () => {
    // Alterna somente entre light e dark (sem auto)
    setTheme(isDark.value ? 'light' : 'dark');
  };

  return {
    mode,
    effective,
    isDark,
    setTheme,
    toggle,
  };
};