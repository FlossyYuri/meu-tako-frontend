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
            name="lucide:alert-circle"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            {{ error.statusCode }}
          </h1>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ error.statusCode === 404 ? 'Página não encontrada' : 'Algo deu errado' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ error.statusCode === 404 
              ? 'A página que você está procurando não existe.' 
              : 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
            }}
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

const handleError = () => {
  clearError({ redirect: '/' })
}
</script>
