<template>
  <template v-if="props.func.desc">
    <a-trigger position="rt" auto-fit-position :unmount-on-close="false">
      <span> {{ props.func.label }}</span>
      <template #content>
        <div class="trigger-box" v-html="safeDescription"></div>
      </template>
    </a-trigger>
  </template>
  <template v-else>{{ props.func.label }} </template>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { ExpressionFunc } from "../formula";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

interface Props {
  func: ExpressionFunc;
}

const props = defineProps<Props>();
const safeDescription = computed(() => sanitizeHtml(props.func.desc));
</script>

<style lang="scss" scoped>
.trigger-box {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  padding: 10px;
  max-width: 400px;
  background-color: var(--color-bg-popup);
  border-radius: 4px;
}
</style>

<style lang="scss">
.func-box {
  .title {
    font-weight: 600;
  }
  div {
    padding: 5px;
  }
  .func-describe {
  }
  .func-use {
  }
  .func-result {
  }
  .func-example {
  }
}
</style>
