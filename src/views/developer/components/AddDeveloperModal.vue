<script setup lang="ts">
import { computed, reactive, watch } from "vue";

const props = defineProps<{
  visible: boolean;
  editData: { id: string; developer: string; serverAddress?: string } | null;
}>();

const emit = defineEmits<{
  "update:visible": [visible: boolean];
  success: [payload: { id?: string; developer: string; serverAddress: string }];
}>();

const formModel = reactive({
  id: "",
  developer: "",
  intro: "",
});

const formTitle = computed(() => (props.editData?.id ? "修改开发者" : "新增开发者"));

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    formModel.id = props.editData?.id || "";
    formModel.developer = props.editData?.developer || "";
    formModel.intro = props.editData?.intro || "";
  },
  { immediate: true },
);

const close = () => emit("update:visible", false);

const submit = () => {
  if (!formModel.developer.trim()) return;
  emit("success", {
    id: formModel.id || undefined,
    developer: formModel.developer.trim(),
    intro: formModel.intro.trim(),
  });
};
</script>

<template>
  <a-modal :visible="visible" :title="formTitle" :width="520" :mask-closable="false" @ok="submit" @cancel="close">
    <a-form layout="vertical" :model="formModel">
      <a-form-item field="developer" label="开发者名称" required>
        <a-input v-model="formModel.developer" placeholder="请输入开发者名称" />
      </a-form-item>
      <a-form-item field="intro" label="描述">
        <a-textarea v-model="formModel.intro" placeholder="请输入描述" :max-length="50" allow-clear show-word-limit />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
