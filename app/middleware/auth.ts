export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // Initialize auth state if not already done
  if (import.meta.client) {
    authStore.initializeAuth();
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated && authStore.isInitialized) {
    return navigateTo('/auth/login');
  }
});
