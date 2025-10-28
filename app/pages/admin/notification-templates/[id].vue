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

    <!-- Formulário de edição -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Editar Template
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ template?.name }} - {{ channelConfig.name }}
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <Button
            variant="outline"
            @click="navigateTo('/admin/notification-templates')"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      <!-- Formulário -->
      <form class="space-y-6" @submit.prevent="updateTemplate">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Formulário principal -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Informações básicas -->
            <Card>
              <div class="p-6">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
                >
                  Informações Básicas
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nome do Template *
                    </label>
                    <Input
                      v-model="form.name"
                      placeholder="ex: payment_reminder"
                      required
                    />
                  </div>

                  <div>
                    <Select
                      v-model="form.channel"
                      label="Canal *"
                      :options="channelOptions"
                      required
                    />
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Título (opcional)
                    </label>
                    <Input
                      v-model="form.title"
                      placeholder="Título do template"
                    />
                  </div>

                  <div>
                    <Select
                      v-model="form.language"
                      label="Idioma"
                      :options="languageOptions"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <!-- Editor de template -->
            <Card>
              <div class="p-6">
                <TemplateEditor
                  v-model="form.content"
                  :channel="form.channel"
                  placeholder="Digite seu template aqui..."
                  @validation-change="handleValidationChange"
                />
              </div>
            </Card>

            <!-- Gerenciador de variáveis -->
            <Card>
              <div class="p-6">
                <VariableManager
                  v-model="form.variables"
                  :template-content="form.content"
                  @insert-variable="insertVariable"
                />
              </div>
            </Card>
          </div>

          <!-- Sidebar com preview e configurações -->
          <div class="space-y-6">
            <!-- Preview -->
            <Card>
              <div class="p-6">
                <TemplatePreview
                  :content="form.content"
                  :channel="form.channel"
                  :subject="form.title"
                  :variables="form.variables"
                />
              </div>
            </Card>

            <!-- Configurações -->
            <Card>
              <div class="p-6">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
                >
                  Configurações
                </h3>

                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <label
                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Template ativo
                      </label>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        Templates inativos não podem ser usados
                      </p>
                    </div>
                    <input
                      v-model="form.isActive"
                      type="checkbox"
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <!-- Validação -->
            <Card v-if="validationResult && !validationResult.isValid">
              <div class="p-6">
                <div
                  class="flex items-center space-x-2 text-red-600 dark:text-red-400 mb-3"
                >
                  <Icon name="lucide:alert-circle" class="w-5 h-5" />
                  <h3 class="font-semibold">Erros de Validação</h3>
                </div>

                <ul class="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li v-for="error in validationResult.errors" :key="error">
                    • {{ error }}
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>

        <!-- Ações -->
        <div
          class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Última atualização: {{ formatDateTime(template?.updatedAt) }}
          </div>

          <div class="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              :disabled="loading"
              @click="navigateTo('/admin/notification-templates')"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="outline"
              :disabled="!canTest || loading"
              @click="testTemplate"
            >
              <Icon name="lucide:send" class="w-4 h-4 mr-2" />
              Testar
            </Button>

            <Button
              type="submit"
              :disabled="!canSave || loading"
              :loading="loading"
            >
              <Icon name="lucide:save" class="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </form>

      <!-- Modal de teste -->
      <TestNotificationModal
        v-if="showTestModal && template"
        :template="template"
        :open="showTestModal"
        @update:open="showTestModal = false"
        @test-sent="handleTestSent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotificationTemplatesStore } from '../../../stores/notificationTemplates';
import type { UpdateNotificationTemplateRequest, NotificationTemplate } from '../../../types';

// Route params
const route = useRoute();
const templateId = route.params.id as string;

// Store
const store = useNotificationTemplatesStore();

// Composables
const { formatDateTime } = useApi();

// Estado do formulário
const form = ref({
  name: '',
  title: '',
  content: '',
  channel: 'whatsapp' as 'whatsapp' | 'email' | 'push',
  language: 'pt-BR',
  variables: [] as string[],
  isActive: true
});

// Estado local
const validationResult = ref<{ isValid: boolean; errors: string[] } | null>(null);
const showTestModal = ref(false);

// Computed
const template = computed(() => store.selectedTemplate);
const loading = computed(() => store.isLoading);
const error = computed(() => store.error);

const templateForModal = computed(() => {
  if (!template.value) return null;
  return {
    ...template.value,
    variables: [...template.value.variables] // Convert readonly to mutable
  };
});

const channelConfigs = {
  whatsapp: { name: 'WhatsApp', icon: 'lucide:message-circle' },
  email: { name: 'Email', icon: 'lucide:mail' },
  push: { name: 'Push', icon: 'lucide:smartphone' }
} as const;

const channelConfig = computed(() => {
  if (!template.value) return { name: '', icon: '' };
  return channelConfigs[template.value.channel as keyof typeof channelConfigs];
});

const canSave = computed(() => {
  return form.value?.content?.trim() &&
         (!validationResult.value || validationResult.value.isValid);
});

const canTest = computed(() => {
  // Só pode testar se o template foi salvo (tem ID) e tem conteúdo válido
  return template.value?.id &&
         form.value?.content?.trim() &&
         form.value?.variables?.length > 0;
});

// Opções para os selects
const channelOptions = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' }
];

const languageOptions = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' }
];

// Métodos
const handleValidationChange = (result: { isValid: boolean; errors: string[] }) => {
  validationResult.value = result;
};

const insertVariable = (variable: string) => {
  // Implementar inserção de variável no editor
  console.log('Inserir variável:', variable);
};

const testTemplate = () => {
  if (!canTest.value || !template.value) return;
  showTestModal.value = true;
};

const handleTestSent = () => {
  showTestModal.value = false;
};

const updateTemplate = async () => {
  if (!template.value || !form.value) return;

  try {
    const updateData: UpdateNotificationTemplateRequest = {
      title: form.value.title,
      content: form.value.content,
      language: form.value.language,
      variables: form.value.variables,
      isActive: form.value.isActive
    };
    await store.updateTemplate(template.value.id, updateData);
    await navigateTo('/admin/notification-templates');
  } catch (err) {
    console.error('Erro ao atualizar template:', err);
  }
};

// Lifecycle
onMounted(async () => {
  try {
    await store.getTemplateRemote(templateId);

    if (template.value) {
      // Preencher formulário com dados do template (deep copy to avoid readonly issues)
      form.value = {
        name: template.value.name,
        title: template.value.title || '',
        content: template.value.content,
        channel: template.value.channel,
        language: template.value.language,
        variables: template.value.variables || [],
        isActive: template.value.isActive
      };
    }
  } catch (err) {
    console.error('Erro ao carregar template:', err);
  }
});
</script>
