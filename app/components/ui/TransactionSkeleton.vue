<template>
  <div class="space-y-3">
    <div
      v-for="i in count"
      :key="i"
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- Icon skeleton -->
          <Skeleton width="40px" height="40px" circle />

          <div class="space-y-2">
            <!-- Description skeleton -->
            <Skeleton width="120px" height="16px" />
            <Skeleton width="80px" height="14px" />
          </div>
        </div>

        <div class="text-right space-y-2">
          <!-- Amount skeleton -->
          <Skeleton width="80px" height="18px" />
          <Skeleton width="60px" height="14px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 5
})
</script>
