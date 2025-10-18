<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:wallet" class="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ wallet.wallet_name }}
            </h1>
            <div class="flex items-center gap-2 mt-1">
              <Badge v-if="wallet.is_default" variant="success" size="sm">Padrão</Badge>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Criada em {{ formatDisplayDate(wallet.created_at) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" icon="lucide:edit" @click="emit('edit', wallet.wallet_id)">Editar</Button>
          <Button
            v-if="!wallet.is_default"
            variant="outline"
            icon="lucide:star"
            @click="emit('set-default', wallet.wallet_id)"
          >
            Definir padrão
          </Button>
          <Button
            v-if="canDelete"
            variant="error"
            icon="lucide:trash-2"
            @click="emit('delete', wallet.wallet_id)"
          >
            Excluir
          </Button>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Saldo</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(wallet.balance) }}
        </p>
      </div>

      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Última atualização</p>
        <p class="text-lg font-medium text-gray-900 dark:text-white">
          {{ formatRelativeTime(wallet.updated_at) }}
        </p>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { Wallet } from '~/types';

const props = withDefaults(defineProps<{
  wallet: Wallet
  canDelete?: boolean
}>(), {
  canDelete: true
})

const emit = defineEmits<{
  edit: [id: string]
  'set-default': [id: string]
  delete: [id: string]
}>()

const { formatCurrency, formatDisplayDate, formatRelativeTime } = useApi()
</script>