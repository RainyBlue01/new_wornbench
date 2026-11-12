<template>
  <base-modal
    ref="modalRef"
    modal-class="person-modal-wrap"
    @handle-ok="formSubmit"
    @handle-cancel="handleCancel"
  >
    <div v-if="showUser" class="person-modal-split leader-create-body">
      <div class="person-modal-split__left person-modal-split__left--leader">
        <p class="person-modal-split__label">选择人员</p>
        <LeaderPersonPicker v-model="selectedUserIds" />
      </div>
      <div class="person-modal-split__right">
        <p class="person-modal-split__label">选择分管部门</p>
        <div class="leader-dept-search">
          <a-input
            v-model="deptSearchKeyword"
            allow-clear
            placeholder="搜索部门名称"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </div>
        <a-checkbox v-model="cascadeLinked" class="leader-cascade-check">
          联动下级部门（选中上级自动选中所有下级）
        </a-checkbox>
        <div class="person-leader-dept-panel">
          <a-tree
            v-if="hasDeptSearchResult"
            :checkable="true"
            :field-names="{ key: 'id', title: 'label' }"
            v-model:checked-keys="formData.deptIds"
            :check-strictly="!cascadeLinked"
            :expanded-keys="expandedDeptKeys"
            :filter-tree-node="filterDeptNode"
            block-node
            :data="displayDeptList"
            @update:expanded-keys="handleExpandedKeysUpdate"
          >
            <template #title="nodeData">
              <span class="person-leader-dept-label">{{ nodeData.label }}</span>
              <span v-if="nodeData.occupiedBy" class="person-leader-dept-tag">
                (已被{{ nodeData.occupiedBy }}分管)
              </span>
            </template>
          </a-tree>
          <a-empty v-else description="未找到匹配的部门" />
        </div>
      </div>
    </div>
    <a-form
      v-else
      ref="refChangeForm"
      class="person-modal-form"
      :model="formData"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item field="deptIds" label="分管部门">
        <div class="leader-dept-control">
          <div class="leader-dept-search">
            <a-input
              v-model="deptSearchKeyword"
              allow-clear
              placeholder="搜索部门名称"
            >
              <template #prefix>
                <icon-search />
              </template>
            </a-input>
          </div>
          <div class="person-leader-dept-panel">
            <a-tree
              v-if="hasDeptSearchResult"
              :checkable="true"
              :field-names="{ key: 'id', title: 'label' }"
              v-model:checked-keys="formData.deptIds"
              :check-strictly="!cascadeLinked"
              :expanded-keys="expandedDeptKeys"
              :filter-tree-node="filterDeptNode"
              block-node
              :data="displayDeptList"
              @update:expanded-keys="handleExpandedKeysUpdate"
            >
              <template #title="nodeData">
                <span class="person-leader-dept-label">{{ nodeData.label }}</span>
                <span v-if="nodeData.occupiedBy" class="person-leader-dept-tag">
                  (已被{{ nodeData.occupiedBy }}分管)
                </span>
              </template>
            </a-tree>
            <a-empty v-else description="未找到匹配的部门" />
          </div>
        </div>
      </a-form-item>
    </a-form>
  </base-modal>
</template>

<script setup lang="ts">
import {
  charge,
  pageRecord,
  type ChargeParams,
} from "@/api/leader/index";
import { ref, shallowRef, reactive, computed, watch } from "vue";
import { Message } from "@arco-design/web-vue";
import LeaderPersonPicker from "./components/LeaderPersonPicker.vue";

const props = defineProps<{
  deptList: any[];
}>();

const emits = defineEmits(["init"]);

const refChangeForm = ref();
const modalRef = ref();
const showUser = ref(false);
const cascadeLinked = ref(false);
const submitting = ref(false);
const selectedUserIds = ref<(string | number)[]>([]);
const editingUserId = ref<string | number | null>(null);
const deptSearchKeyword = shallowRef("");
const expandedDeptKeys = ref<(string | number)[]>([]);
const expandedDeptKeysBeforeSearch = ref<(string | number)[]>([]);
const deptOwnerMap = ref<
  Map<string | number, { userId: string | number; nickname: string }>
