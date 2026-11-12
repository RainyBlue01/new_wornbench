<template>
  <div>
    <base-modal
      ref="modalRef"
      modal-class="person-modal-wrap"
      @handle-ok="formSubmit"
      @handle-cancel="handleCancel"
    >
      <a-tabs @change="changeTabs" v-model="active">
        <a-tab-pane key="1" title="用户信息">
          <div class="form person-modal-form">
            <a-form
              ref="refChangeForm"
              :style="{ width: '100%' }"
              :model="formData"
              :rules="rules"
              layout="vertical"
              scroll-to-first-error
            >
              <a-form-item field="userType" label="用户类型">
                <a-select
                  :style="{ width: '100%' }"
                  allow-clear
                  placeholder="用户类型"
                  :options="plainOptions"
                  v-model="formData.userType"
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
            </a-form>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" title="部门单位" v-if="userData.userType == 1">
          <tableDept
            @init="getItem"
            :userData="userData"
            :deptList="deptList"
            :postList="postList"
          />
        </a-tab-pane>
        <a-tab-pane key="3" title="角色" v-if="userData.userType == 1">
          <div class="form person-modal-form">
            <a-form
              ref="refRoleForm"
              :style="{ width: '100%' }"
              :model="formData"
              :rules="rules"
              layout="vertical"
              scroll-to-first-error
            >
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
            </a-form>
          </div>
        </a-tab-pane>
        <a-tab-pane key="4" title="管理" v-if="userData.userType == 1">
          <div class="form">
            <a-form
              ref="refManngeForm"
              :style="{ width: '100%' }"
              :model="formData"
              :rules="rulesPass"
              layout="vertical"
              scroll-to-first-error
            >
              <a-form-item field="roleIds" label="在职状态">
                <a-input readonly v-model="formData.activeTitle"></a-input>
              </a-form-item>
              <a-form-item field="roleIds" label="管理">
                <a-select
                  :style="{ width: '100%' }"
                  allow-clear
                  placeholder="管理"
                  :options="editTypeList"
                  v-model="formData.editType"
                />
              </a-form-item>
              <a-form-item
                field="password"
                v-if="formData.editType === 0"
                label="新密码"
              >
                <a-input-password
                  v-model="formData.password"
                  placeholder="新密码"
                  :max-length="50"
                  allow-clear
                  show-word-limit
                />
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>
    </base-modal>
  </div>
