<template>
  <Modal v-model:isOpen="isOpen" title="Enviar Notificação de Teste" size="lg">
    <div class="space-y-6">
      <!-- Informações do template -->
      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="channelConfig.bgColor"
          >
            <Icon
              :name="channelConfig.icon"
              class="w-4 h-4"
              :class="channelConfig.iconColor"
            />
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">
              {{ template.name }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ channelConfig.name }}
            </p>
          </div>
        </div>
      </div>

      <!-- Formulário de dados de teste -->
      <div class="space-y-4">
        <h4 class="font-medium text-gray-900 dark:text-white">
          Dados para o teste
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="variable in template.variables"
            :key="variable"
            class="space-y-1"
          >
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ variable }}
              <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="testData[variable]"
              :placeholder="getPlaceholder(variable)"
              :type="getInputType(variable)"
            />
          </div>
        </div>
      </div>

      <!-- Destinatário customizado -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Destinatário (opcional)
        </label>
        <Input
          v-model="recipient"
          :placeholder="getRecipientPlaceholder()"
          type="email"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Deixe vazio para usar seu próprio
          {{ channelConfig.name.toLowerCase() }}
        </p>
      </div>

      <!-- Preview da notificação -->
      <div class="space-y-3">
        <h4 class="font-medium text-gray-900 dark:text-white">
          Preview da notificação
        </h4>

        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
        >
          <TemplatePreview
            :content="template.content"
            :channel="template.channel"
            :subject="template.title"
            :variables="template.variables"
            :example-data="testData"
          />
        </div>
      </div>

      <!-- Avisos importantes -->
      <div
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
      >
        <div class="flex items-start space-x-2">
          <Icon
            name="lucide:alert-triangle"
            class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
          />
          <div class="text-sm text-yellow-700 dark:text-yellow-300">
            <p class="font-medium mb-1">Atenção:</p>
            <ul class="space-y-1 text-xs">
              <li>• Esta notificação será enviada de verdade</li>
              <li>• Verifique os dados antes de enviar</li>
              <li>• O destinatário receberá a mensagem real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer do modal -->
    <template #footer>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ template.variables.length }}
          variável{{ template.variables.length > 1 ? 's' : '' }}
          necessária{{ template.variables.length > 1 ? 's' : '' }}
        </div>

        <div class="flex items-center space-x-3">
          <Button variant="outline" @click="closeModal" :disabled="loading">
            Cancelar
          </Button>

          <Button
            @click="sendTest"
            :disabled="!canSend || loading"
            :loading="loading"
          >
            <Icon name="lucide:send" class="w-4 h-4 mr-2" />
            Enviar Teste
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import type { NotificationTemplate, SendNotificationRequest } from '~/types';

interface Props {
  template: NotificationTemplate;
  open?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:open': [open: boolean];
  'test-sent': [data: any];
}>();

// Composables
const { sendTestNotification } = useNotificationTemplates();
const { success, error } = useNotifications();

// Estado
const loading = ref(false);
const testData = ref<Record<string, any>>({});
const recipient = ref('');

// Computed
const isOpen = computed({
  get: () => props.open || false,
  set: (value) => emit('update:open', value)
});

// Configurações por canal
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
};

const channelConfig = computed(() => channelConfigs[props.template.channel]);

// Verificar se pode enviar
const canSend = computed(() => {
  return props.template.variables.every(variable =>
    testData.value[variable] && testData.value[variable].toString().trim()
  );
});

// Métodos
const initializeTestData = () => {
  const exampleData = generateExampleData(props.template.variables);
  testData.value = { ...exampleData };
};

const getPlaceholder = (variable: string) => {
  const placeholders: Record<string, string> = {
    userName: 'João Silva',
    userEmail: 'joao@exemplo.com',
    amount: '150.50',
    date: '15/01/2024',
    billName: 'Conta de Luz',
    dueDate: '15/01/2024',
    goalName: 'Viagem para Europa',
    currentAmount: '2500.00',
    targetAmount: '5000.00',
    percentage: '50'
  };

  return placeholders[variable] || `Valor para ${variable}`;
};

const getInputType = (variable: string) => {
  if (variable.toLowerCase().includes('email')) return 'email';
  if (variable.toLowerCase().includes('amount') || variable.toLowerCase().includes('valor')) return 'number';
  if (variable.toLowerCase().includes('date') || variable.toLowerCase().includes('data')) return 'date';
  return 'text';
};

const getRecipientPlaceholder = () => {
  switch (props.template.channel) {
    case 'whatsapp':
      return '+258 84 123 4567';
    case 'email':
      return 'usuario@exemplo.com';
    case 'push':
      return 'Dispositivo atual';
    default:
      return 'Destinatário';
  }
};

const sendTest = async () => {
  if (!canSend.value) return;

  loading.value = true;

  try {
    const requestData: SendNotificationRequest = {
      channel: props.template.channel,
      template: props.template.name,
      data: testData.value,
      recipient: recipient.value || undefined
    };

    const result = await sendTestNotification(props.template.id, requestData);

    success('Sucesso', 'Notificação de teste enviada com sucesso!');
    emit('test-sent', result);
    closeModal();
  } catch (err) {
    error('Erro', 'Falha ao enviar notificação de teste');
    console.error('Erro ao enviar teste:', err);
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  isOpen.value = false;
};

// Lifecycle
onMounted(() => {
  initializeTestData();
});

// Watch para reinicializar dados quando template muda
watch(() => props.template, () => {
  initializeTestData();
}, { deep: true });
</script>
