<template>
  <div>
    <base-modal
      ref="modalRef"
      @handle-ok="formSubmit"
      @handle-cancel="handleCancel"
    >
      <a-form
        ref="refChangeForm"
        v-if="showList == 1"
        :style="{ width: '100%' }"
        :model="formData"
        :rules="rules"
        layout="vertical"
        scroll-to-first-error
      >
        <a-form-item field="catalogue" label="字典目录">
          <a-input
            v-model="formData.catalogue"
            placeholder="字典目录"
            :max-length="20"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="catalogueCode" label="目录编码">
          <a-input
            v-model="formData.catalogueCode"
            placeholder="目录编码"
            :max-length="20"
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
      <a-form
        ref="refChangeForm"
        v-if="showList == 2"
        :style="{ width: '100%' }"
        :model="formDatas"
        :rules="rules"
        layout="vertical"
        scroll-to-first-error
      >
        <a-form-item field="dictItem" label="字段项">
          <a-input
            v-model="formDatas.dictItem"
            placeholder="字段项"
            :max-length="20"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="dictCode" label="字典编码">
          <a-input
            v-model="formDatas.dictCode"
            placeholder="字典编码"
            :max-length="20"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="dictValue" label="字段值">
          <a-input
            v-model="formDatas.dictValue"
            placeholder="字段值"
            :max-length="100"
            allow-clear
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="sortOrder" label="排序号">
          <a-input-number
            v-model="formDatas.sortOrder"
            placeholder="排序号"
            :min="0"
            :max="1000"
            allow-clear
            show-word-limit
          />
        </a-form-item>
      </a-form>
    </base-modal>
  </div>
</template>
<script setup lang="ts">
import {
  addCatalogue,
  putCatalogue,
  addDict,
  putDict,
} from "@/api/dictionaryList/index";
import { ref, reactive, toRaw, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
const refChangeForm = ref();
const modalRef = ref();
const emits = defineEmits(["init"]);
interface FormDataType {
  catalogue?: string;
  catalogueCode?: string;
  sortOrder?: number;
}
interface FormDataTypes {
  catalogueId?: string;
  dictCode?: string;
  dictItem?: string;
  dictValue?: string;
  sortOrder?: number;
}
const formDatas = reactive<FormDataTypes>({
  catalogueId: "",
  dictCode: "",
  dictItem: "",
  sortOrder: 0,
  dictValue: "",
});
const formData = reactive<FormDataType>({
  catalogue: "",
  catalogueCode: "",
  sortOrder: 0,
});
const showList = ref(1);
const showItem = (val: any, item: any) => {
  showList.value = val;
  if (val == 1) {
    if (item.id) {
      formData.id = item.id;
      formData.catalogue = item.catalogue;
      formData.catalogueCode = item.catalogueCode;
      formData.sortOrder = item.sortOrder;
      modalRef.value.handleClick({
        title: "修改字典目录",
        okText: "完成",
        cancelText: "关闭",
        showBtn: true,
        width: "500px",
      });
    } else {
      modalRef.value.handleClick({
        title: "新增字典目录",
        okText: "完成",
        cancelText: "关闭",
        showBtn: true,
        width: "500px",
      });
    }
  } else {
    if (item && item.id) {
      formDatas.id = item.id;
      formDatas.catalogueId = item.catalogueId;
      formDatas.dictItem = item.dictItem;
      formDatas.dictCode = item.dictCode;
      formDatas.dictValue = item.dictValue;
      formDatas.sortOrder = item.sortOrder;
      modalRef.value.handleClick({
        title: "修改字典目录",
        okText: "完成",
        cancelText: "关闭",
        showBtn: true,
        width: "500px",
      });
    } else {
      formDatas.catalogueId = item.catalogueId;
      modalRef.value.handleClick({
        title: "新增字典目录",
        okText: "完成",
        cancelText: "关闭",
        showBtn: true,
        width: "500px",
      });
    }
  }
};

const rules = ref({
  catalogue: [
    {
      required: true,
      message: "请输入字典目录",
    },
  ],
  catalogueCode: [
    {
      required: true,
      message: "请输入目录编码",
    },
  ],
  catalogueId: [
    {
      required: true,
      message: "请选择字典目录",
    },
  ],
  dictItem: [
    {
      required: true,
      message: "请输入字段项",
    },
  ],
  dictCode: [
    {
      required: true,
      message: "请输入字典编码",
    },
  ],
  dictValue: [
    {
      required: true,
      message: "请输入字段值",
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
  formDatas.catalogueId = "";
  formDatas.id = "";
  formDatas.dictItem = "";
  formDatas.dictCode = "";
  formDatas.dictValue = "";
  formDatas.sortOrder = "";
  formData.catalogue = "";
  formData.catalogueCode = "";
  formData.sortOrder = "";
  formData.id = "";
};
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      if (showList.value == 1) {
        if (formData.id) {
          let params = {
            ...formData,
          };
          putCatalogue(params.id, params).then(() => {
            Message.success("修改成功");
            handleCancel();
            modalRef.value.handleClose();
            emits("init", showList.value);
          });
        } else {
          let params = {
            ...formData,
          };
          addCatalogue(params).then(() => {
            Message.success("新增成功");
            handleCancel();
            modalRef.value.handleClose();
            emits("init", showList.value);
          });
        }
      } else {
        if (formDatas.id) {
          let params = {
            ...formDatas,
          };
          putDict(params.id, params).then(() => {
            Message.success("修改成功");
            handleCancel();
            modalRef.value.handleClose();
            emits("init", showList.value);
          });
        } else {
          let params = {
            ...formDatas,
          };
          addDict(params).then(() => {
            Message.success("新增成功");
            handleCancel();
            modalRef.value.handleClose();
            emits("init", showList.value);
          });
        }
      }
    }
  });
};
defineExpose({
  showItem,
});
</script>
<style lang="scss" scoped></style>
<style lang="scss">
@use '@/styles/person-modal.scss';
</style>