>(new Map());

const formData = reactive<{
  deptIds: any;
  userIds: any[];
}>({
  deptIds: [],
  userIds: [],
});

/** 树勾选值归一化（兼容联动/严格模式） */
const normalizeDeptIds = (keys: unknown): string[] => {
  if (!keys) return [];
  if (Array.isArray(keys)) {
    return keys.map((k) => String(k));
  }
  if (typeof keys === "object") {
    const obj = keys as { checked?: unknown[]; halfChecked?: unknown[] };
    return (obj.checked || []).map((k) => String(k));
  }
  return [];
};

const markDeptTree = (nodes: any[]): any[] => {
  if (!nodes?.length) return [];
  return nodes.map((node) => {
    const owner = deptOwnerMap.value.get(node.id);
    let disableCheckbox = false;
    let occupiedBy: string | undefined;
    if (owner) {
      const isOther =
        editingUserId.value == null ||
        String(owner.userId) !== String(editingUserId.value);
      if (isOther) {
        occupiedBy = owner.nickname;
        disableCheckbox = true;
      }
    }
    return {
      ...node,
      occupiedBy,
      disableCheckbox,
      children: node.children ? markDeptTree(node.children) : undefined,
    };
  });
};

const displayDeptList = computed(() => markDeptTree(props.deptList || []));

interface DeptSearchState {
  visibleKeys: Set<string>;
  expandedKeys: (string | number)[];
}

const normalizedDeptKeyword = computed(() =>
  deptSearchKeyword.value.trim().toLocaleLowerCase(),
);

const deptSearchState = computed<DeptSearchState>(() => {
  const keyword = normalizedDeptKeyword.value;
  const visibleKeys = new Set<string>();
  const expandedKeys = new Set<string | number>();

  const visit = (
    node: any,
    ancestors: (string | number)[],
  ): boolean => {
    const childMatched = (node.children || [])
      .map((child: any) => visit(child, [...ancestors, node.id]))
      .some(Boolean);
    const selfMatched = String(node.label || "")
      .toLocaleLowerCase()
      .includes(keyword);

    if (!selfMatched && !childMatched) return false;

    visibleKeys.add(String(node.id));
    ancestors.forEach((key) => {
      visibleKeys.add(String(key));
      expandedKeys.add(key);
    });
    if (childMatched) expandedKeys.add(node.id);
    return true;
  };

  if (keyword) {
    displayDeptList.value.forEach((node) => visit(node, []));
  }

  return {
    visibleKeys,
    expandedKeys: [...expandedKeys],
  };
});

const hasDeptSearchResult = computed(() =>
  !normalizedDeptKeyword.value || deptSearchState.value.visibleKeys.size > 0,
);

const filterDeptNode = (node: any) =>
  !normalizedDeptKeyword.value ||
  deptSearchState.value.visibleKeys.has(String(node.id));

const handleExpandedKeysUpdate = (keys: (string | number)[]) => {
  expandedDeptKeys.value = keys;
  if (!normalizedDeptKeyword.value) {
    expandedDeptKeysBeforeSearch.value = [...keys];
  }
};

watch(
  normalizedDeptKeyword,
  (keyword, oldKeyword) => {
    if (keyword) {
      if (!oldKeyword) {
        expandedDeptKeysBeforeSearch.value = [...expandedDeptKeys.value];
      }
      expandedDeptKeys.value = [...deptSearchState.value.expandedKeys];
      return;
    }
    expandedDeptKeys.value = [...expandedDeptKeysBeforeSearch.value];
  },
);

watch(
  deptSearchState,
  (state) => {
    if (normalizedDeptKeyword.value) {
      expandedDeptKeys.value = [...state.expandedKeys];
    }
  },
);