</template>
<script setup lang="ts">
import { getCacheList } from "@/api/common/index";
import {
  putUser,
  updateRole,
  changeState,
  changeActive,
  resetPassword,
  changeIdentity,
  addPartTimeDept,
  dismissPartTimeDept,
} from "@/api/user/index";
import { ref, reactive, toRaw, watch } from "vue";
import tableDept from "./tableDept.vue";
import { Message, Modal } from "@arco-design/web-vue";
import { base64Encode } from "@/utils/utils.js";
const props = defineProps<{
  deptList: any;
  roleList: any;
  postList: any;
}>();
const refChangeForm = ref();
const modalRef = ref();
const active = ref("1");
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
const editTypeList = ref([
  { label: "重置密码", value: 0 },
  { label: "登录锁定", value: 1 },
  { label: "离职", value: 2 },
]);
const loginStateList = ref([
  { label: "禁用", value: 0 },
  { label: "启用", value: 1 },
]);
const sexOptions = ref([
  { label: "未知", value: 0 },
  { label: "男", value: 1 },
  { label: "女", value: 2 },
]);
const roleIdsOptions = ref([]);
const postIdsOptions = ref([]);
const deptIdOptions = ref([]);
const userData = ref({});
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
  active?: string;
  loginState?: string;
  sex?: string;
  phone?: string;
  email?: string;
  editType?: string;
  documentType?: string;
  documentNumber?: string;
  roleIds?: Array<t>;
  deptId?: Array<t>;
  postIds?: Array<t>;
}
const formData = reactive<FormDataType>({
  userType: 1,
  username: "",
  editType: "",
  loginState: "",
  active: "",
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
const showItem = (val: any) => {
  userData.value = val;
  formData.userType = val.userType;
  formData.nickname = val.nickname;
  formData.sex = val.sex;
  formData.phone = val.phone;
  formData.email = val.email;
  formData.loginState = val.loginState;
  formData.active = val.active;
  formData.documentType = val.documentType;
  formData.active = val.active;
  val.userRoleList.map((v) => {
    formData.roleIds.push(v.roleId);
  });
  if (val.loginState == 1 && val.active === 1) {
    editTypeList.value = [
      { label: "重置密码", value: 0 },
      { label: "登录锁定", value: 1 },
      { label: "离职", value: 2 },
    ];
  } else if (val.loginState == 0 && val.active === 1) {
    editTypeList.value = [{ label: "解除锁定", value: 1 }];
  } else if (val.active === 0) {
    editTypeList.value = [{ label: "返聘", value: 2 }];
  }
  formData.documentNumber = val.documentNumber;
  formData.activeTitle = val.active == 1 ? "在职" : "离职";
  modalRef.value.handleClick({
    title: "编辑人员",
    okText: "确定",
    cancelText: "取消",
    showBtn: true,
    width: "820px",
  });
};

const rulesPass = ref({
  password: [
    {
      required: true,
      message: "请输入新密码",
    },
  ],
});
const rules = ref({
  userType: [
    {
      required: true,
      message: "请输入用户类型",
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
const changeTabs = (val: any) => {
  active.value = val;
};
const handleCancel = () => {
  formData.userType = 1;
  formData.username = "";
  formData.password = "";
  formData.nickname = "";
  formData.loginState = "";
  formData.active = "";
  formData.sex = "";
  formData.editType = "";
  formData.phone = "";
  formData.email = "";
  formData.documentType = "";
  formData.documentNumber = "";
  formData.roleIds = [];
  formData.deptId = [];
  formData.postIds = [];
  active.value = "1";
};
const formSubmit = () => {
  if (active.value == "1") {
    refChangeForm.value.validate((error: any) => {
      if (!error) {
        let params = {
          userType: formData.userType,
          nickname: formData.nickname,
          sex: formData.sex,
          phone: formData.phone,
          email: formData.email,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
        };
        putUser(userData.value.id, params).then((res) => {
          Message.success("修改用户信息成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      }
    });
  } else if (active.value == "2") {
    handleCancel();
    modalRef.value.handleClose();
  } else if (active.value == "3") {
    let params = {
      roleIds: formData.roleIds,
      userId: userData.value.id,
    };
    updateRole(params).then((res) => {
      Message.success("修改角色成功");
      handleCancel();
      modalRef.value.handleClose();
      emits("init");
    });
  } else if (active.value == "4") {
    if (formData.editType == 0) {
      let params = {
        userId: userData.value.id,
        password: base64Encode(formData.password),
      };
      resetPassword(params).then((res) => {
        Message.success("重置密码成功");
        handleCancel();
        modalRef.value.handleClose();
        emits("init");
      });
    } else if (formData.editType == 1) {
      let params = {
        userId: userData.value.id,
        loginState: formData.loginState == 1 ? 0 : 1,
      };
      changeState(params).then((res) => {
        Message.success(
          (formData.loginState == 1 ? "登陆锁定" : "解除锁定") + "成功",
        );
        handleCancel();
        modalRef.value.handleClose();
        emits("init");
      });
    } else if (formData.editType == 2) {
      let params = {
        userId: userData.value.id,
        active: formData.active == 1 ? 0 : 1,
      };
      changeActive(params).then((res) => {
        Message.success((formData.active == 1 ? "离职" : "返聘") + "成功");
        handleCancel();
        modalRef.value.handleClose();
        emits("init");
      });
    }
  }
};
const getItem = () => {
  handleCancel();
  modalRef.value.handleClose();
  emits("init");
};
defineExpose({
  showItem,
});
</script>
<style lang="scss" scoped>
@use "@/styles/person-modal.scss";

.form {
  max-height: 60vh;
  overflow: auto;
}
</style>
