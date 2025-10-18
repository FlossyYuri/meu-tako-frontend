export const useCurrency = () => {
  const formatCurrency = (value: number | string, currency = 'MT'): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) return 'MT 0,00';

    const formatted = new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);

    return `MT ${formatted}`;
  };

  const parseCurrency = (value: string): number => {
    // Remove tudo exceto números, vírgulas e pontos
    const cleanValue = value.replace(/[^\d,.-]/g, '');

    // Substitui vírgula por ponto para parsing
    const normalizedValue = cleanValue.replace(',', '.');

    return parseFloat(normalizedValue) || 0;
  };

  return {
    formatCurrency,
    parseCurrency,
  };
};
