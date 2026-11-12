import { computed } from "vue";

<template>
  <div class="operator-container-col">
    <a-input-search placeholder="搜索变量" v-model="searchKey" />
    <div class="operator-container-col-tree">
      <a-tree blockNode :default-expand-all="false" :data="variableData" action-on-node-click="expand" :fieldNames="{
        key: 'value',
        title: 'label',
      }" @select="selectVariable">
        <template #title="nodeData">
          <template v-if="((index = getMatchIndex(nodeData?.label)), index < 0)">
            {{ nodeData?.label }}
          </template>
          <span v-else>
            {{ nodeData?.label }}
          </span>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "ExpressionVariableBox",
};
</script>
<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  flatVariableToMap,
  findParentNode,
  userVariable,
} from "../formula/userFormula";
import type { TreeNodeData } from "@arco-design/web-vue";
import type { ExpressionVariable } from "../formula";
import { getFormById } from "../../../utils/form";
import { useRoute } from "vue-router";
const route = useRoute();
let appId = localStorage.getItem('taskFillCenterAppId')
const originVariableData = [userVariable];
//只在表单设计页面获取表单变量

if (route.name == "form" || route.name == "flowPath") {
  if (route.query?.id) {
    const formConfig = getFormById(route.query.id);
    const formVariable: ExpressionVariable = {
      id: "20000",
      parentId: "0",
      label: formConfig.name,
      value: "formVariable",
      selectable: false,
      children: formConfig.formList.map((item: any) =>
        buildFormVariable(item, "20000"),
      ),
    };
    originVariableData.push(formVariable);
  }
}

function buildFormVariable(item: any, parentId: string) {
  return {
    id: item.id,
    label: item.title,
    parentId: parentId,
    type: "variable",
    value: "getFormValue('" + (route.query?.id ? route.query?.id : appId) + "','" + item.id + "')",
    children:
      item.type === "SUBFORM" ? buildSubFormVariable(item.children, item) : [],
  };
}

function buildSubFormVariable(children: any, parent: any) {
  return children.map((item: any) => ({
    id: item.id,
    label: item.title,
    parentId: parent.id,
    type: "variable",
    value:
      "getSubFormValue('" +
      (route.query?.id ? route.query?.id : appId) +
      "','" +
      parent.id +
      "','" +
      item.id +
      "')",
    showLabel: parent.title + " / " + item.title,
  }));
}

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
  emits("choose", {
    id: data.node.id,
    parentId: data.node.parentId,
    label: data.node?.showLabel ? data.node.showLabel : data.node?.label,
    value: data.node.value,
    type: data.node.type,
  });
}

function searchData(keyword: string, originData: Array<ExpressionVariable>) {
  const loop = (data: Array<ExpressionVariable>) => {
    const result: ExpressionVariable[] = [];
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

function findVariable(variable: string) {
  const flatData = new Map<string, ExpressionVariable>();
  function traverse(nodes: Array<ExpressionVariable>) {
    nodes.forEach((node) => {
      if (node.value) {
        flatData.set(node.value, node);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  }

  traverse(originVariableData);
  return flatData.get(variable);
}

defineExpose({ findVariable });

function getMatchIndex(title: string): number {
  if (!searchKey.value) return -1;
  return title.toLowerCase().indexOf(searchKey.value.toLowerCase());
}
</script>
