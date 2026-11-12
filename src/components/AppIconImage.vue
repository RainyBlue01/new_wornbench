<template>
  <img
    :src="displaySrc"
    :alt="alt"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import placeholderIcon from '@/assets/icon_zhanwei.svg'

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  eager?: boolean
}>(), {
  src: '',
  alt: '',
  eager: false,
})

const failedSrc = ref('')
const displaySrc = computed(() => (
  props.src && props.src !== failedSrc.value ? props.src : placeholderIcon
))

const handleError = () => {
  if (displaySrc.value !== placeholderIcon) {
    failedSrc.value = props.src
  }
}
</script>
