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
        <a-form-item field="groupName" label="安全组名称">
          <a-input
            v-model="formData.groupName"
            placeholder="请输入安全组名称"
            :max-length="20"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="intro" label="安全组描述">
          <a-input
            v-model="formData.intro"
            placeholder="请输入安全组描述"
            :max-length="50"
            allow-clear
            show-word-limit
          />
        </a-form-item>
      </a-form>
    </base-modal>
  </div>
</template>
<script setup lang="ts">
import { addGroup, putGroup } from "@/api/securityCenter";
import { ref, reactive, toRaw, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
const refChangeForm = ref();
const modalRef = ref();
const emits = defineEmits(["init"]);
interface securityGroup {
  id?: string;
  groupName?: string;
  intro?: string;
}
const formData = reactive<securityGroup>({
  id: "",
  groupName: "",
  intro: "",
});
const showItem = (item: any) => {
  if (item) {
    formData.id = item.id;
    formData.groupName = item.groupName;
    formData.intro = item.intro;
    modalRef.value.handleClick({
      title: "修改安全组",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "500px",
    });
  } else {
    modalRef.value.handleClick({
      title: "新增安全组",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "500px",
    });
  }
};

const rules = ref({
  groupName: [
    {
      required: true,
      message: "请输入安全组名称",
    },
  ],
});
const handleCancel = () => {
  formData.groupName = "";
  formData.id = "";
  formData.intro = "";
};
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      if (formData.id) {
        let params = {
          ...formData,
        };
        putGroup(formData.id, params).then((res) => {
          Message.success("修改成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      } else {
        let params = {
          ...formData,
        };
        addGroup(params).then(() => {
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
