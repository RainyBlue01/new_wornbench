<template>
  <base-modal
    ref="modalRef"
    @handle-ok="formSubmit"
    @handle-cancel="handleCancel"
  >
    <a-form
      ref="refChangeForm"
      :style="{ width: '100%' }"
      :model="formData"
      :rules="rules"
      layout="vertical"
      scroll-to-first-error
    >
      <a-form-item field="category" label="分类名称">
        <a-input
          v-model="formData.category"
          placeholder="分类名称"
          :max-length="20"
          allow-clear
          show-word-limit
        />
      </a-form-item>
      <a-form-item field="intro" label="分类描述">
        <a-textarea
          placeholder="分类描述"
          v-model="formData.intro"
          :max-length="100"
          allow-clear
          show-word-limit
        />
      </a-form-item>
      <a-form-item field="sortOrder" label="排序号">
        <a-input-number
          v-model="formData.sortOrder"
          placeholder="排序号"
          :min="0"
          :max="1000"
          allow-clear
          show-word-limit
        />
      </a-form-item>
    </a-form>
  </base-modal>
</template>
<script setup lang="ts">
import { addCategory, putCategory } from "@/api/category/index";
import { ref, reactive, toRaw, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
const refChangeForm = ref();
const props = defineProps<{
  deptList: any;
  roleList: any;
}>();
const modalRef = ref();
const emits = defineEmits(["init"]);
interface FormDataType {
  category: string;
  intro: string;
  sortOrder: number;
}
const showUser = ref(false);
const checkedKeys = ref([]);
const formData = reactive<FormDataType>({
  category: "",
  intro: "",
  sortOrder: 1,
});
const showItem = (item: any) => {
  if (item) {
    formData.id = item.id;
    formData.intro = item.intro;
    formData.sortOrder = item.sortOrder;
    formData.category = item.category;
    modalRef.value.handleClick({
      title: "修改应用分类",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "500px",
    });
  } else {
    modalRef.value.handleClick({
      title: "新增应用分类",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "500px",
    });
  }
};

const rules = ref({
  category: [
    {
      required: true,
      message: "请输入分类名称",
    },
  ],
  sortOrder: [
    {
      required: true,
      message: "请输入排序号",
    },
  ],
});
const handleCancel = () => {
  formData.id = "";
  formData.intro = "";
  formData.sortOrder = 1;
  formData.category = "";
};
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      if (formData.id) {
        let params = {
          ...formData,
        };
        putCategory(params, params.id).then(() => {
          Message.success("修改成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      } else {
        let params = {
          ...formData,
        };
        addCategory(params).then(() => {
          Message.success("新增成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      }
    }
  });
};
defineExpose({
  showItem,
});
</script>
<style lang="scss" scoped></style>
