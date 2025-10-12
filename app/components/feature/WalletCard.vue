<template>
  <Card class="hover:shadow-lg transition-shadow duration-200 cursor-pointer" @click="emit('select', wallet)">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:wallet" class="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ wallet.wallet_name }}
            </h3>
            <p v-if="showCreatedAt" class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDisplayDate(wallet.created_at) }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Badge v-if="wallet.is_default && showDefaultBadge" variant="success" size="sm">
            Padrão
          </Badge>

          <div ref="menuRef" class="relative">
            <button
              class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              @click.stop="toggleMenu"
            >
              <Icon name="lucide:more-horizontal" class="w-4 h-4 text-gray-500" />
            </button>

            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                <div class="py-1">
                  <button
                    class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    @click.stop="emit('edit', wallet)"
                  >
                    <Icon name="lucide:edit" class="w-4 h-4" />
                    <span>Editar</span>
                  </button>

                  <button
                    v-if="!wallet.is_default"
                    class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    @click.stop="emit('set-default', wallet)"
                  >
                    <Icon name="lucide:star" class="w-4 h-4" />
                    <span>Definir como padrão</span>
                  </button>

                  <button
                    v-if="!wallet.is_default && canDelete"
                    class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                    @click.stop="emit('delete', wallet)"
                  >
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">Saldo atual</span>
          <span class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatCurrency(wallet.balance) }}
          </span>
        </div>

        <div v-if="showUpdatedAt" class="flex items-center justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Última atualização</span>
          <span class="text-gray-700 dark:text-gray-300">
            {{ formatRelativeTime(wallet.updated_at) }}
          </span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { Wallet } from '~/types';

interface Props {
  wallet: Wallet
  showDefaultBadge?: boolean
  showCreatedAt?: boolean
  showUpdatedAt?: boolean
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDefaultBadge: true,
  showCreatedAt: true,
  showUpdatedAt: true,
  canDelete: true,
})

const emit = defineEmits<{
  select: [wallet: Wallet]
  edit: [wallet: Wallet]
  'set-default': [wallet: Wallet]
  delete: [wallet: Wallet]
}>()

const { formatCurrency, formatDisplayDate, formatRelativeTime } = useApi()

const showMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const toggleMenu = () => (showMenu.value = !showMenu.value)

onClickOutside(menuRef, () => (showMenu.value = false))
</script>