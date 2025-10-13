<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="isClient && sidebarOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="sidebarOpen = false"
    >
      <div class="absolute inset-0 bg-gray-600 opacity-75" />
    </div>

    <!-- Mobile sidebar -->
    <div
      v-if="isClient && sidebarOpen"
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg lg:hidden"
    >
      <SidebarNav :is-mobile="true" @close="sidebarOpen = false" />
    </div>

    <!-- Desktop sidebar -->
    <div
      class="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col"
    >
      <div
        class="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      >
        <SidebarNav :is-mobile="false" />
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64 flex-1">
      <!-- Top bar for mobile -->
      <div class="lg:hidden">
        <div
          class="sticky top-0 z-40 flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <button
            class="p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="sidebarOpen = true"
          >
            <Icon name="lucide:menu" class="w-5 h-5" />
          </button>

          <NuxtLink to="/" class="flex items-center space-x-1.5">
            <div
              class="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center"
            >
              <Icon name="lucide:wallet" class="w-4 h-4 text-white" />
            </div>
            <span class="text-base font-bold text-gray-900 dark:text-white">
              Meu Tako
            </span>
          </NuxtLink>

          <div class="flex items-center space-x-1">
            <div class="relative">
              <button
                class="flex items-center space-x-1 p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="userMenuOpen = !userMenuOpen"
              >
                <Icon name="lucide:user" class="w-4 h-4" />
              </button>

              <div
                v-if="isClient && userMenuOpen"
                class="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              >
                <div class="py-1">
                  <NuxtLink
                    to="/profile"
                    class="flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Icon name="lucide:user" class="w-3.5 h-3.5 mr-2" />
                    Perfil
                  </NuxtLink>
                  <NuxtLink
                    to="/settings"
                    class="flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Icon name="lucide:settings" class="w-3.5 h-3.5 mr-2" />
                    Configurações
                  </NuxtLink>
                  <button
                    class="flex items-center w-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    @click="logout"
                  >
                    <Icon name="lucide:log-out" class="w-3.5 h-3.5 mr-2" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="flex-1 p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)
const isClient = ref(false)

// Ensure we're on the client before showing interactive elements
onMounted(() => {
  isClient.value = true
})

const logout = async () => {
  try {
    await authStore.logout()
    await navigateTo('/auth/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}

// Close menus when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      userMenuOpen.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>
