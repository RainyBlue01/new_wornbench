<template>
  <div>
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
        <a-form-item field="name" label="角色名称">
          <a-input
            v-model="formData.name"
            placeholder="角色名称"
            :max-length="20"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="desc" label="角色描述">
          <a-textarea
            v-model="formData.desc"
            placeholder="请输入角色描述"
            :max-length="200"
            allow-clear
            show-word-limit
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </base-modal>
  </div>
</template>
<script setup lang="ts">
import { addRole, putRole } from "@/api/role/index";
import { ref, reactive, toRaw, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
const refChangeForm = ref();
const modalRef = ref();
const emits = defineEmits(["init"]);
interface FormDataType {
  name?: string;
  desc?: string;
  id?: string;
}
const formData = reactive<FormDataType>({
  name: "",
  desc: "",
});
const showItem = (item: any) => {
  if (item) {
    formData.name = item.roleName;
    formData.desc = item.roleDesc || "";
    formData.id = item.id;
    modalRef.value.handleClick({
      title: "修改角色",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "500px",
    });
  } else {
    modalRef.value.handleClick({
      title: "新增角色",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "500px",
    });
  }
};

const rules = ref({
  name: [
    {
      required: true,
      message: "请输入角色名称",
    },
  ],
});
const handleCancel = () => {
  formData.name = "";
  formData.desc = "";
  formData.id = "";
};
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      if (formData.id) {
        let params = {
          ...formData,
        };
        putRole(params.id, params).then(() => {
          Message.success("修改成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      } else {
        let params = {
          ...formData,
        };
        addRole(params).then(() => {
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
