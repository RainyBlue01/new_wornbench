<template>
  <base-modal ref="modalRef" @handle-ok="formSubmit" @handle-cancel="handleCancel">
    <a-form ref="refChangeForm" :style="{ width: '100%' }" :model="formData" :rules="rules" layout="vertical"
      scroll-to-first-error>
      <a-form-item field="developer" label="开发者">
        <a-input v-model="formData.developer" placeholder="请输入开发者名称" :max-length="20" allow-clear show-word-limit />
      </a-form-item>
      <a-form-item field="intro" label="描述">
        <a-textarea v-model="formData.intro" placeholder="请输入描述" :max-length="50" allow-clear show-word-limit />
      </a-form-item>
    </a-form>
  </base-modal>
</template>
<script setup lang="ts">
import { setSeveloper, putSeveloper } from "@/api/developer/index";
import { ref, reactive, toRaw, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
const refChangeForm = ref();
const modalRef = ref();
const emits = defineEmits(["init"]);
interface FormDataType {
  developer?: string;
  serverAddress?: string;
}

const showUser = ref(false);
const checkedKeys = ref([]);
const formData = reactive<FormDataType>({
  developer: "",
  serverAddress: "",
});
const showItem = (item: any) => {
  if (item) {
    formData.id = item.id;
    formData.developer = item.developer;
    formData.serverAddress = item.serverAddress;
    modalRef.value.handleClick({
      title: "修改 Webhook",
      okText: "确定",
      cancelText: "取消",
      showBtn: true,
      width: "500px",
    });
  } else {
    modalRef.value.handleClick({
      title: "新增 Webhook",
      okText: "确定",
      cancelText: "取消",
      showBtn: true,
      width: "500px",
    });
  }
};

const rules = ref({
  developer: [
    {
      required: true,
      message: "请输入开发者名称",
    },
  ],
  serverAddress: [
    {
      required: true,
      message: "请输入服务器地址",
    },
    {
      required: true,
      type: "url",
      message: "请输入正确的地址",
    },
  ],
});
const handleCancel = () => {
  formData.developer = "";
  formData.serverAddress = "";
};
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      if (formData.id) {
        let params = {
          ...formData,
        };
        putSeveloper(params).then(() => {
          Message.success("修改成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      } else {
        let params = {
          ...formData,
        };
        setSeveloper(params).then(() => {
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
<style lang="scss" scoped>
.tree {
  width: 100%;
}
</style>
