<template>
  <template v-if="!children">
    <a-doption :value="props.data">
      {{ label }}
    </a-doption>
  </template>

  <template v-else>
    <a-dsubmenu trigger="hover" class="expressionMenu">
      <template #default>
        {{ label }}
      </template>
      <template #content>
        <template v-for="(menu, index) in children">
          <component is="ExpressionMenu" :data="menu" />
        </template>
      </template>
    </a-dsubmenu>
  </template>
</template>

<script lang="ts">
export default {
  name: "ExpressionMenu",
};
</script>
<script lang="ts" setup>
import type { ExpressionFunc, ExpressionVariable } from "../formula";

interface Props {
  data: ExpressionVariable | ExpressionFunc;
}

const props = defineProps<Props>();

const { label, value, children } = props.data;
</script>
<style lang="scss">
.expressionMenu {
  .arco-dropdown-option {
    width: 110px !important;
  }
}
</style>
