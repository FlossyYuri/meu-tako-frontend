<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div
                class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
              >
                <Icon name="lucide:wallet" class="w-5 h-5 text-white" />
              </div>
              <span class="text-xl font-bold text-gray-900 dark:text-white">
                Meu Tako
              </span>
            </NuxtLink>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex space-x-8">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              :class="[
                $route.path === item.href
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              ]"
            >
              <Icon :name="item.icon" class="w-4 h-4" />
              <span>{{ item.name }}</span>
            </NuxtLink>
          </nav>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <button
              class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
              @click="toggleTheme"
            >
              <Icon
                :name="isDark ? 'lucide:sun' : 'lucide:moon'"
                class="w-5 h-5"
              />
            </button>

            <!-- Notifications -->
            <button
              class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200 relative"
            >
              <Icon name="lucide:bell" class="w-5 h-5" />
              <span
                v-if="unreadNotifications > 0"
                class="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center"
              >
                {{ unreadNotifications }}
              </span>
            </button>

            <!-- User Dropdown -->
            <ClientOnly>
              <div ref="userMenuRef" class="relative">
                <button
                  class="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
                  @click="toggleUserMenu"
                >
                  <div
                    class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  >
                    {{ authStore?.userInitials || 'U' }}
                  </div>
                  <Icon name="lucide:chevron-down" class="w-4 h-4" />
                </button>

                <!-- Dropdown Menu -->
                <Transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-if="showUserMenu"
                    class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div class="py-1">
                      <div
                        class="px-4 py-2 border-b border-gray-200 dark:border-gray-700"
                      >
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ authStore?.user?.name || 'Usuário' }}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          {{ authStore?.user?.email || 'email@exemplo.com' }}
                        </p>
                      </div>

                      <NuxtLink
                        to="/profile"
                        class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        @click="showUserMenu = false"
                      >
                        <Icon name="lucide:user" class="w-4 h-4" />
                        <span>Perfil</span>
                      </NuxtLink>

                      <NuxtLink
                        to="/settings"
                        class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        @click="showUserMenu = false"
                      >
                        <Icon name="lucide:settings" class="w-4 h-4" />
                        <span>Configurações</span>
                      </NuxtLink>

                      <button
                        class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        @click="handleLogout"
                      >
                        <Icon name="lucide:log-out" class="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </ClientOnly>

            <!-- Mobile Menu Button -->
            <button
              class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
              @click="toggleMobileMenu"
            >
              <Icon name="lucide:menu" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 transform -translate-y-1"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-1"
      >
        <div
          v-if="showMobileMenu"
          class="md:hidden border-t border-gray-200 dark:border-gray-700"
        >
          <div class="px-2 pt-2 pb-3 space-y-1">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              :class="[
                $route.path === item.href
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              ]"
              @click="showMobileMenu = false"
            >
              <Icon :name="item.icon" class="w-5 h-5" />
              <span>{{ item.name }}</span>
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer
      class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 Meu Tako. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { isDark, toggle: toggleTheme } = useDark()

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/', icon: 'lucide:layout-dashboard' },
  { name: 'Transações', href: '/transactions', icon: 'lucide:credit-card' },
  { name: 'Carteiras', href: '/wallets', icon: 'lucide:wallet' },
  { name: 'Metas', href: '/goals', icon: 'lucide:target' },
  { name: 'Relatórios', href: '/reports', icon: 'lucide:bar-chart-3' }
]

// State
const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const unreadNotifications = ref(0)

// Refs
const userMenuRef = ref<HTMLElement>()

// Methods
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    await navigateTo('/auth/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}

// Close user menu when clicking outside
onClickOutside(userMenuRef, () => {
  showUserMenu.value = false
})

// Initialize auth on mount
onMounted(() => {
  // Ensure auth is initialized
  if (import.meta.client) {
    authStore.initializeAuth()
  }
})
</script>
