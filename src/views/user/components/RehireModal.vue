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
    <a-form
      ref="formRef"
      :model="form"
      layout="vertical"
      class="person-modal-form"
    >
      <a-form-item field="deptId" label="部门">
        <a-cascader
          v-model="form.deptId"
          :options="deptList"
          :field-names="{ value: 'id', label: 'label' }"
          path-mode
          check-strictly
          allow-search
          placeholder="请选择部门"
          :style="{ width: '100%' }"
        />
      </a-form-item>
      <a-form-item field="postIds" label="职位">
        <a-select
          v-model="form.postIds"
          multiple
          :field-names="{ value: 'id', label: 'postName' }"
          :options="postList"
          placeholder="请选择职位"
          allow-clear
          :style="{ width: '100%' }"
        />
      </a-form-item>
      <a-form-item field="roleIds" label="角色">
        <div class="person-modal-role-checks">
          <a-checkbox-group v-model="form.roleIds">
            <a-checkbox
              v-for="r in roleList"
              :key="r.id"
              :value="r.id"
            >
              {{ r.roleName }}
            </a-checkbox>
          </a-checkbox-group>
        </div>
      </a-form-item>
    </a-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { Message } from "@arco-design/web-vue";
import { changeActive, updateDept, updateRole } from "@/api/user/index";
import { getUsersByIds } from "@/api/common/index";

const props = defineProps<{
  deptList: any[];
  postList: any[];
  roleList: any[];
}>();

const emit = defineEmits<{ success: [] }>();

const modalRef = ref();
const formRef = ref();
const record = ref<any>(null);

const form = reactive({
  deptId: [] as any,
  postIds: [] as (string | number)[],
  roleIds: [] as (string | number)[],
});

const open = async (row: any) => {
  record.value = row;
  form.deptId = [];
  form.postIds = [];
  form.roleIds = [];
  try {
    const detail = await getUsersByIds([row.id]);
    const u = Array.isArray(detail) ? detail[0] : detail?.records?.[0] || detail?.data?.[0];
    if (u?.userRoleList?.length) {
      form.roleIds = u.userRoleList.map((r: any) => r.id ?? r.roleId);
    }
  } catch {
    /* ignore */
  }
  modalRef.value?.handleClick({
    title: "返聘人员",
    showBtn: true,
    width: "420px",
    okText: "确定返聘",
    cancelText: "取消",
  });
};

const onCancel = () => {
  record.value = null;
  modalRef.value?.handleClose();
};

const onConfirm = () => {
  const userId = record.value?.id;
  if (!userId) return;
  const deptId = Array.isArray(form.deptId)
    ? form.deptId[form.deptId.length - 1]
    : form.deptId;
  return changeActive({ userId, active: 1 })
    .then(() => {
      const tasks: Promise<any>[] = [];
      if (deptId) {
        tasks.push(
          updateDept({
            userId,
            deptId,
            postIds: form.postIds || [],
          }),
        );
      }
      if (form.roleIds?.length) {
        tasks.push(updateRole({ userId, roleIds: form.roleIds }));
      }
      return Promise.all(tasks);
    })
    .then(() => {
      Message.success("返聘成功");
      emit("success");
      onCancel();
    });
};

defineExpose({ open });
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss";
</style>
