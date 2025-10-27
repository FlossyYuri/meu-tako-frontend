<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <Icon
        name="lucide:alert-circle"
        class="w-12 h-12 text-red-500 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Erro ao carregar template
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
      <Button @click="() => store.getTemplateRemote(templateId)">
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
        Tentar novamente
      </Button>
    </div>

    <!-- Template não encontrado -->
    <div v-else-if="!template" class="text-center py-12">
      <Icon name="lucide:file-x" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Template não encontrado {{ template || '-' }}
        {{ selectedTemplate || '-' }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        O template solicitado não existe ou foi removido.
        {{ templateId || '-' }}
      </p>
      <Button @click="navigateTo('/admin/notification-templates')">
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
        Voltar para lista
      </Button>
    </div>

    <!-- Preview do template -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Preview do Template
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ template.name }} - {{ channelConfig.name }}
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <Button
            variant="outline"
            @click="navigateTo(`/admin/notification-templates/${template.id}`)"
          >
            <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
            Editar
          </Button>

          <Button
            variant="outline"
            @click="navigateTo('/admin/notification-templates')"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      <!-- Informações do template -->
      <Card>
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                :class="channelConfig.bgColor"
              >
                <Icon
                  :name="channelConfig.icon"
                  class="w-6 h-6"
                  :class="channelConfig.iconColor"
                />
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ template.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ channelConfig.name }} • {{ template.language }}
                </p>
                <div class="flex items-center space-x-2 mt-2">
                  <Badge
                    :variant="template.isActive ? 'success' : 'default'"
                    size="sm"
                  >
                    {{ template.isActive ? 'Ativo' : 'Inativo' }}
                  </Badge>

                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ template.variables.length }}
                    variável{{ template.variables.length > 1 ? 's' : '' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Dados de exemplo utilizados -->
      <Card v-if="template.variables.length > 0">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dados de Exemplo Utilizados
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              v-for="variable in template.variables"
              :key="variable"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ variable }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  Valor:
                  <span class="font-mono">{{ variable.toUpperCase() }}</span>
                </div>
              </div>
              <Badge variant="info" size="sm">
                {{ variable.toUpperCase() }}
              </Badge>
            </div>
          </div>

          <div class="flex items-center justify-end">
            <Button
              :disabled="!canSendTest"
              :loading="sendingTest"
              @click="sendTestNotification"
            >
              <Icon name="lucide:send" class="w-4 h-4 mr-2" />
              Enviar Notificação de Teste
            </Button>
          </div>
        </div>
      </Card>

      <!-- Preview visual -->
      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Preview Visual
            </h3>

            <div class="flex items-center space-x-2">
              <Icon name="lucide:refresh-cw" class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Atualização automática
              </span>
            </div>
          </div>

          <TemplatePreview
            :content="template.content"
            :channel="template.channel"
            :subject="template.title"
            :variables="[...template.variables]"
          />
        </div>
      </Card>

      <!-- Código do template -->
      <Card>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Código do Template
          </h3>

          <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre
              class="text-sm text-gray-100 font-mono"
            ><code>{{ template.content }}</code></pre>
          </div>
        </div>
      </Card>

      <!-- Variáveis utilizadas -->
      <Card v-if="template.variables.length > 0">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Variáveis do Template
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="variable in template.variables"
              :key="variable"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center space-x-2">
                <Icon name="lucide:code" class="w-4 h-4 text-gray-500" />
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ variable }}
                </span>
              </div>

              <Badge variant="default" size="sm"> Variável </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationTemplatesStore } from '~/stores/notificationTemplates';

// Route params
const route = useRoute();
const templateId = route.params.id as string;

// Store
const store = useNotificationTemplatesStore();

// Composables
const { success, error: showError } = useNotifications();

// Estado local
const sendingTest = ref(false);

// Computed
const template = computed(() => store.selectedTemplate);
const loading = computed(() => store.isLoading);
const error = computed(() => store.error);

const channelConfigs = {
  whatsapp: {
    name: 'WhatsApp',
    icon: 'lucide:message-circle',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  email: {
    name: 'Email',
    icon: 'lucide:mail',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  push: {
    name: 'Push',
    icon: 'lucide:smartphone',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
} as const;

const channelConfig = computed(() => {
  if (!template.value) return { name: '', icon: '', bgColor: '', iconColor: '' };
  return channelConfigs[template.value.channel as keyof typeof channelConfigs] || channelConfigs.whatsapp;
});

const canSendTest = computed(() => {
  return template.value?.variables && template.value.variables.length > 0;
});

const sendTestNotification = async () => {
  if (!template.value || !canSendTest.value) return;

  sendingTest.value = true;

  try {
    // Gerar dados de teste automaticamente baseados nas variáveis
    const testData: Record<string, string> = {};
    template.value.variables.forEach(variable => {
      testData[variable] = variable.toUpperCase();
    });

    await store.sendTestNotification(template.value.id, {
      channel: template.value.channel,
      template: template.value.name,
      data: testData
    });
    success('Sucesso', 'Notificação de teste enviada com sucesso!');
  } catch (err) {
    showError('Erro', 'Falha ao enviar notificação de teste');
    console.error('Erro ao enviar teste:', err);
  } finally {
    sendingTest.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  try {
    console.log('templateIdx', templateId);
    await store.getTemplateRemote(templateId);
  } catch (error) {
    console.error('Erro ao carregar template:', error);
  }
});
</script>
