<template>
  <base-modal
    ref="modalRef"
    modal-class="person-modal-wrap"
    @handle-ok="onConfirm"
    @handle-cancel="onCancel"
  >
    <div class="person-modal-split person-role-add-modal">
      <div class="person-modal-split__left">
        <p class="person-modal-split__label">选择部门</p>
        <div class="person-modal-split__all-dept">
          <button
            type="button"
            :class="['person-tag-btn', { active: !selectedDeptId }]"
            @click="selectDept('')"
          >
            全部部门
          </button>
        </div>
        <div class="person-modal-split__tree">
          <a-tree
            :data="deptList"
            :field-names="{ key: 'id', title: 'label' }"
            block-node
            :selected-keys="selectedDeptKeys"
            @select="onDeptSelect"
          />
        </div>
      </div>
      <div class="person-modal-split__right">
        <p class="person-modal-split__label">可选成员</p>
        <div class="person-role-add-toolbar person-modal-form">
          <a-input
            v-model="keyword"
            allow-clear
            placeholder="搜索姓名 / 电话"
            @press-enter="fetchUsers"
            @clear="fetchUsers"
            @input="onKeywordInput"
          />
        </div>
        <div class="person-role-add-panel">
          <a-spin :loading="loading">
            <a-checkbox-group v-if="userList.length" v-model="selectedIds">
              <div class="person-role-pick-list">
                <label
                  v-for="u in userList"
                  :key="u.id"
                  class="person-role-pick"
                  :class="{ 'is-selected': selectedIds.includes(u.id) }"
                >
                  <a-checkbox :value="u.id" />
                  <div class="person-role-pick__body">
                    <div class="person-role-pick__title">
                      {{ u.nickname }}
                      <span
                        v-if="memberMeta(u)"
                        class="person-role-pick__meta"
                        >{{ memberMeta(u) }}</span
                      >
                    </div>
                    <div v-if="u.phone" class="person-role-pick__phone">
                      {{ u.phone }}
                    </div>
                  </div>
                </label>
              </div>
            </a-checkbox-group>
            <div v-else-if="!loading" class="person-role-empty">
              暂无可添加的成员
            </div>
          </a-spin>
        </div>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { getUser } from "@/api/user/index";
import { addRoleBatchUser } from "@/api/role/index";
import { getPrimaryDeptName, getPostDisplay } from "../utils/personDisplay";

defineProps<{
  deptList: any[];
}>();

const emit = defineEmits<{ success: [] }>();

const modalRef = ref();
const roleId = ref<string | number>("");
const roleName = ref("");
const keyword = ref("");
const selectedDeptId = ref("");
const selectedDeptKeys = ref<(string | number)[]>([]);
const selectedIds = ref<(string | number)[]>([]);
const userList = ref<any[]>([]);
const loading = ref(false);

const memberMeta = (record: any) => {
  const dept = getPrimaryDeptName(record);
  const postLine = getPostDisplay(record);
  const postOnly = postLine.includes(" - ")
    ? postLine.split(" - ").slice(1).join(" - ")
    : postLine;
  const deptPart = dept && dept !== "-" ? dept : "";
  const postPart = postOnly && postOnly !== "-" ? postOnly : "";
  if (deptPart && postPart) return `${deptPart} \u00b7 ${postPart}`;
  return deptPart || postPart || "";
};

const hasRole = (user: any) => {
  const roles = user?.userRoleList || [];
  return roles.some(
    (r: any) => String(r.id ?? r.roleId) === String(roleId.value),
  );
};

const open = (rid: string | number, rname?: string) => {
  roleId.value = rid;
  roleName.value = rname || "";
  keyword.value = "";
  selectedDeptId.value = "";
  selectedDeptKeys.value = [];
  selectedIds.value = [];
  userList.value = [];
  modalRef.value?.handleClick({
    title: roleName.value ? `新增成员-${roleName.value}` : "新增成员",
    showBtn: true,
    width: "640px",
    okText: "确定添加",
    cancelText: "取消",
  });
  fetchUsers();
};

const selectDept = (id: string) => {
  selectedDeptId.value = id;
  selectedDeptKeys.value = id ? [id] : [];
  fetchUsers();
};

const onDeptSelect = (keys: (string | number)[]) => {
  const id = keys?.[0] != null ? String(keys[0]) : "";
  selectDept(id);
};

let keywordTimer: ReturnType<typeof setTimeout> | null = null;
const onKeywordInput = () => {
  if (keywordTimer) clearTimeout(keywordTimer);
  keywordTimer = setTimeout(() => fetchUsers(), 300);
};

const fetchUsers = () => {
  loading.value = true;
  const params: Record<string, any> = {
    active: 1,
    userType: 1,
    current: 1,
    size: 200,
    username: keyword.value.trim() || undefined,
  };
  if (selectedDeptId.value) params.deptIds = selectedDeptId.value;
  getUser(params)
    .then((res) => {
      const kw = keyword.value.trim().toLowerCase();
      let list = (res.records || []).filter((u: any) => !hasRole(u));
      if (kw) {
        list = list.filter(
          (u: any) =>
            (u.nickname || "").toLowerCase().includes(kw) ||
            (u.phone || "").includes(kw),
        );
      }
      userList.value = list;
    })
    .finally(() => {
      loading.value = false;
    });
};

const onCancel = () => {
  selectedIds.value = [];
  modalRef.value?.handleClose();
};

const onConfirm = async () => {
  if (!selectedIds.value.length) {
    Message.warning("请选择要添加的成员");
    return;
  }
  try {
    await addRoleBatchUser(roleId.value, selectedIds.value);
    Message.success("添加成功");
    emit("success");
    onCancel();
  } catch {
    Message.error("添加失败");
  }
};

defineExpose({ open });
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss";
</style>
