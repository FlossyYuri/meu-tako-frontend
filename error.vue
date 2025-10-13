<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div
            class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center"
          >
            <Icon name="lucide:wallet" class="w-7 h-7 text-white" />
          </div>
          <span class="text-2xl font-bold text-gray-900 dark:text-white">
            Meu Tako
          </span>
        </NuxtLink>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center"
      >
        <div class="mb-6">
          <Icon
            :name="errorIcon"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            {{ error.statusCode }}
          </h1>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ errorTitle }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ errorMessage }}
          </p>
        </div>

        <div class="space-y-3">
          <Button to="/" variant="primary" icon="lucide:home" full-width>
            Ir para o início
          </Button>

          <Button
            variant="outline"
            icon="lucide:refresh-cw"
            full-width
            @click="handleError"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ErrorProps {
  statusCode: number
  statusMessage?: string
}

const props = defineProps<ErrorProps>()

const errorIcon = computed(() => {
  switch (props.statusCode) {
    case 404:
      return 'lucide:search'
    case 500:
      return 'lucide:server'
    case 403:
      return 'lucide:shield-alert'
    default:
      return 'lucide:alert-circle'
  }
})

const errorTitle = computed(() => {
  switch (props.statusCode) {
    case 404:
      return 'Página não encontrada'
    case 500:
      return 'Erro interno do servidor'
    case 403:
      return 'Acesso negado'
    default:
      return 'Algo deu errado'
  }
})

const errorMessage = computed(() => {
  switch (props.statusCode) {
    case 404:
      return 'A página que você está procurando não existe ou foi movida.'
    case 500:
      return 'Ocorreu um erro interno. Nossa equipe foi notificada.'
    case 403:
      return 'Você não tem permissão para acessar esta página.'
    default:
      return 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
  }
})

const handleError = () => {
  clearError({ redirect: '/' })
}
</script>
