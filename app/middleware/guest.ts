export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  // Initialize auth state if not already done
  if (import.meta.client) {
    authStore.initializeAuth();
  }

  // Redirect authenticated users to dashboard
  if (authStore.isAuthenticated) {
    return navigateTo('/');
  }
});
