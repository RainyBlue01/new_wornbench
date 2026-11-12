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
      <a-form-item field="groupId" label="目标分组" required>
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
  excludeGroupId?: string | number;
}>();

const emit = defineEmits<{ submit: [groupId: string | number] }>();

const modalRef = ref();
const formRef = ref();
const form = ref({ groupId: "" });

const rules = {
  groupId: [{ required: true, message: "请选择目标分组" }],
};

const groupOptions = computed(() =>
  props.groups
    .filter((g) => String(g.id) !== String(props.excludeGroupId ?? ""))
    .map((g) => ({ label: g.name, value: String(g.id) })),
);

const show = () => {
  form.value.groupId = "";
  formRef.value?.clearValidate?.();
  modalRef.value?.handleClick({
    title: "移入其他分组",
    showBtn: true,
    width: "360px",
    okText: "确定",
    cancelText: "取消",
  });
};

const onCancel = () => {
  form.value.groupId = "";
};

const onSubmit = async () => {
  const err = await formRef.value?.validate?.();
  if (err) return;
  if (!form.value.groupId) {
    Message.warning("请选择目标分组");
    return;
  }
  emit("submit", form.value.groupId);
  modalRef.value?.handleClose();
};

const close = () => {
  modalRef.value?.handleClose();
  form.value.groupId = "";
};

defineExpose({ show, close });
</script>
