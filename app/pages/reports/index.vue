<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Relatórios"
      subtitle="Análise detalhada das suas finanças"
    />

    <!-- Report Tabs -->
    <Card>
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            :class="[
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
            @click="activeTab = tab.id"
          >
            <Icon :name="tab.icon" class="w-5 h-5 mr-2" />
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </Card>

    <!-- Report Content -->
    <div class="space-y-6">
      <!-- Monthly Report -->
      <MonthlyReport v-if="activeTab === 'monthly'" />

      <!-- Category Report -->
      <CategoryReport v-if="activeTab === 'category'" />

      <!-- Trends Report -->
      <TrendsReport v-if="activeTab === 'trends'" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

// State
const activeTab = ref('monthly');

// Tabs configuration
const tabs = [
  {
    id: 'monthly',
    name: 'Relatório Mensal',
    icon: 'lucide:calendar'
  },
  {
    id: 'category',
    name: 'Por Categoria',
    icon: 'lucide:pie-chart'
  },
  {
    id: 'trends',
    name: 'Tendências',
    icon: 'lucide:trending-up'
  }
];
</script>
