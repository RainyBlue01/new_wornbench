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
        <a-form-item field="deptName" label="部门名称">
          <a-input
            v-model="formData.deptName"
            placeholder="请输入部门名称"
            :max-length="20"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="deptNumber" label="部门编码">
          <a-input
            v-model="formData.deptNumber"
            placeholder="请输入部门编码"
            :max-length="50"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="deptType" label="机构类型">
          <a-select
            :style="{ width: '100%' }"
            :field-names="fieldName"
            allow-clear
            placeholder="部门类型"
            :options="typeOptions"
            v-model="formData.deptType"
          />
        </a-form-item>
        <a-form-item label="父级部门">
          <a-cascader
            :options="createData"
            :field-names="fieldNames"
            v-model="formData.parentId"
            :trigger-props="{ autoFitPopupMinWidth: true }"
            path-mode
            allow-clear
            allow-search
            :format-label="format"
            :style="{ width: '100%' }"
            placeholder="请选择父级部门"
            check-strictly
          />
        </a-form-item>
      </a-form>
    </base-modal>
  </div>
</template>
<script setup lang="ts">
import { addDept, putDept } from "@/api/department/index";
import { getCacheList } from "@/api/common/index";
import { ref, reactive, toRaw, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
const refChangeForm = ref();
const modalRef = ref();
const typeOptions = ref([]);
const fieldNames = { value: "id", label: "label" };
const fieldName = { value: "dictValue", label: "dictItem" };
const format = (options: any) => {
  console.log(options);
  // const labels = options.map((option: any) => option.institutionName)
  return options[options.length - 1].label;
};
const props = defineProps<{
  createData: any;
}>();
const emits = defineEmits(["init"]);
interface FormDataType {
  deptName?: string;
  parentId?: Array<t>;
  deptNumber?: string;
  deptType?: string;
}
const formData = reactive<FormDataType>({
  deptName: "",
  deptType: "",
  deptNumber: "",
  parentId: [],
});
getCacheList("deptClassify").then((res) => {
  typeOptions.value = res;
});
const showItem = (item: any) => {
  handleCancel();
  if (item) {
    formData.parentId = item;
  }
  modalRef.value.handleClick({
    title: "新增部门",
    okText: "完成",
    cancelText: "关闭",
    showBtn: true,
    width: "500px",
  });
};
const updateItem = (item: any) => {
  handleCancel();
  if (item) {
    formData.id = item.id;
    formData.deptName = item.label;
    formData.deptType = item.deptType;
    formData.deptNumber = item.deptNumber;
    formData.parentId = item.parentId !== "0" ? [item.parentId] : "";
  }
  modalRef.value.handleClick({
    title: "修改部门",
    okText: "完成",
    cancelText: "关闭",
    showBtn: true,
    width: "500px",
  });
};

const rules = ref({
  deptName: [
    {
      required: true,
      message: "请输入部门名称",
    },
  ],
  deptNumber: [
    {
      required: true,
      message: "请输入部门号码",
    },
  ],
  deptType: [
    {
      required: true,
      message: "请输入部门类型",
    },
  ],
});
const handleCancel = () => {
  formData.id = "";
  formData.parentId = "";
  formData.deptName = "";
  formData.deptNumber = "";
  formData.deptType = "";
};
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      if (formData.id) {
        let params = {
          ...formData,
        };
        params.parentId =
          Array.isArray(params.parentId) && params.parentId.length > 0
            ? params.parentId[params.parentId.length - 1]
            : 0;
        putDept(formData.id, params).then(() => {
          Message.success("修改成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      } else {
        let params = {
          ...formData,
        };
        params.parentId =
          Array.isArray(params.parentId) && params.parentId.length > 0
            ? params.parentId[params.parentId.length - 1]
            : 0;
        addDept(params).then(() => {
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
  updateItem,
});
</script>
<style lang="scss" scoped></style>
