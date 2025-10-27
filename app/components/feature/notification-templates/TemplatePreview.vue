<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Preview do Template
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Visualização para {{ channelConfig.name }}
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          :disabled="loading"
          @click="refreshPreview"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>
    </div>

    <!-- Preview por canal -->
    <div class="space-y-4">
      <!-- WhatsApp Preview -->
      <div
        v-if="channel === 'whatsapp'"
        class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
      >
        <div class="flex items-center space-x-2 mb-4">
          <Icon name="lucide:message-circle" class="w-5 h-5 text-green-600" />
          <span class="font-medium text-gray-900 dark:text-white"
            >WhatsApp</span
          >
        </div>

        <div class="max-w-sm mx-auto">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
            <!-- Header do WhatsApp -->
            <div
              class="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700"
            >
              <div
                class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Icon name="lucide:user" class="w-4 h-4 text-white" />
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white text-sm">
                  Meu Tako
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  online
                </div>
              </div>
            </div>

            <!-- Mensagem -->
            <div class="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <div
                class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
              >
                {{ processedContent }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatTime(new Date()) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Preview -->
      <div
        v-else-if="channel === 'email'"
        class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
      >
        <div class="flex items-center space-x-2 mb-4">
          <Icon name="lucide:mail" class="w-5 h-5 text-blue-600" />
          <span class="font-medium text-gray-900 dark:text-white">Email</span>
        </div>

        <div class="max-w-2xl mx-auto">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <!-- Header do Email -->
            <div class="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-t-lg">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  De: Meu Tako &lt;noreply@meutako.com&gt;
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDateTime(new Date()) }}
                </div>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Para: usuario@exemplo.com
              </div>
              <div class="font-medium text-gray-900 dark:text-white mt-1">
                Assunto: {{ processedSubject || 'Sem assunto' }}
              </div>
            </div>

            <!-- Conteúdo do Email -->
            <div class="p-4">
              <div class="prose prose-sm max-w-none dark:prose-invert">
                <div v-html="processedEmailContent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Push Notification Preview -->
      <div
        v-else-if="channel === 'push'"
        class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
      >
        <div class="flex items-center space-x-2 mb-4">
          <Icon name="lucide:smartphone" class="w-5 h-5 text-purple-600" />
          <span class="font-medium text-gray-900 dark:text-white"
            >Push Notification</span
          >
        </div>

        <div class="max-w-sm mx-auto">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <!-- Header da notificação -->
            <div
              class="flex items-center space-x-3 p-3 border-b border-gray-200 dark:border-gray-700"
            >
              <div
                class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center"
              >
                <Icon name="lucide:bell" class="w-4 h-4 text-white" />
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white text-sm">
                  Meu Tako
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  agora
                </div>
              </div>
            </div>

            <!-- Conteúdo da notificação -->
            <div class="p-3">
              <div class="text-sm text-gray-800 dark:text-gray-200">
                {{ processedContent }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dados de exemplo utilizados -->
    <div
      v-if="exampleData && Object.keys(exampleData).length > 0"
      class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
    >
      <div class="flex items-center space-x-2 mb-3">
        <Icon name="lucide:database" class="w-4 h-4 text-blue-600" />
        <span class="font-medium text-gray-900 dark:text-white text-sm">
          Dados de exemplo utilizados
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div
          v-for="(value, key) in exampleData"
          :key="key"
          class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
        >
          <span class="font-medium text-gray-700 dark:text-gray-300"
            >{{ key }}:</span
          >
          <span class="text-gray-600 dark:text-gray-400">{{ value }}</span>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <LoadingSpinner size="md" />
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
    >
      <div class="flex items-center space-x-2 text-red-600 dark:text-red-400">
        <Icon name="lucide:alert-circle" class="w-4 h-4" />
        <span class="font-medium">Erro no preview</span>
      </div>
      <p class="text-sm text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { processTemplate } from '~/utils/handlebarsProcessor';

interface Props {
  content: string;
  channel: 'whatsapp' | 'email' | 'push';
  subject?: string;
  variables?: string[];
  exampleData?: Record<string, unknown>;
}

const props = defineProps<Props>();

// Composables
const { formatDateTime } = useApi();

// Estado
const loading = ref(false);
const error = ref<string | null>(null);
const processedContent = ref('');
const processedSubject = ref('');
const processedEmailContent = ref('');

// Configurações por canal
const channelConfigs = {
  whatsapp: {
    name: 'WhatsApp',
    icon: 'lucide:message-circle'
  },
  email: {
    name: 'Email',
    icon: 'lucide:mail'
  },
  push: {
    name: 'Push Notification',
    icon: 'lucide:smartphone'
  }
};

const channelConfig = computed(() => channelConfigs[props.channel]);

// Dados de exemplo baseados nas variáveis do template
const exampleData = computed(() => {
  if (props.exampleData) return props.exampleData;

  // Gerar dados baseados nas variáveis do template
  const data: Record<string, unknown> = {};

  if (props.variables && props.variables.length > 0) {
    props.variables.forEach(variable => {
      // Usar o nome da variável em maiúsculas como valor
      data[variable] = variable.toUpperCase();
    });
  }

  return data;
});

// Processar template
const processTemplateContent = async () => {
  if (!props.content) {
    processedContent.value = '';
    processedSubject.value = '';
    processedEmailContent.value = '';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Processar conteúdo principal
    processedContent.value = processTemplate(props.content, exampleData.value);

    // Processar assunto se fornecido
    if (props.subject) {
      processedSubject.value = processTemplate(props.subject, exampleData.value);
    }

    // Processar conteúdo do email com HTML
    if (props.channel === 'email') {
      processedEmailContent.value = processedContent.value.replace(/\n/g, '<br>');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao processar template';
    processedContent.value = props.content;
  } finally {
    loading.value = false;
  }
};

// Atualizar preview
const refreshPreview = () => {
  processTemplateContent();
};

// Watch para mudanças
watch(() => [props.content, props.subject, props.variables, props.exampleData], () => {
  processTemplateContent();
}, { deep: true, immediate: true });

// Helper para formatar tempo
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
