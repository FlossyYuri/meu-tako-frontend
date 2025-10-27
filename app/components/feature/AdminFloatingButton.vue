<template>
  <div v-if="authStore.user?.is_admin" class="fixed bottom-6 right-6 z-50">
    <!-- Botão flutuante principal -->
    <button
      ref="buttonRef"
      class="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
      :class="{ 'rotate-45': isOpen }"
      @click="toggleMenu"
    >
      <Icon
        :name="isOpen ? 'lucide:x' : 'lucide:settings'"
        class="w-6 h-6 transition-transform duration-200"
      />
    </button>

    <!-- Menu dropdown -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="isOpen"
        ref="menuRef"
        class="absolute bottom-16 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
      >
        <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            Painel de Administração
          </h3>
        </div>

        <div class="py-1">
          <NuxtLink
            v-for="item in adminMenuItems"
            :key="item.name"
            :to="item.href"
            class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            @click="closeMenu"
          >
            <Icon :name="item.icon" class="w-4 h-4" />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Overlay para fechar o menu -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="closeMenu" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

interface AdminMenuItem {
  name: string
  href: string
  icon: string
}

const authStore = useAuthStore()

const isOpen = ref(false)
const buttonRef = ref<HTMLElement>()
const menuRef = ref<HTMLElement>()

const adminMenuItems: AdminMenuItem[] = [
  {
    name: 'Templates de Notificação',
    href: '/admin/notification-templates',
    icon: 'lucide:mail'
  },
  {
    name: 'Histórico de Notificações',
    href: '/admin/notification-templates/history',
    icon: 'lucide:history'
  },
  {
    name: 'Estatísticas',
    href: '/admin/notification-templates/stats',
    icon: 'lucide:bar-chart-3'
  }
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

// Fechar menu ao pressionar Escape
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      closeMenu()
    }
  }

  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>
