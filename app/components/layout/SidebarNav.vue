<template>
  <div class="flex flex-col h-full">
    <!-- Logo -->
    <div
      class="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-700"
    >
      <NuxtLink to="/" class="flex items-center justify-center space-x-2">
        <Logo size="lg" :show-text="true" />
      </NuxtLink>

      <button
        v-if="isMobile"
        class="p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="$emit('close')"
      >
        <Icon name="lucide:x" class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-3 space-y-0.5">
      <NuxtLink
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.href"
        class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors duration-200"
        :class="isActive(item.href)
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'"
        @click="isMobile && $emit('close')"
      >
        <Icon :name="item.icon" class="w-4 h-4" />
        <span>{{ item.name }}</span>
      </NuxtLink>
    </nav>

    <!-- User section -->
    <div class="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-2.5">
        <div
          class="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center"
        >
          <Icon
            name="lucide:user"
            class="w-3.5 h-3.5 text-gray-600 dark:text-gray-300"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ authStore.user?.name || 'Usuário' }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ authStore.user?.email || 'email@exemplo.com' }}
          </p>
        </div>
        <button
          class="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          title="Sair"
          @click="handleLogout"
        >
          <Icon name="lucide:log-out" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'
import { useRoute, useRouter } from 'vue-router'

interface NavItem {
  name: string
  href: string
  icon: string
}

defineProps<{
  isMobile?: boolean
}>()

defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const navigationItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'lucide:layout-dashboard' },
  { name: 'Transações', href: '/transactions', icon: 'lucide:credit-card' },
  { name: 'Listas de Compras', href: '/shopping-lists', icon: 'lucide:shopping-cart' },
  { name: 'Receitas', href: '/incomes', icon: 'lucide:trending-up' },
  { name: 'Despesas', href: '/expenses', icon: 'lucide:trending-down' },
  { name: 'Carteiras', href: '/wallets', icon: 'lucide:wallet' },
  { name: 'Categorias', href: '/categories', icon: 'lucide:tags' },
  { name: 'Metas', href: '/goals', icon: 'lucide:target' },
  { name: 'Limites', href: '/limits', icon: 'lucide:shield' },
  { name: 'Relatórios', href: '/reports', icon: 'lucide:bar-chart-3' },
  { name: 'Configurações', href: '/settings', icon: 'lucide:settings' }
]

const isActive = (href: string) => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    await router.push('/auth/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
</script>
