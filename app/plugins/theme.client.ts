export default defineNuxtPlugin(() => {
  // Inicializa o gerenciamento de tema no lado do cliente
  // para aplicar a classe 'dark' assim que possível.
  useTheme();
});