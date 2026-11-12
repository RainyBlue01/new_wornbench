<template>
  <base-modal
    ref="modalRef"
    modal-class="person-modal-wrap"
    @handle-ok="onConfirm"
    @handle-cancel="onCancel"
  >
    <p class="person-modal-person-line">
      人员：<strong>{{ record?.nickname || "-" }}</strong>
    </p>
    <p class="person-modal-hint" style="margin-bottom: 8px">
      勾选需要兼任的部门（主部门不可取消）
    </p>
    <div class="extra-dept-filter">
      <a-input
        v-model="searchKeyword"
        allow-clear
        placeholder="搜索部门名称"
      >
        <template #prefix>
          <icon-search />
        </template>
      </a-input>
    </div>
    <div class="extra-dept-tree">
      <a-tree
        v-if="filteredDeptTree.length"
        v-model:checked-keys="visibleCheckedIds"
        v-model:expanded-keys="expandedKeys"
        :data="filteredDeptTree"
        :field-names="{ key: 'id', title: 'label' }"
        :checkable="true"
        :check-strictly="true"
        block-node
      >
        <template #title="nodeData">
          <span class="extra-dept-label">{{ nodeData.label }}</span>
          <span v-if="nodeData.isPrimary" class="extra-primary-tag">主部门</span>
        </template>
      </a-tree>
      <a-empty v-else description="未找到匹配的部门" />
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch } from "vue";
import { Message } from "@arco-design/web-vue";
import {
  addPartTimeDept,
  dismissPartTimeDept,
} from "@/api/user/index";
import { hasPrimaryDept } from "../utils/personDisplay";

const props = defineProps<{
  deptList: any[];
}>();

const emit = defineEmits<{ success: [] }>();

const modalRef = ref();
const record = ref<any>(null);
const checkedIds = ref<(string | number)[]>([]);
const initialPartTimeIds = ref<(string | number)[]>([]);
const primaryDeptId = ref<string | number>("");
const searchKeyword = shallowRef("");
const expandedKeys = ref<(string | number)[]>([]);

interface DeptTreeNode {
  id: string | number;
  label: string;
  children?: DeptTreeNode[];
  disableCheckbox?: boolean;
  isPrimary?: boolean;
  [key: string]: unknown;
}

const isSameId = (left: unknown, right: unknown) =>
  String(left) === String(right);

const decorateDeptTree = (nodes: any[]): DeptTreeNode[] => {
  if (!Array.isArray(nodes)) return [];

  return nodes.map((node) => {
    const isPrimary = isSameId(node.id, primaryDeptId.value);
    return {
      ...node,
      isPrimary,
      disableCheckbox: isPrimary || Boolean(node.disableCheckbox),
      children: node.children?.length
        ? decorateDeptTree(node.children)
        : undefined,
    };
  });
};

const deptTree = computed(() => decorateDeptTree(props.deptList));

const filterDeptTree = (
  nodes: DeptTreeNode[],
  keyword: string,
): DeptTreeNode[] => {
  return nodes.reduce<DeptTreeNode[]>((result, node) => {
    const children = node.children
      ? filterDeptTree(node.children, keyword)
      : [];
    const matched = String(node.label || "").toLocaleLowerCase()
      .includes(keyword);

    if (matched || children.length) {
      result.push({
        ...node,
        children: matched ? node.children : children,
      });
    }
    return result;
  }, []);
};

const normalizedKeyword = computed(() =>
  searchKeyword.value.trim().toLocaleLowerCase(),
);

const filteredDeptTree = computed(() => {
  if (!normalizedKeyword.value) return deptTree.value;
  return filterDeptTree(deptTree.value, normalizedKeyword.value);
});

const collectTreeKeys = (
  nodes: DeptTreeNode[],
  options: { branchesOnly?: boolean } = {},
) => {
  const keys: (string | number)[] = [];
  nodes.forEach((node) => {
    if (!options.branchesOnly || node.children?.length) keys.push(node.id);
    if (node.children?.length) {
      keys.push(...collectTreeKeys(node.children, options));
    }
  });
  return keys;
};

const visibleDeptIds = computed(
  () => new Set(collectTreeKeys(filteredDeptTree.value).map(String)),
);

