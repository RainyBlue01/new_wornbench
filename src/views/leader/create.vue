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
      <a-form-item
        validate-trigger="change"
        field="userIds"
        label="分管领导"
        v-if="showUser"
      >
        <selectPerson
          placeholder="分管领导"
          title="选择分管领导"
          v-model="formData.userIds"
          :deptList="deptList"
        />
      </a-form-item>
      <a-form-item field="deptIds" label="分管部门">
        <div class="tree">
          <a-tree
            :default-expand-all="false"
            :checkable="true"
            :virtualListProps="{
              height: 150,
            }"
            :fieldNames="{
              key: 'id',
              title: 'label',
            }"
            v-model:checked-keys="formData.deptIds"
            @check="onCheck"
            :check-strictly="formData.check"
            blockNode
            :data="deptList"
          />
        </div>
      </a-form-item>
      <a-form-item field="check" label="是否关联">
        <a-radio-group v-model="formData.check">
          <a-radio :value="false">是</a-radio>
          <a-radio :value="true">否</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </base-modal>
</template>
<script setup lang="ts">
import { charge } from "@/api/leader/index";
import { ref, reactive, toRaw, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
const refChangeForm = ref();
const fieldNameRole = { value: "id", label: "nickname" };
const props = defineProps<{
  deptList: any;
  roleList: any;
}>();
const modalRef = ref();
const emits = defineEmits(["init"]);
interface FormDataType {
  deptIds?: Array<t>;
  userIds: Array<t>;
  check?: boolean;
}

const showUser = ref(false);
const checkedKeys = ref([]);
const formData = reactive<FormDataType>({
  deptIds: [],
  userIds: [],
  check: true,
});

watch(
  () => formData.userIds,
  (val) => {
    console.log(val);
    if (Array.isArray(val) && val.length > 0) {
      setTimeout(() => {
        refChangeForm.value.clearValidate("userIds");
      });
    }
  },
);
const onCheck = (checkedKeys: any, data: any) => {};

const showItem = (item: any) => {
  if (item) {
    showUser.value = false;
    formData.userIds = [item.id];
    formData.deptIds = item.deptIds;
    modalRef.value.handleClick({
      title: item.nickname + "分管的" + item.deptIds.length + "个部门",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "500px",
    });
  } else {
    showUser.value = true;
    modalRef.value.handleClick({
      title: "新增分管领导",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "500px",
    });
  }
};

const rules = ref({
  deptIds: [
    {
      required: true,
      type: "array",
      message: "请选择分管部门",
    },
  ],
  userIds: [
    {
      required: true,
      type: "array",
      message: "请选择分管领导",
    },
  ],
});
const handleCancel = () => {
  formData.deptIds = "";
  formData.userIds = [];
};
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      let params = {
        ...formData,
      };
      params.userIds = [];
      formData.userIds.map((v1) => {
        params.userIds.push(v1.id);
      });
      charge(params).then(() => {
        Message.success("修改成功");
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
<style lang="scss" scoped>
.tree {
  width: 100%;
}
</style>
