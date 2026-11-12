<template>
  <a-tooltip
    position="rt"
    background-color="#fff"
    content-class="iconTooltip"
    :popup-visible="visible"
    :popup-container="'#' + props.container"
  >
    <slot name="content"></slot>
    <template #content>
      <div @mouseleave="leaveTooltip">
        <iconLibrary class="iconLibrary" @click="controlTooltip" />
      </div>
    </template>
  </a-tooltip>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps(["container"]);
const emit = defineEmits(["library", "click"]);
const visible = ref(false);
const controlTooltip = (iconId) => {
  visible.value = false;
  emit("click", iconId);
};

const show = () => {
  visible.value = true;
};
const hide = () => {
  visible.value = false;
};
const leaveTooltip = () => {
  hide();
};

defineExpose({ show, hide });
</script>

<style lang="scss" scoped>
.iconLibrary {
  width: 280px;
  height: 240px;
  overflow: auto;
}
</style>
<style>
.iconTooltip {
  box-sizing: border-box;
  color: var(--color-text-2);
  background-color: var(--color-bg-popup);
  border: 1px solid var(--color-neutral-3);
  border-radius: var(--border-radius-medium);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
