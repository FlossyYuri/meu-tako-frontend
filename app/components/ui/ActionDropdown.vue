<template>
  <div ref="dropdownRef" class="relative">
    <button
      class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      @click.stop="toggleDropdown"
    >
      <Icon name="lucide:more-horizontal" class="w-4 h-4 text-gray-500" />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
      >
        <div class="py-1">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

// Close dropdown when clicking outside
onClickOutside(dropdownRef, closeDropdown)

// Close dropdown when pressing Escape
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDropdown()
    }
  }

  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})

// Expose methods for parent components
defineExpose({
  close: closeDropdown,
  open: () => { isOpen.value = true },
  toggle: toggleDropdown
})
</script>
