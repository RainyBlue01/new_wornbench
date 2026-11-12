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
        <a-form-item field="name" label="职位名称">
          <a-input
            v-model="formData.name"
            placeholder="职位名称"
            :max-length="20"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="desc" label="职位描述">
          <a-textarea
            v-model="formData.desc"
            placeholder="请输入职位描述"
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
import { addJob, putJob } from "@/api/job/index";
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
    formData.name = item.postName;
    formData.desc = item.postDesc || "";
    formData.id = item.id;
    modalRef.value.handleClick({
      title: "修改职位",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "500px",
    });
  } else {
    modalRef.value.handleClick({
      title: "新增职位",
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
      message: "请输入职位名称",
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
        putJob(params.id, params).then(() => {
          Message.success("修改成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      } else {
        let params = {
          ...formData,
        };
        addJob(params).then(() => {
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
