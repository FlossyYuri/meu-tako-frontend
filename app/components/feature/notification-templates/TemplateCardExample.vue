<template>
  <div class="max-w-4xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
      Exemplo do TemplateCard com Título
    </h2>

    <!-- Grid de exemplo -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Template 1: Com título -->
      <TemplateCard
        :template="templateWithTitle"
        @preview="handlePreview"
        @edit="handleEdit"
        @duplicate="handleDuplicate"
        @test="handleTest"
        @delete="handleDelete"
      />

      <!-- Template 2: Sem título -->
      <TemplateCard
        :template="templateWithoutTitle"
        @preview="handlePreview"
        @edit="handleEdit"
        @duplicate="handleDuplicate"
        @test="handleTest"
        @delete="handleDelete"
      />

      <!-- Template 3: Título longo -->
      <TemplateCard
        :template="templateWithLongTitle"
        @preview="handlePreview"
        @edit="handleEdit"
        @duplicate="handleDuplicate"
        @test="handleTest"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationTemplate } from '../../../types';

// Templates de exemplo
const templateWithTitle: NotificationTemplate = {
  id: '1',
  name: 'transaction_new',
  title: 'Nova Transação Registrada',
  content: 'Olá {{user.name}}! Você tem uma nova transação de {{formatCurrency amount}}.',
  channel: 'whatsapp',
  language: 'pt-BR',
  variables: ['user.name', 'amount'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const templateWithoutTitle: NotificationTemplate = {
  id: '2',
  name: 'payment_reminder',
  title: '', // Sem título
  content: 'Lembrete: Você tem um pagamento pendente de {{formatCurrency amount}}.',
  channel: 'email',
  language: 'pt-BR',
  variables: ['amount'],
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const templateWithLongTitle: NotificationTemplate = {
  id: '3',
  name: 'goal_achieved',
  title: 'Meta Financeira Atingida com Sucesso',
  content: 'Parabéns! Você atingiu sua meta de {{formatCurrency targetAmount}}!',
  channel: 'push',
  language: 'pt-BR',
  variables: ['targetAmount'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Handlers
const handlePreview = (template: NotificationTemplate) => {
  window.location.href = `/admin/notification-templates/${template.id}/preview`;
};

const handleEdit = (template: NotificationTemplate) => {
  window.location.href = `/admin/notification-templates/${template.id}`;
};

const handleDuplicate = (template: NotificationTemplate) => {
  // Implementar duplicação
  if (confirm('Deseja duplicar este template?')) {
    // Aqui seria chamada a função de duplicação
    console.log('Duplicando template:', template);
  }
};

const handleTest = (template: NotificationTemplate) => {
  window.location.href = `/admin/notification-templates/${template.id}/test`;
};

const handleDelete = (template: NotificationTemplate) => {
  if (confirm('Tem certeza que deseja deletar este template?')) {
    // Aqui seria chamada a função de deleção
    console.log('Deletando template:', template);
  }
};
</script>
