<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Variáveis do Template
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Gerencie as variáveis utilizadas no template
        </p>
      </div>

      <Button size="sm" @click="showAddForm = !showAddForm">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Adicionar
      </Button>
    </div>

    <!-- Formulário para adicionar variável -->
    <div
      v-if="showAddForm"
      class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Nova Variável
      </h4>

      <div class="flex items-center space-x-2">
        <Input
          v-model="newVariableName"
          placeholder="ex: userName"
          @keyup.enter="addVariable"
        />
        <Button :disabled="!newVariableName.trim()" @click="addVariable">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          Adicionar
        </Button>
        <Button variant="outline" @click="cancelAddVariable"> Cancelar </Button>
      </div>
    </div>

    <!-- Lista de variáveis -->
    <div class="space-y-2">
      <div
        v-if="variables.length === 0"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <Icon name="lucide:code" class="w-8 h-8 mx-auto mb-2" />
        <p>Nenhuma variável definida</p>
        <p class="text-sm">
          Adicione variáveis para tornar seu template dinâmico
        </p>
      </div>

      <div
        v-for="(variable, index) in variables"
        :key="variable"
        class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <Badge variant="info" size="sm">
              {{ variable }}
            </Badge>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            title="Inserir no template"
            @click="insertVariable(variable)"
          >
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            title="Remover variável"
            @click="removeVariable(index)"
          >
            <Icon name="lucide:trash-2" class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Variáveis detectadas automaticamente -->
    <div v-if="detectedVariables.length > 0" class="mt-6">
      <div class="flex items-center space-x-2 mb-3">
        <Icon name="lucide:search" class="w-4 h-4 text-blue-500" />
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          Variáveis detectadas no template
        </h4>
      </div>

      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="variable in detectedVariables"
          :key="variable"
          variant="default"
          size="sm"
          class="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
          @click="addDetectedVariable(variable)"
        >
          {{ variable }}
          <Icon name="lucide:plus" class="w-3 h-3 ml-1" />
        </Badge>
      </div>
    </div>

    <!-- Sugestões de variáveis comuns -->
    <div class="mt-6">
      <div class="flex items-center space-x-2 mb-3">
        <Icon name="lucide:lightbulb" class="w-4 h-4 text-yellow-500" />
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          Variáveis comuns
        </h4>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          v-for="suggestion in commonVariables"
          :key="suggestion"
          class="text-left p-2 text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700 transition-colors"
          @click="addSuggestion(suggestion)"
        >
          <div class="font-medium text-gray-900 dark:text-white">
            {{ suggestion }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Função para extrair variáveis do conteúdo do template
const extractVariables = (content: string): string[] => {
  if (!content) return [];
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) {
      matches.push(match[1].trim());
    }
  }
  return [...new Set(matches)]; // Remove duplicatas
};

interface Props {
  modelValue: string[];
  templateContent?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [variables: string[]];
  'insert-variable': [variable: string];
}>();

// Estado local
const variables = ref<string[]>([...props.modelValue]);
const showAddForm = ref(false);
const newVariableName = ref('');

// Variáveis detectadas automaticamente
const detectedVariables = computed(() => {
  if (!props.templateContent) return [];

  const extracted = extractVariables(props.templateContent);
  const existing = variables.value;
  return extracted.filter(v => !existing.includes(v));
});

// Variáveis comuns sugeridas
const commonVariables = [
  'userName',
  'userEmail',
  'amount',
  'date',
  'billName',
  'dueDate',
  'goalName',
  'currentAmount',
  'targetAmount',
  'percentage',
  'walletName',
  'transactionType',
  'categoryName',
  'description'
];

// Métodos
const addVariable = () => {
  if (!newVariableName.value.trim()) return;

  const variableName = newVariableName.value.trim();
  if (!variables.value.includes(variableName)) {
    variables.value.push(variableName);
    emit('update:modelValue', variables.value);
  }
  cancelAddVariable();
};

const cancelAddVariable = () => {
  showAddForm.value = false;
  newVariableName.value = '';
};

const removeVariable = (index: number) => {
  variables.value.splice(index, 1);
  emit('update:modelValue', variables.value);
};

const insertVariable = (variableName: string) => {
  emit('insert-variable', `{{${variableName}}}`);
};

const addDetectedVariable = (variableName: string) => {
  if (!variables.value.includes(variableName)) {
    variables.value.push(variableName);
    emit('update:modelValue', variables.value);
  }
};

const addSuggestion = (suggestion: string) => {
  if (!variables.value.includes(suggestion)) {
    variables.value.push(suggestion);
    emit('update:modelValue', variables.value);
  }
};

// Watch para sincronizar com props
watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    variables.value = [...newValue];
  }
}, { deep: true, immediate: true });
</script>
