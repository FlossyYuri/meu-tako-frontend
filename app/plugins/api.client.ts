export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Global API configuration
  $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      // Add default headers
      options.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    },
    onResponseError({ response }) {
      // Handle common errors globally
      if (response.status === 401) {
        // Token expired or invalid
        const authStore = useAuthStore();
        authStore.logout();
        navigateTo('/auth/login');
      }
    },
  });
});