const loadDeptOwners = (excludeUserId?: string | number) => {
  pageRecord({ current: 1, size: 500 }).then((res) => {
    const map = new Map<
      string | number,
      { userId: string | number; nickname: string }
    >();
    (res.records || []).forEach((leader) => {
      if (
        excludeUserId != null &&
        String(leader.id) === String(excludeUserId)
      ) {
        return;
      }
      (leader.deptIds || []).forEach((deptId) => {
        if (!map.has(deptId)) {
          map.set(deptId, {
            userId: leader.id,
            nickname: leader.nickname || "其他",
          });
        }
      });
    });
    deptOwnerMap.value = map;
  });
};

watch(
  selectedUserIds,
  (ids) => {
    if (!showUser.value) return;
    formData.userIds = ids.map((id) => ({ id }));
  },
  { deep: true },
);

const resolveUserIds = (): string[] => {
  if (showUser.value) {
    return selectedUserIds.value
      .filter((id) => id != null && id !== "")
      .map(String);
  }
  return formData.userIds
    .map((item) => (typeof item === "object" ? item?.id ?? item?.userId : item))
    .filter((id) => id != null)
    .map(String);
};

const buildChargeParams = (): ChargeParams | null => {
  const userIds = resolveUserIds();
  const deptIds = normalizeDeptIds(formData.deptIds);

  if (!userIds.length) {
    Message.warning("请选择分管领导");
    return null;
  }
  if (!deptIds.length) {
    Message.warning("请选择分管部门");
    return null;
  }

  return { userIds, deptIds };
};

const submitCharge = async () => {
  const params = buildChargeParams();
  if (!params || submitting.value) return;

  submitting.value = true;
  try {
    await charge(params);
    Message.success(showUser.value ? "设置成功" : "保存成功");
    handleCancel();
    modalRef.value.handleClose();
    emits("init");
  } finally {
    submitting.value = false;
  }
};

const showItem = (item?: any) => {
  deptSearchKeyword.value = "";
  expandedDeptKeys.value = [];
  expandedDeptKeysBeforeSearch.value = [];
  if (item) {
    showUser.value = false;
    editingUserId.value = item.id;
    formData.userIds = [item];
    formData.deptIds = [...(item.deptIds || [])];
    cascadeLinked.value = false;
    loadDeptOwners(item.id);
    modalRef.value.handleClick({
      title: `${item.nickname}分管的${(item.deptIds || []).length}个部门`,
      okText: "确定",
      cancelText: "取消",
      showBtn: true,
      width: "520px",
    });
  } else {
    showUser.value = true;
    editingUserId.value = null;
    selectedUserIds.value = [];
    formData.deptIds = [];
    formData.userIds = [];
    cascadeLinked.value = false;
    loadDeptOwners();
    modalRef.value.handleClick({
      title: "设置分管领导",
      okText: "确定",
      cancelText: "取消",
      showBtn: true,
      width: "640px",
    });
  }
};

const rules = {
  deptIds: [{ required: true, type: "array", message: "请选择分管部门" }],
};

const handleCancel = () => {
  formData.deptIds = [];
  formData.userIds = [];
  selectedUserIds.value = [];
  editingUserId.value = null;
  deptOwnerMap.value = new Map();
  cascadeLinked.value = false;
  deptSearchKeyword.value = "";
  expandedDeptKeys.value = [];
  expandedDeptKeysBeforeSearch.value = [];
};

const formSubmit = () => {
  if (showUser.value) {
    submitCharge();
    return;
  }
  refChangeForm.value?.validate((error: any) => {
    if (!error) submitCharge();
  });
};

defineExpose({ showItem });
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss";

.leader-create-body {
  min-height: 360px;
}

.leader-cascade-check {
  margin-bottom: 8px;
  font-size: 12px;
  color: #475569;
}

.leader-dept-search {
  flex-shrink: 0;
  width: 100%;
  margin-bottom: 8px;

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

.leader-dept-control {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
}

.person-leader-dept-panel {
  width: 100%;

  :deep(.arco-empty) {
    padding: 48px 0;
  }
}
</style>
