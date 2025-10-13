<template>
  <div v-if="isVisible" class="fixed top-0 left-0 right-0 h-1 z-[9999]">
    <div
      class="h-full bg-primary-600 transition-all duration-200"
      :style="{ width: progress + '%', opacity: isVisible ? '1' : '0' }"
    />
  </div>
</template>

<script setup lang="ts">
const routeLoading = useState<boolean>('routeLoading', () => false)

const isVisible = ref(false)
const progress = ref(0)
let timer: number | null = null

const start = () => {
  isVisible.value = true
  progress.value = 10
  advance()
}

const advance = () => {
  clearTimer()
  timer = window.setInterval(() => {
    // Aproxima gradualmente até 90%
    if (progress.value < 90) {
      progress.value += Math.max(1, (90 - progress.value) * 0.1)
    } else {
      clearTimer()
    }
  }, 200)
}

const done = () => {
  progress.value = 100
  clearTimer()
  window.setTimeout(() => {
    isVisible.value = false
    progress.value = 0
  }, 200)
}

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(routeLoading, (loading) => {
  if (loading) start()
  else done()
})

onUnmounted(clearTimer)
</script>