// 筛选时树中不可见的已选部门仍然保留，避免继续勾选时丢失选择。
const visibleCheckedIds = computed<(string | number)[]>({
  get: () => checkedIds.value.filter((id) => visibleDeptIds.value.has(String(id))),
  set: (visibleIds) => {
    const hiddenIds = checkedIds.value.filter(
      (id) => !visibleDeptIds.value.has(String(id)),
    );
    const nextIds = [...hiddenIds, ...visibleIds];
    if (
      primaryDeptId.value !== "" &&
      !nextIds.some((id) => isSameId(id, primaryDeptId.value))
    ) {
      nextIds.unshift(primaryDeptId.value);
    }
    checkedIds.value = nextIds.filter(
      (id, index) => nextIds.findIndex((item) => isSameId(item, id)) === index,
    );
  },
});

watch(
  filteredDeptTree,
  (tree) => {
    expandedKeys.value = normalizedKeyword.value
      ? collectTreeKeys(tree, { branchesOnly: true })
      : [];
  },
  { immediate: true },
);

const open = (row: any) => {
  if (!hasPrimaryDept(row)) {
    Message.warning("请先设置主要部门");
    return;
  }
  record.value = row;
  const list = row.userDeptList || [];
  const main = list.find((d: any) => d.partTime === 0) || list[0];
  primaryDeptId.value = main?.deptId ?? "";
  const partTimes = list.filter((d: any) => d.partTime === 1).map((d: any) => d.deptId);
  initialPartTimeIds.value = [...partTimes];
  checkedIds.value = [
    ...(primaryDeptId.value ? [primaryDeptId.value] : []),
    ...partTimes,
  ];
  searchKeyword.value = "";
  expandedKeys.value = [];
  modalRef.value?.handleClick({
    title: "设置兼任部门",
    showBtn: true,
    width: "420px",
    okText: "确定",
    cancelText: "取消",
  });
};

const onCancel = () => {
  record.value = null;
  searchKeyword.value = "";
  expandedKeys.value = [];
  modalRef.value?.handleClose();
};

const onConfirm = async () => {
  const userId = record.value?.id;
  if (!userId) return;
  const selected = checkedIds.value.filter(
    (id) => String(id) !== String(primaryDeptId.value),
  );
  const toAdd = selected.filter(
    (id) => !initialPartTimeIds.value.some((x) => String(x) === String(id)),
  );
  const toRemove = initialPartTimeIds.value.filter(
    (id) => !selected.some((x) => String(x) === String(id)),
  );
  try {
    await Promise.all([
      ...toAdd.map((deptId) =>
        addPartTimeDept({ userId, deptId, postIds: [] }),
      ),
      ...toRemove.map((deptId) =>
        dismissPartTimeDept({ userId, deptId }),
      ),
    ]);
    Message.success("保存成功");
    emit("success");
    onCancel();
  } catch {
    Message.error("保存失败");
  }
};

defineExpose({ open });
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss";

.extra-dept-filter {
  margin-bottom: 10px;

  :deep(.arco-input-wrapper) {
    height: 36px;
    border-radius: 8px;
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  :deep(.arco-input-wrapper-focus) {
    background: #fff;
    border-color: rgb(var(--primary-6));
    box-shadow: 0 0 0 2px rgba(var(--primary-6), 0.08);
  }
}

.extra-dept-tree {
  min-height: 220px;
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px;
  background: #fff;

  :deep(.arco-tree) {
    font-size: 13px;
    color: #334155;
  }

  :deep(.arco-tree-node) {
    padding: 2px 0;
  }

  :deep(.arco-tree-node-title) {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 5px 6px;
    border-radius: 6px;
  }

  :deep(.arco-tree-node-title:hover) {
    background: #f8fafc;
  }

  :deep(.arco-tree-node-switcher) {
    color: #94a3b8;
  }

  :deep(.arco-empty) {
    padding: 48px 0;
  }
}

.extra-dept-label {
  overflow: hidden;
  color: #334155;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.extra-primary-tag {
  flex-shrink: 0;
  font-size: 11px;
  color: #94a3b8;
  margin-left: 4px;
}
</style>
