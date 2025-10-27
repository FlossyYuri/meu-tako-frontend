<template>
  <Card>
    <div class="p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Filtros de Período
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Year Selector -->
        <div>
          <Select
            v-model="selectedYear"
            label="Ano"
            :options="yearOptions"
            @update:model-value="onFilterChange"
          />
        </div>

        <!-- Month Selector -->
        <div>
          <Select
            v-model="selectedMonth"
            label="Mês"
            :options="monthOptions"
            @update:model-value="onFilterChange"
          />
        </div>

        <!-- Quick Actions -->
        <div class="flex flex-col justify-end">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Ações Rápidas
          </label>
          <div class="flex space-x-2">
            <Button variant="outline" size="sm" @click="setCurrentMonth">
              Mês Atual
            </Button>
            <Button variant="outline" size="sm" @click="setPreviousMonth">
              Mês Anterior
            </Button>
          </div>
        </div>
      </div>

      <!-- Date Range Filter (for category reports) -->
      <div
        v-if="showDateRange"
        class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">
          Período Personalizado
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Data Inicial
            </label>
            <Input
              v-model="startDate"
              type="date"
              @change="onDateRangeChange"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Data Final
            </label>
            <Input v-model="endDate" type="date" @change="onDateRangeChange" />
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
interface Props {
  showDateRange?: boolean;
  initialYear?: number;
  initialMonth?: number;
  initialStartDate?: string;
  initialEndDate?: string;
}

interface Emits {
  (e: 'filter-change', data: { year: number; month: number }): void;
  (e: 'date-range-change', data: { startDate: string; endDate: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  showDateRange: false,
  initialYear: undefined,
  initialMonth: undefined,
  initialStartDate: '',
  initialEndDate: ''
});

const emit = defineEmits<Emits>();

const { getCurrentMonth, getDateRange } = useReports();

// State
const selectedYear = ref(props.initialYear || getCurrentMonth().year);
const selectedMonth = ref(props.initialMonth || getCurrentMonth().month);
const startDate = ref(props.initialStartDate || getDateRange(1).startDate);
const endDate = ref(props.initialEndDate || getDateRange(1).endDate);

// Available years (current year ± 5 years)
const currentYear = new Date().getFullYear();
const availableYears = computed(() => {
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i);
  }
  return years;
});

const yearOptions = computed(() => {
  return availableYears.value.map(year => ({
    value: year,
    label: year.toString()
  }))
})

// Month names
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const monthOptions = computed(() => {
  return months.map((month, index) => ({
    value: index + 1,
    label: month
  }))
})

// Methods
const onFilterChange = () => {
  emit('filter-change', {
    year: selectedYear.value,
    month: selectedMonth.value
  });
};

const onDateRangeChange = () => {
  if (startDate.value && endDate.value) {
    emit('date-range-change', {
      startDate: startDate.value,
      endDate: endDate.value
    });
  }
};

const setCurrentMonth = () => {
  const current = getCurrentMonth();
  selectedYear.value = current.year;
  selectedMonth.value = current.month;
  onFilterChange();
};

const setPreviousMonth = () => {
  const current = getCurrentMonth();
  if (selectedMonth.value === 1) {
    selectedYear.value = current.year - 1;
    selectedMonth.value = 12;
  } else {
    selectedMonth.value = selectedMonth.value - 1;
  }
  onFilterChange();
};

// Initialize with current month if no initial values
onMounted(() => {
  if (!props.initialYear || !props.initialMonth) {
    const current = getCurrentMonth();
    selectedYear.value = current.year;
    selectedMonth.value = current.month;
  }

  if (!props.initialStartDate || !props.initialEndDate) {
    const range = getDateRange(1);
    startDate.value = range.startDate;
    endDate.value = range.endDate;
  }
});
</script>
