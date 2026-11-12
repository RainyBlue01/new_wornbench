<template>
  <base-modal
    ref="modalRef"
    modal-class="person-modal-wrap"
    @handle-ok="formSubmit"
    @handle-cancel="handleCancel"
  >
    <div v-if="setType === 1" class="person-modal-info">
      <p style="margin: 0">
        人员：<strong>{{ display.nickname || "-" }}</strong>
      </p>
      <p style="margin: 4px 0 0">
        当前部门：<strong>{{ display.deptName || "-" }}</strong>
        · 当前职位：<strong>{{ display.postName || "-" }}</strong>
      </p>
    </div>
    <div class="person-modal-form">
      <a-form
        ref="refChangeForm"
        :style="{ width: '100%' }"
        :model="formData"
        :rules="rules"
        layout="vertical"
        scroll-to-first-error
      >
        <a-form-item field="deptId" label="目标部门">
          <a-cascader
            v-model="formData.deptId"
            :options="deptList"
            :field-names="fieldNames"
            path-mode
            allow-clear
            allow-search
            :format-label="format"
            :style="{ width: '100%' }"
            placeholder="请选择目标部门"
            check-strictly
          />
        </a-form-item>
        <a-form-item field="postIds" label="目标职位">
          <a-select
            v-model="formData.postIds"
            multiple
            :style="{ width: '100%' }"
            :field-names="fieldNamePost"
            allow-clear
            placeholder="请选择目标职位"
            :options="postList"
          />
        </a-form-item>
      </a-form>
    </div>
    <div v-if="setType === 1" class="person-modal-tip">
      <icon-info-circle class="person-modal-tip__icon" />
      人员调动到其他部门之后，不保留原部门的相关职位；但是不影响调动之前的相关流程审批。
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { addPartTimeDept, updateDept } from "@/api/user/index";
import { ref, reactive } from "vue";
import { Message } from "@arco-design/web-vue";
import { IconInfoCircle } from "@arco-design/web-vue/es/icon";

const props = defineProps<{
  deptList: any[];
  postList: any[];
}>();

const format = (options: any) => options[options.length - 1]?.label ?? "";
const refChangeForm = ref();
const modalRef = ref();
const setType = ref(1);
const fieldNames = { value: "id", label: "label" };
const fieldNamePost = { value: "id", label: "postName" };

const emits = defineEmits(["init"]);

const display = reactive({
  nickname: "",
  deptName: "",
  postName: "",
});

interface FormDataType {
  userId?: string | number;
  deptId?: any;
  postIds?: (string | number)[];
}

const formData = reactive<FormDataType>({
  userId: "",
  deptId: "",
  postIds: [],
});

const showItem = (item: any, val: number) => {
  setType.value = val;
  // if (val !== 1) return;
  formData.userId = item.userId;
  formData.deptId = item.deptId ? item.deptId : [];
  formData.postIds = [];
  display.nickname = item.nickname || "";
  display.deptName = item.deptName || "-";
  if (Array.isArray(item.userPostList) && item.userPostList.length) {
    display.postName = item.userPostList.map((p: any) => p.postName).join("、");
    item.userPostList.forEach((p: any) => formData.postIds!.push(p.postId));
  } else {
    display.postName = "-";
  }
  modalRef.value.handleClick({
    title: "部门调动",
    okText: "确定",
    cancelText: "取消",
    showBtn: true,
    width: "420px",
  });
};

const rules = ref({
  deptId: [{ required: true, message: "请选择部门" }],
});

const handleCancel = () => {
  setType.value = 1;
  formData.deptId = "";
  formData.userId = "";
  formData.postIds = [];
  display.nickname = "";
  display.deptName = "";
  display.postName = "";
};

const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (error) return;
    const params: any = { ...formData };
    params.deptId = Array.isArray(params.deptId) && params.deptId.length > 0
      ? params.deptId[params.deptId.length - 1]
      : params.deptId || "";
    updateDept(params).then(() => {
      Message.success("调动成功");
      handleCancel();
      modalRef.value.handleClose();
      emits("init");
    });
  });
};

defineExpose({ showItem });
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss";
</style>
