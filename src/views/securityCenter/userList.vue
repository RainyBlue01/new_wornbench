<template>
  <div class="person-box">
    <template v-if="users?.length">
      <span
        v-for="user in users"
        :key="user.id"
        class="person-tag"
        @mouseenter="checkUserHandler(user.id)"
        @mouseleave="unCheckUserHandler"
      >
        {{ user.nickname }}
        <icon-close
          v-if="
            !(formData.groupId == '1' && user.id == '1') &&
            checkUser == user.id
          "
          class="remove"
          @click.stop="removeUser(user)"
        />
      </span>
    </template>
    <span v-else class="person-empty">暂未关联人员</span>
    <span class="person-add" @click="addUser">
      <icon-plus />
      添加人员
    </span>

    <base-modal
      ref="modalRef"
      @handle-ok="formSubmit"
      @handle-cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :style="{ width: '100%' }"
        :model="formData"
        :rules="rules"
        layout="vertical"
        scroll-to-first-error
      >
        <a-form-item field="userIds" label="安全组成员">
          <a-select
            placeholder="请输入账号或昵称"
            allow-search
            multiple
            v-model="formData.userIds"
            :filter-option="filterHandle"
            :options="unUsers"
            :max-tag-count="3"
            :field-names="{ value: 'id' }"
            :virtual-list-props="{ height: 200 }"
          >
            <template #option="option">
              <a-space>
                <span>{{ option.data.nickname }} </span>
                <span>({{ option.data.username }})</span>
                <span v-if="option.data.active == 0">
                  <a-link status="warning">(离职)</a-link>
                </span>
                <span v-if="option.data.loginState == 0">
                  <a-link status="warning">(登录锁定)</a-link>
                </span>
              </a-space>
            </template>
            <template #label="option">
              <a-space>
                <span>{{ option.data.nickname }} </span>
                <span>({{ option.data.username }})</span>
                <span v-if="option.data.active == 0">
                  <a-link status="warning">(离职)</a-link>
                </span>
                <span v-if="option.data.loginState == 0">
                  <a-link status="warning">(登录锁定)</a-link>
                </span>
              </a-space>
            </template>
          </a-select>
        </a-form-item>
      </a-form>
    </base-modal>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import {
  grantUsers,
  unGrantUsers,
  addUserGrant,
  deleteUserGrant,
} from "@/api/securityCenter";
import { Message, Modal, type SelectOptionData } from "@arco-design/web-vue";

const emit = defineEmits<{ changed: [] }>();

const users = ref<any[]>();
const unUsers = ref();
const modalRef = ref();
const checkUser = ref();
const formRef = ref();

interface SecurityUser {
  groupId?: string;
  userIds?: Array<string>;
}

const formData = reactive<SecurityUser>({
  groupId: "",
  userIds: [],
});

const rules = ref({
  userIds: [
    {
      required: true,
      type: "array",
      message: "请选择安全组成员",
    },
  ],
});

const loadUsers = (groupId: string) => {
  formData.groupId = groupId;
  grantUsers(groupId).then((res) => {
    users.value = res || [];
  });
  unGrantUsers(groupId).then((res) => {
    unUsers.value = (res || []).filter((user) => user.active != 0);
  });
};

const checkUserHandler = (userId: string) => {
  checkUser.value = userId;
};

const unCheckUserHandler = () => {
  checkUser.value = "";
};

const addUser = () => {
  handleCancel();
  modalRef.value.handleClick({
    title: "添加人员",
    okText: "完成",
    cancelText: "关闭",
    showBtn: true,
    width: "500px",
  });
};

const filterHandle = (keyword: string, option: SelectOptionData) => {
  return (
    option.nickname.toLowerCase().includes(keyword) ||
    option.username.toLowerCase().includes(keyword)
  );
};

const handleCancel = () => {
  formData.userIds = [];
  modalRef.value.handleClose();
};

const formSubmit = async () => {
  formRef.value.validate((error: any) => {
    if (!error) {
      const groupUser = {
        authorityIds: formData.userIds,
      };
      addUserGrant(formData.groupId, groupUser).then(() => {
        Message.success("添加成员成功");
        loadUsers(formData.groupId + "");
        emit("changed");
      });
      modalRef.value.handleClose();
    }
  });
};

const removeUser = (user: any) => {
  Modal.confirm({
    title: "确认",
    content: `确认移除 ${user.nickname}?`,
    hideCancel: false,
       titleAlign: "start",
    okText: "确认删除",
    onOk: async () => {
      deleteUserGrant(formData.groupId, { authorityIds: [user.id] }).then(
        () => {
          Message.success("移除成员成功");
          loadUsers(formData.groupId + "");
          emit("changed");
        },
      );
    },
  });
};

defineExpose({
  loadUsers,
});
</script>

<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.person-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  min-height: 44px;
}

.person-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: #e2e8f0;
  color: #334155;
  font-size: 12px;
  font-weight: 500;
  user-select: none;

  .remove {
    cursor: pointer;
    color: #64748b;
    font-size: 10px;
    transition: color 0.15s;

    &:hover {
      color: #ef4444;
    }
  }
}

.person-empty {
  font-size: 12px;
  color: #94a3b8;
}

.person-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: textColor.$ThemeTextColor;
  font-weight: 500;
  cursor: pointer;
  border: 1px dashed #bfdbfe;
  background: #eff6ff;
  transition: background 0.15s;

  &:hover {
    background: #dbeafe;
  }
}
</style>
