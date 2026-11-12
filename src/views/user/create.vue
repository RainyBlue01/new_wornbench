<template>
  <div>
    <base-modal
      ref="modalRef"
      modal-class="person-modal-wrap"
      @handle-ok="formSubmit"
      @handle-cancel="handleCancel"
    >
      <div class="form person-modal-form">
        <a-form
          ref="refChangeForm"
          :style="{ width: '100%' }"
          :model="formData"
          :rules="rules"
          layout="vertical"
          scroll-to-first-error
        >
          <!-- <a-form-item field="userType" label="用户类型">
            <a-select
              :style="{ width: '100%' }"
              allow-clear
              placeholder="用户类型"
              :options="plainOptions"
              v-model="formData.userType"
            />
          </a-form-item> -->
          <a-form-item field="username" label="账号">
            <a-input
              v-model="formData.username"
              placeholder="账号"
              :max-length="20"
              allow-clear
              show-word-limit
            />
          </a-form-item>
          <a-form-item field="password" label="账号密码">
            <a-input-password
              v-model="formData.password"
              placeholder="账号密码"
              :max-length="20"
              allow-clear
              show-word-limit
            />
          </a-form-item>
          <a-form-item field="nickname" label="昵称">
            <a-input
              v-model="formData.nickname"
              placeholder="昵称"
              :max-length="20"
              allow-clear
              show-word-limit
            />
          </a-form-item>
          <a-form-item field="sex" label="性别">
            <a-select
              :style="{ width: '100%' }"
              allow-clear
              placeholder="性别"
              :options="sexOptions"
              v-model="formData.sex"
            />
          </a-form-item>
          <a-form-item field="phone" label="手机号">
            <a-input
              v-model="formData.phone"
              placeholder="手机号"
              :max-length="11"
              allow-clear
              show-word-limit
            />
          </a-form-item>
          <a-form-item field="email" label="邮箱">
            <a-input
              v-model="formData.email"
              placeholder="邮箱"
              :max-length="100"
              allow-clear
              show-word-limit
            />
          </a-form-item>
          <a-form-item field="documentNumber" label="证件号码">
            <a-input-group :style="{ width: '100%' }">
              <a-select
                :options="documentTypeOptions"
                :field-names="fieldName"
                v-model="formData.documentType"
                :style="{ width: '30%' }"
                placeholder="证件类型"
              />
              <a-input
                :style="{ width: '70%' }"
                v-model="formData.documentNumber"
                placeholder="证件号码"
                :max-length="50"
                allow-clear
                show-word-limit
              />
            </a-input-group>
          </a-form-item>
          <a-form-item field="roleIds" label="关联角色">
            <a-select
              multiple
              :style="{ width: '100%' }"
              :field-names="fieldNameRole"
              allow-clear
              placeholder="关联角色"
              :options="roleList"
              v-model="formData.roleIds"
            />
          </a-form-item>
          <a-form-item field="deptId" label="主要部门">
            <!-- <a-select :style="{ width: '100%' }" allow-clear placeholder="主要部门" :options="deptIdOptions"
          v-model="formData.deptId" /> -->
            <a-cascader
              :options="deptList"
              :field-names="fieldNames"
              v-model="formData.deptId"
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
          <a-form-item field="postIds" label="关联职位">
            <a-select
              multiple
              :style="{ width: '100%' }"
              :field-names="fieldNamePost"
              allow-clear
              placeholder="关联职位"
              :options="postList"
              v-model="formData.postIds"
            />
          </a-form-item>
        </a-form>
      </div>
    </base-modal>
  </div>
</template>
<script setup lang="ts">
import { getCacheList } from "@/api/common/index";
import { addUser } from "@/api/user/index";
import { ref, reactive, toRaw, watch } from "vue";
import { base64Encode } from "@/utils/utils.js";
import { Message, Modal } from "@arco-design/web-vue";
const props = defineProps<{
  deptList: any;
  roleList: any;
  postList: any;
}>();
const refChangeForm = ref();
const modalRef = ref();
const fieldNames = { value: "id", label: "label" };
const fieldName = { value: "dictValue", label: "dictItem" };
const fieldNamePost = { value: "id", label: "postName" };
const fieldNameRole = { value: "id", label: "roleName" };
const format = (options: any) => {
  // const labels = options.map((option: any) => option.institutionName)
  return options[options.length - 1].label;
};
const emits = defineEmits(["init"]);
getCacheList("documentType").then((res) => {
  documentTypeOptions.value = res;
});
const sexOptions = ref([
  { label: "未知", value: 0 },
  { label: "男", value: 1 },
  { label: "女", value: 2 },
]);
const roleIdsOptions = ref([]);
const postIdsOptions = ref([]);
const deptIdOptions = ref([]);
const documentTypeOptions = ref([]);
const plainOptions = [
  { label: "内部用户", value: 1 },
  { label: "外部用户", value: 2 },
];
interface FormDataType {
  userType?: string;
  username?: string;
  password?: string;
  nickname?: string;
  sex?: string;
  phone?: string;
  email?: string;
  documentType?: string;
  documentNumber?: string;
  roleIds?: Array<t>;
  deptId?: Array<t>;
  postIds?: Array<t>;
}
const formData = reactive<FormDataType>({
  userType: 1,
  username: "",
  password: "",
  nickname: "",
  sex: "",
  phone: "",
  email: "",
  documentType: "",
  documentNumber: "",
  roleIds: [],
  deptId: [],
  postIds: [],
});
const showItem = () => {
  modalRef.value.handleClick({
    title: "新增人员",
    okText: "确定",
    cancelText: "取消",
    showBtn: true,
    width: "440px",
  });
};

const rules = ref({
  userType: [
    {
      required: true,
      message: "请输入用户类型",
    },
  ],
  username: [
    {
      required: true,
      message: "请输入账号",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入登录密码",
    },
  ],
  nickname: [
    {
      required: true,
      message: "请输入昵称",
    },
  ],
  sex: [
    {
      required: true,
      message: "请输入性别",
    },
  ],
});
const handleCancel = () => {
  formData.userType = 1;
  formData.username = "";
  formData.password = "";
  formData.nickname = "";
  formData.sex = "";
  formData.phone = "";
  formData.email = "";
  formData.documentType = "";
  formData.documentNumber = "";
  formData.roleIds = [];
  formData.deptId = [];
  formData.postIds = [];
};
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      let params = {
        ...formData,
      };
      params.password = base64Encode(params.password);
      params.deptId =
        Array.isArray(params.deptId) && params.deptId.length > 0
          ? params.deptId[params.deptId.length - 1]
          : "";

      addUser(params).then(() => {
        Message.success("新增成功");
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
@use "@/styles/person-modal.scss";


</style>
