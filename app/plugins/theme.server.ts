export default defineNuxtPlugin(() => {
  // Server-side theme initialization
  // This ensures consistent initial rendering on the server
  if (process.server) {
    // Set default theme for server-side rendering
    // The client will override this with the actual user preference
    useHead({
      htmlAttrs: {
        class: 'light', // Default to light theme for SSR
      },
    });
  }
});
