<template>
  <div class="app">
    <base-modal
      ref="modalRef"
      modal-class="person-modal-wrap create-app-modal"
      :mask-style="{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
      }"
      @handle-ok="formSubmit"
      @handle-cancel="handleCancel"
      body-style="overflow: visible;"
    >
      <a-form
        ref="refChangeForm"
        :style="{ width: '100%' }"
        :model="formData"
        :rules="rules"
        layout="vertical"
        scroll-to-first-error
      >
        <a-form-item field="appName" label="应用名称">
          <a-input
            v-model="formData.appName"
            placeholder="应用名称"
            :max-length="50"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="category" label="应用类型">
          <a-select
            allow-search
            :style="{ width: '100%' }"
            allow-clear
            placeholder="应用类型"
            :options="roleList"
            v-model="formData.category"
          />
        </a-form-item>
        <a-form-item field="categoryIds" label="应用分类">
          <a-select
            allow-search
            multiple
            :style="{ width: '100%' }"
            :field-names="fieldNames"
            allow-clear
            placeholder="应用分类"
            :options="classList"
            v-model="formData.categoryIds"
          />
        </a-form-item>
        <a-form-item field="intro" label="内容">
          <a-textarea
            placeholder="内容"
            v-model="formData.intro"
            :max-length="50"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="attach" hide-label class="icon-form-item">
          <AppIconSelector
            v-model="formData.icon"
            v-model:show-icon="formData.showIcon"
          />
        </a-form-item>
      </a-form>
    </base-modal>
  </div>
</template>
<script setup lang="ts">
import { addApp } from "@/api/homePage/index";
import { getCategoryCache } from "@/api/common/index";
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";
import AppIconSelector from "@/components/AppIconSelector.vue";
const refChangeForm = ref();
const fieldNames = { value: "id", label: "category" };
const roleList = [
  { label: "普通表单", value: 1 },
  { label: "流程表单", value: 2 },
  { label: "简单报表", value: 3 },
];
const classList = ref([]);
const modalRef = ref();
const emits = defineEmits(["init"]);

interface FormDataType {
  appName?: string;
  intro?: string;
  categoryIds?: Array<any>;
  category?: string | number;
  icon: string | number | null;
  showIcon: string | number | null;
}
const formData = reactive<FormDataType>({
  appName: "",
  icon: "",
  showIcon: "",
  intro: "",
  category: 1,
  categoryIds: [],
});
const showItem = (category?: number) => {
  formData.category = category ?? 1;
  modalRef.value.handleClick({
    title: "创建应用",
    okText: "确定",
    cancelText: "取消",
    showBtn: true,
    width: "480px",
  });
};
onMounted(() => {
  getCategoryCache().then((res) => {
    classList.value = res;
  });
});

const rules = ref({
  appName: [
    {
      required: true,
      message: "请输入应用名称",
    },
  ],
  categoryIds: [
    {
      required: true,
      type: "array",
      message: "请选择应用分类",
    },
  ],
  category: [
    {
      required: true,
      message: "请选择应用类型",
    },
  ],
});
const handleCancel = () => {
  formData.icon = "";
  formData.showIcon = "";
  formData.appName = "";
  formData.intro = "";
  formData.category = 1;
  formData.categoryIds = [];
};
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      addApp({ ...formData }).then(() => {
        Message.success("新增成功");
        handleCancel();
        modalRef.value.handleClose();
        emits("init");
      });
    }
  });
};

defineExpose({
  showItem,
});
</script>
