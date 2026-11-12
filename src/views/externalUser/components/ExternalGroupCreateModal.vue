<template>
  <base-modal
    ref="modalRef"
    modal-class="person-modal-wrap"
    @handle-ok="onSubmit"
    @handle-cancel="onCancel"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      layout="vertical"
      class="person-modal-form"
    >
      <a-form-item field="name" label="分组名称" required>
        <a-input v-model="form.name" placeholder="请输入分组名称" allow-clear />
      </a-form-item>
    </a-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { ExternalGroup } from "../composables/useExternalPage";

export type GroupSubmitPayload = { name: string; id?: string | number };

const emit = defineEmits<{ submit: [payload: GroupSubmitPayload] }>();

const modalRef = ref();
const formRef = ref();
const editingId = ref<string | number | undefined>();

const form = ref({ name: "" });

const rules = {
  name: [{ required: true, message: "请输入分组名称" }],
};

const resetForm = () => {
  form.value = { name: "" };
  editingId.value = undefined;
  formRef.value?.clearValidate?.();
};

const show = () => {
  resetForm();
  modalRef.value?.handleClick({
    title: "新增分组",
    showBtn: true,
    width: "360px",
    okText: "确定",
    cancelText: "取消",
  });
};

const showEdit = (group: ExternalGroup) => {
  editingId.value = group.id;
  form.value.name = group.name;
  formRef.value?.clearValidate?.();
  modalRef.value?.handleClick({
    title: "修改分组",
    showBtn: true,
    width: "360px",
    okText: "确定",
    cancelText: "取消",
  });
};

const onCancel = () => {
  resetForm();
};

const onSubmit = async () => {
  const err = await formRef.value?.validate?.();
  if (err) return;
  const name = form.value.name.trim();
  if (!name) return;
  const payload: GroupSubmitPayload = { name };
  if (editingId.value) {
    payload.id = editingId.value;
  }
  emit("submit", payload);
  modalRef.value?.handleClose();
  resetForm();
};

const close = () => {
  modalRef.value?.handleClose();
  resetForm();
};

defineExpose({ show, showEdit, close });
</script>
