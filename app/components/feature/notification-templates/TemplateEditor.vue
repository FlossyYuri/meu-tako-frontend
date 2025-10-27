<template>
  <div class="space-y-4">
    <!-- Header do editor -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Editor de Template
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Use Handlebars para criar templates dinâmicos
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <Badge
          :variant="validationResult.isValid ? 'success' : 'error'"
          size="sm"
        >
          {{ validationResult.isValid ? 'Válido' : 'Inválido' }}
        </Badge>

        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ content.length }}/{{ maxLength }} caracteres
        </div>
      </div>
    </div>

    <!-- Editor de texto simples -->
    <div
      class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <textarea
        v-model="content"
        class="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 resize-none focus:outline-none"
        :placeholder="placeholder"
        :readonly="readonly"
        @input="handleInput"
      />
    </div>

    <!-- Validação e erros -->
    <div v-if="!validationResult.isValid" class="space-y-2">
      <div class="flex items-center space-x-2 text-red-600 dark:text-red-400">
        <Icon name="lucide:alert-circle" class="w-4 h-4" />
        <span class="text-sm font-medium">Erros de validação:</span>
      </div>

      <div
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3"
      >
        <ul class="text-sm text-red-700 dark:text-red-300 space-y-1">
          <li v-for="error in validationResult.errors" :key="error">
            • {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Warnings -->
    <div v-if="validationResult.warnings.length > 0" class="space-y-2">
      <div
        class="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400"
      >
        <Icon name="lucide:alert-triangle" class="w-4 h-4" />
        <span class="text-sm font-medium">Avisos:</span>
      </div>

      <div
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3"
      >
        <ul class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li v-for="warning in validationResult.warnings" :key="warning">
            • {{ warning }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Variáveis detectadas -->
    <div v-if="validationResult.variables.length > 0" class="space-y-2">
      <div class="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
        <Icon name="lucide:code" class="w-4 h-4" />
        <span class="text-sm font-medium">Variáveis detectadas:</span>
      </div>

      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="variable in validationResult.variables"
          :key="variable"
          variant="default"
          size="sm"
        >
          {{ variable }}
        </Badge>
      </div>
    </div>

    <!-- Ajuda rápida -->
    <div class="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Sintaxe Handlebars:
      </h4>
      <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div>
          <code class="bg-gray-200 dark:bg-gray-800 px-1 rounded">
            &#123;&#123;variable&#125;&#125;
          </code>
          - Variável simples
        </div>
        <div>
          <code class="bg-gray-200 dark:bg-gray-800 px-1 rounded">
            &#123;&#123;#if condition&#125;&#125;...&#123;&#123;/if&#125;&#125;
          </code>
          - Condicional
        </div>
        <div>
          <code class="bg-gray-200 dark:bg-gray-800 px-1 rounded">
            &#123;&#123;#each items&#125;&#125;...&#123;&#123;/each&#125;&#125;
          </code>
          - Loop
        </div>
        <div>
          <code class="bg-gray-200 dark:bg-gray-800 px-1 rounded">
            &#123;&#123;formatDate date "DD/MM/YYYY"&#125;&#125;
          </code>
          - Helper
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationChannel } from '~/types';
import { validateTemplate } from '~/utils/handlebarsProcessor';

interface Props {
  modelValue: string;
  channel: 'whatsapp' | 'email' | 'push';
  placeholder?: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Digite seu template aqui...',
  readonly: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'validation-change': [result: any];
}>();

// Estado
const content = ref(props.modelValue);
const validationResult = ref({
  isValid: true,
  errors: [] as string[],
  warnings: [] as string[],
  variables: [] as string[]
});

// Limites por canal
const maxLength = computed(() => {
  const limits = {
    whatsapp: 1000,
    email: 10000,
    push: 200
  };
  return limits[props.channel];
});

// Validar conteúdo
const validateContent = () => {
  const result = validateTemplate(content.value, props.channel, {
    maxLength: maxLength.value,
    strictMode: false
  });

  validationResult.value = result;
  emit('validation-change', result);
};

// Handle input
const handleInput = () => {
  emit('update:modelValue', content.value);
  validateContent();
};

// Watch para mudanças externas
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue;
  }
});

// Watch para mudanças no canal
watch(() => props.channel, () => {
  validateContent();
});

// Validação inicial
onMounted(() => {
  validateContent();
});

// Expor métodos públicos
defineExpose({
  focus: () => {
    // Implementar foco no textarea se necessário
  },
  getValue: () => content.value,
  setValue: (value: string) => {
    content.value = value;
    emit('update:modelValue', value);
  },
  insertText: (text: string) => {
    // Implementar inserção de texto se necessário
    console.log('Inserir texto:', text);
  }
});
</script>
