<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Novo Template de Notificação
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Crie um novo template para notificações
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
    <ClientOnly>
      <form class="space-y-6" @submit.prevent="saveTemplate">
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
                      placeholder="Selecione um canal"
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
            <Card v-if="form.channel">
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
            <Card v-if="form.channel">
              <div class="p-6">
                <VariableManager
                  v-model="variables"
                  :template-content="form.content"
                  @insert-variable="insertVariable"
                />
              </div>
            </Card>
          </div>

          <!-- Sidebar com preview e configurações -->
          <div class="space-y-6">
            <!-- Preview -->
            <Card v-if="form.channel && form.content">
              <div class="p-6">
                <TemplatePreview
                  :content="form.content"
                  :channel="form.channel"
                  :subject="form.title"
                  :variables="form.variables || []"
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
            * Campos obrigatórios
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
              Salvar Template
            </Button>
          </div>
        </div>
      </form>
    </ClientOnly>

    <!-- Modal de teste -->
    <TestNotificationModal
      v-if="showTestModal && savedTemplate"
      :template="savedTemplate"
      :open="showTestModal"
      @update:open="showTestModal = false"
      @test-sent="handleTestSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotificationTemplatesStore } from '../../../stores/notificationTemplates';
import type { CreateNotificationTemplateRequest, NotificationTemplate } from '../../../types';

// Store
const store = useNotificationTemplatesStore();

// Estado do formulário
const form = ref<CreateNotificationTemplateRequest>({
  name: '',
  title: '',
  content: '',
  channel: 'whatsapp',
  language: 'pt-BR',
  variables: [],
  isActive: true
});

// Estado local
const validationResult = ref<any>(null);
const showTestModal = ref(false);
const templateForTest = ref<NotificationTemplate | null>(null);
const savedTemplate = ref<NotificationTemplate | null>(null);

// Computed
const loading = computed(() => store.isLoading);
const error = computed(() => store.error);

const canSave = computed(() => {
  return form.value.name.trim() &&
         form.value.channel &&
         form.value.content.trim() &&
         (!validationResult.value || validationResult.value.isValid);
});

const variables = computed({
  get: () => form.value.variables || [],
  set: (value: string[]) => {
    form.value.variables = value;
  }
});

const canTest = computed(() => {
  // Só pode testar se o template foi salvo (tem ID) e tem conteúdo válido
  return savedTemplate.value?.id &&
         form.value.channel &&
         form.value.content.trim() &&
         variables.value.length > 0;
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
const handleValidationChange = (result: any) => {
  validationResult.value = result;
};

const insertVariable = (variable: string) => {
  // Implementar inserção de variável no editor
  console.log('Inserir variável:', variable);
};

const testTemplate = () => {
  if (!canTest.value || !savedTemplate.value) return;

  // Usar o template salvo para teste
  templateForTest.value = savedTemplate.value;
  showTestModal.value = true;
};

const handleTestSent = () => {
  showTestModal.value = false;
};

const saveTemplate = async () => {
  if (!canSave.value) return;

  try {
    const createdTemplate = await store.createTemplate(form.value);
    savedTemplate.value = createdTemplate;
    // Não navegar imediatamente, permitir teste
  } catch (err) {
    console.error('Erro ao salvar template:', err);
  }
};

// Lifecycle
onMounted(() => {
  // Inicializar formulário
});
</script>
