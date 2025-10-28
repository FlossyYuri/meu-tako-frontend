<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header da página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Templates de Notificação
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie seus templates de notificação para WhatsApp, Email e Push
        </p>
      </div>

      <!-- Grid de templates -->
      <TemplateGrid
        :templates="templates"
        :loading="loading"
        @create="handleCreate"
        @preview="handlePreview"
        @edit="handleEdit"
        @duplicate="handleDuplicate"
        @test="handleTest"
        @delete="handleDelete"
      />

      <!-- Modal de teste -->
      <TestNotificationModal
        v-if="selectedTemplate"
        :template="selectedTemplate"
        :open="showTestModal"
        @update:open="showTestModal = $event"
        @test-sent="handleTestSent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useNotificationTemplatesStore } from '../../../stores/notificationTemplates';
import type { NotificationTemplate } from '../../../types';

// Store
const store = useNotificationTemplatesStore();

// Estado
const templates = computed(() => store.templates);
const loading = computed(() => store.isLoading);
const error = computed(() => store.error);

// Estado do modal de teste
const selectedTemplate = ref<NotificationTemplate | null>(null);
const showTestModal = ref(false);

// Carregar templates
onMounted(async () => {
  try {
    await store.fetchTemplates();
  } catch (error) {
    console.error('Erro ao carregar templates:', error);
  }
});

// Handlers
const handleCreate = () => {
  navigateTo('/admin/notification-templates/new');
};

const handlePreview = (template: NotificationTemplate) => {
  navigateTo(`/admin/notification-templates/${template.id}/preview`);
};

const handleEdit = (template: NotificationTemplate) => {
  navigateTo(`/admin/notification-templates/${template.id}`);
};

const handleDuplicate = async (template: NotificationTemplate) => {
  try {
    await store.duplicateTemplate(template.id);
    // Recarregar templates após duplicação
    await store.fetchTemplates();
  } catch (error) {
    console.error('Erro ao duplicar template:', error);
  }
};

const handleTest = (template: NotificationTemplate) => {
  selectedTemplate.value = template;
  showTestModal.value = true;
};

const handleTestSent = () => {
  showTestModal.value = false;
  selectedTemplate.value = null;
};

const handleDelete = async (template: NotificationTemplate) => {
  if (confirm('Tem certeza que deseja deletar este template?')) {
    try {
      await store.deleteTemplate(template.id);
      // Recarregar templates após exclusão
      await store.fetchTemplates();
    } catch (error) {
      console.error('Erro ao deletar template:', error);
    }
  }
};

// Meta
// useHead({
//   title: 'Templates de Notificação - Admin',
//   meta: [
//     { name: 'description', content: 'Gerencie templates de notificação' }
//   ]
// });
</script>
