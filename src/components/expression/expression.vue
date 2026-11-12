<template>
  <div :class="'expression-container ' + containerId">
    <a-dropdown
      position="bl"
      :popup-max-height="false"
      class="expressionMenu"
      @select="chooseExpression"
    >
      <span class="expression-font" v-on:click="openExpressionModal"> x </span>
    </a-dropdown>

    <template v-if="custom || !label">
      <slot name="default"  />
    </template>
    <template v-else>
   
      <a-input
        v-model="inputValue"
        allow-clear
        @clear="clearHandler"
        @input="inputHandler"
      />
    </template>

    <a-tag color="arcoblue" v-if="inputLabel && inputLabel != ''">
      {{ inputLabel }}
    </a-tag>

    <ExpressionModal
      ref="expressionModalRef"
      @updateExpression="updateExpression"
    />
  </div>
</template>
<script lang="ts">
import ExpressionMenu from "./components/ExpressionMenu.vue";
import ExpressionModal from "./components/ExpressionModal.vue";
import {
  findParentNode,
  flatVariableToMap,
  userVariable,
} from "./formula/userFormula";

export default {
  name: "QExpression",
};
</script>
<script lang="ts" setup>
import { generate } from "@/utils/id";
import { ref, watch } from "vue";
interface Props {
  label?: string;
  value?: string;
  custom?: boolean;
}

const containerId = "expression-container-" + generate();
const props = withDefaults(defineProps<Props>(), {
  label: "",
  value: "",
  custom: false,
});

const inputValue = ref<string>(props.value || "");
const inputLabel = ref<string>(props.label || "");
const emits = defineEmits(["update:value", "update:label"]);

watch(
  () => props.label,
  (val) => {
    inputLabel.value = val || "";
  },
  { immediate: true },
);

watch(
  () => props.value,
  (val) => {
    inputValue.value = val || "";
  },
  { immediate: true },
);

function inputHandler(value: string) {
  // if (inputLabel.value && inputLabel.value != "") {
  //   inputValue.value = " ";
  // } else {
  //   emits("update:value", value);
  // }
}

function clearHandler() {
  inputValue.value = "";
  inputLabel.value = "";
  emits("update:label", "");
  emits("update:value", "");
}

const expressionModalRef = ref();

function updateExpression(label: string, value: string) {
  inputLabel.value = label;
  emits("update:value", value);
  emits("update:label", label);
}

function openExpressionModal() {
  expressionModalRef.value.show({
    label: inputLabel.value,
    value: inputValue.value != "" ? inputValue.value : props.value,
  });
}

function chooseExpression(record: Record<string, any>) {
  if (record.type === "variable") {
    inputLabel.value = record.showLabel;
    emits("update:value", record.value);
  } else {
    inputLabel.value = record.label;
    emits("update:value", record.value);
  }
  emits("update:label", inputLabel.value);
}
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;
.expression-container {
  position: relative;
  width: 100%;
  display: flex;
  gap: 4px;
  .expression-font {
    padding: 0 12px;
    border-radius: 8px;
    font-style: italic;
    font-family: "New York", "Times New Roman", Times, serif;
    cursor: pointer;
    user-select: none; /* 标准语法 */
    cursor: pointer;
    color: white;
    line-height: 32px;
    background-color: rgb(var(--primary-6)) !important;
  }

  .arco-tag {
    position: absolute;
    left: 39px;
    top: 4px;
    z-index: 1000;
  }
}
</style>
