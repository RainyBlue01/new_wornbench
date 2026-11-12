<template>
  <div class="app-manage-page base-msg">
    <h2 class="app-manage-page-title">基本信息</h2>
    <a-form
      ref="refChangeForm"
      class="app-manage-form"
      :model="formData"
      :rules="rules"
      layout="vertical"
      scroll-to-first-error
    >
      <a-form-item field="appName" label="应用名称" required>
        <a-input
          v-model="formData.appName"
          placeholder="请输入应用名称"
          :max-length="50"
          allow-clear
          show-word-limit
        />
      </a-form-item>
      <a-form-item field="category" label="应用类型" required>
        <a-select
          v-model="formData.category"
          disabled
          allow-search
          allow-clear
          placeholder="应用类型"
          :options="roleList"
        />
      </a-form-item>
      <a-form-item field="categoryIds" label="应用分类" required>
        <a-select
          v-model="formData.categoryIds"
          multiple
          allow-search
          allow-clear
          placeholder="应用分类"
          :field-names="fieldNames"
          :options="classList"
        />
      </a-form-item>
      <a-form-item field="intro" label="内容">
        <a-textarea
          v-model="formData.intro"
          placeholder="请输入应用描述"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject } from "vue";
import { useRoute } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { putApp } from "@/api/homePage/index";
import { getCategoryCache } from "@/api/common/index";
import AppIconSelector from "@/components/AppIconSelector.vue";

const route = useRoute();
const refChangeForm = ref();
const getAppId = inject("appId", () => route.query.id) as () => any;
const fieldNames = { value: "id", label: "category" };

const roleList = [
  { label: "普通表单", value: 1 },
  { label: "流程表单", value: 2 },
  { label: "报表", value: 3 },
];

const props = defineProps<{
  appdes: any;
}>();

const emits = defineEmits(["handleCancel"]);

interface FormDataType {
  appName?: string;
  intro?: string;
  categoryIds?: string[];
  category?: string | number;
  icon: string | number | null;
  showIcon: string | number | null;
}

const formData = reactive<FormDataType>({
  appName: props.appdes.appName || "",
  icon: props.appdes.icon || "",
  showIcon: props.appdes.showIcon || "",
  intro: props.appdes.intro || "",
  category: props.appdes.category || "",
  categoryIds: props.appdes.categoryIds || [],
});

const classList = ref([]);
getCategoryCache().then((res) => {
  classList.value = res;
});

const rules = {
  appName: [{ required: true, message: "请输入应用名称" }],
  categoryIds: [{ required: true, message: "请选择应用分类" }],
  category: [{ required: true, message: "请选择应用类型" }],
};

const resetForm = () => {
  formData.icon = "";
  formData.showIcon = "";
  formData.appName = "";
  formData.intro = "";
  formData.category = "";
  formData.categoryIds = [];
};

const handClear = () => {
  resetForm();
  emits("handleCancel");
};

const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      putApp({ ...formData }, getAppId()).then(() => {
        Message.success("修改成功");
        handClear();
      });
    }
  });
};

defineExpose({
  formSubmit,
  handClear,
});
</script>

<style lang="scss" scoped>
@use "@/styles/app-manage.scss" as appManage;
.base-msg::v-deep{
  .arco-select-view-inner{
    padding:  0 !important;
  }
  .arco-select-view{
    padding: 6px 8px !important;
  }
}

.base-msg {
  padding-bottom: 32px;

  .app-manage-form {
    flex: 1;
    padding-bottom: 10px;
    @include appManage.app-manage-form;

    .icon-form-item {
      margin-bottom: 0;
    }
  }
}
</style>
