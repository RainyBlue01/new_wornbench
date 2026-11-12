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
      <a-form-item field="nickname" label="姓名" required>
        <a-input v-model="form.nickname" placeholder="请输入姓名" allow-clear />
      </a-form-item>
      <a-form-item field="sex" label="性别" required>
        <a-radio-group v-model="form.sex">
          <a-radio :value="1">男</a-radio>
          <a-radio :value="2">女</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="phone" label="电话" required>
        <a-input v-model="form.phone" placeholder="请输入电话" allow-clear />
      </a-form-item>
      <a-form-item field="email" label="邮箱" required>
        <a-input v-model="form.email" placeholder="请输入邮箱" allow-clear />
      </a-form-item>
      <a-form-item field="groupId" label="所属分组">
        <a-select
          v-model="form.groupId"
          placeholder="请选择分组"
          :options="groupOptions"
        />
      </a-form-item>
    </a-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { ExternalGroup } from "../composables/useExternalPage";

const props = defineProps<{
  groups: ExternalGroup[];
  defaultGroupId: string | number;
}>();

const emit = defineEmits<{
  submit: [
    payload: {
      nickname: string;
      sex: number;
      phone: string;
      email: string;
      groupId: string | number;
    },
  ];
}>();

const modalRef = ref();
const formRef = ref();

const form = ref({
  nickname: "",
  sex: 1,
  phone: "",
  email: "",
  groupId: "",
});

const rules = {
  nickname: [{ required: true, message: "请输入姓名" }],
  sex: [{ required: true, message: "请选择性别" }],
  phone: [{ required: true, message: "请输入电话" }],
  email: [
    { required: true, message: "请输入邮箱" },
    { type: "email", message: "邮箱格式不正确" },
  ],
};

const groupOptions = computed(() =>
  props.groups.map((g) => ({
    label: g.name,
    value: String(g.id),
  })),
);

const resetForm = () => {
  form.value = {
    nickname: "",
    sex: 1,
    phone: "",
    email: "",
    groupId: String(props.defaultGroupId ?? ""),
  };
  formRef.value?.clearValidate?.();
};

const show = () => {
  resetForm();
  modalRef.value?.handleClick({
    title: "新增外部成员",
    showBtn: true,
    width: "420px",
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
  emit("submit", { ...form.value });
  modalRef.value?.handleClose();
  resetForm();
};

const close = () => {
  modalRef.value?.handleClose();
  resetForm();
};

defineExpose({ show, close });
</script>
