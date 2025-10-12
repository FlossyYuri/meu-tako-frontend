export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  // Initialize auth state on app startup
  authStore.initializeAuth();
});
