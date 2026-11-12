import { computed } from "vue";

<template>
  <div class="operator-container-col">
    <a-input-search placeholder="搜索函数" v-model="searchKey" />

    <div class="operator-container-col-tree">
      <a-tree
        blockNode
        only-check-leaf
        :default-expand-all="false"
        :data="variableData"
        action-on-node-click="expand"
        :fieldNames="{
          key: 'value',
          title: 'label',
        }"
        @select="selectVariable"
      >
        <template #title="nodeData">
          <template
            v-if="((index = getMatchIndex(nodeData?.label)), index < 0)"
          >
            <FuncLabel :func="nodeData" />
          </template>
          <template v-else>
            <FuncLabel :func="nodeData" />
          </template>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "ExpressionFuncBox",
};
</script>
<script lang="ts" setup>
import { computed, ref } from "vue";
import type { TreeNodeData } from "@arco-design/web-vue";
import type { ExpressionFunc } from "../formula";
import FuncLabel from "./FuncLabel.vue";
import { dateFunc } from "../formula/dateFormula";
import { randomFunc } from "../formula/randomFormula";
import { commonFunc } from "../formula/commonFormula";
import { stringFunc } from "../formula/stringFormula";
import { arrayFunc } from "../formula/arrayFormula";
import { moneyFunc } from "../formula/moneyFormula";
import { businessFunc } from "../formula/businessFormula";

const originVariableData = [
  commonFunc,
  dateFunc,
  moneyFunc,
  stringFunc,
  arrayFunc,
  randomFunc,
  businessFunc,
];

const variableData = computed(() => {
  if (!searchKey.value) return originVariableData;
  return searchData(searchKey.value, originVariableData);
});
const searchKey = ref("");
const emits = defineEmits(["choose"]);
function selectVariable(
  selectedKeys: Array<string | number>,
  data: {
    selected?: boolean;
    selectedNodes: TreeNodeData[];
    node?: TreeNodeData;
    e?: Event;
  },
) {
  emits("choose", data.node);
}

function searchData(keyword: string, originData: Array<ExpressionFunc>) {
  const loop = (data: Array<ExpressionFunc>) => {
    const result: ExpressionFunc[] = [];
    data.forEach((item) => {
      if (item.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
        result.push({ ...item });
      } else if (item.children) {
        const filterData = loop(item.children);
        if (filterData.length) {
          result.push({
            ...item,
            children: filterData,
          });
        }
      }
    });
    return result;
  };

  return loop(originData);
}

function getMatchIndex(title: string): number {
  if (!searchKey.value) return -1;
  return title.toLowerCase().indexOf(searchKey.value.toLowerCase());
}
</script>
