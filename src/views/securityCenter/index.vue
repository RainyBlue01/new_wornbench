<template>
  <div class="securityCenter">
    <userBanner url="/homepage" :title="'系统设置'" :active="4" />
    <div class="securityCenter-body">
      <left ref="leftRef" @check="checkGroup" />
      <div class="security-card security-main">
        <div class="card-header">
          <h3>{{ detailTitle }}</h3>
          <a-button
            v-if="canSave"
            class="btn-ghost-sm"
            @click="saveConfig"
          >
            <template #icon>
             <i class="fas fa-save"></i>
            </template>
            保存配置
          </a-button>
        </div>
        <div class="card-body">
          <div class="section-title">
            <span>功能权限</span>
            <span class="line" />
          </div>
          <div class="menu-tree">
            <menuTree ref="menuTreeRef" />
          </div>
          <div class="section-title section-title--spaced">
            <span>关联人员</span>
            <span class="line" />
          </div>
          <userList ref="userListRef" @changed="onUsersChanged" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import left from "./left.vue";
import userList from "./userList.vue";
import menuTree from "./menuTree.vue";

const securityGroup = ref<any>();
const leftRef = ref();
const userListRef = ref();
const menuTreeRef = ref();

const detailTitle = computed(() =>
  securityGroup.value
    ? `${securityGroup.value.groupName} — 配置`
    : "安全组配置",
);

const canSave = computed(
  () => securityGroup.value && securityGroup.value.id != "1",
);

const checkGroup = (group: any) => {
  console.log("checkGroup", group);
  securityGroup.value = group;
  userListRef.value?.loadUsers(group.id);
  menuTreeRef.value?.loadMenu(group);
};

const saveConfig = () => {
  menuTreeRef.value?.saveMenu();
};

const onUsersChanged = () => {
  leftRef.value?.refreshCounts();
};
</script>

<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.securityCenter {
  background: #f1f5f9;
  min-height: calc(100vh - 60px);

  &-body {
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 24px 40px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
}

.security-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.security-main {
  flex: 1;
  min-width: 0;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
  }
}

.card-body {
  padding: 16px 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  .line {
    flex: 1;
    height: 1px;
    background: #f1f5f9;
  }

  &--spaced {
    margin-top: 20px;
  }
}

.btn-ghost-sm {
  background: #f8fafc !important;
  color: #64748b !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  height: auto !important;
  padding: 7px 14px !important;

  &:hover {
    background: #f1f5f9 !important;
    color: #334155 !important;
  }
}

.menu-tree {
  margin-bottom: 4px;
}
</style>
<style lang="scss">
@use "../../styles/textColor.scss" as textColor;

.securityCenter {
  .menu-tree {
    .arco-checkbox-checked {
      .arco-checkbox-icon {
        background: textColor.$ThemeTextColor;
      }
      color: textColor.$ThemeTextColor;
    }
    .arco-checkbox-indeterminate {
      .arco-checkbox-icon {
        background: textColor.$ThemeTextColor;
      }
    }
    .arco-tree-node-selected {
      .arco-tree-node-title-text {
        color: textColor.$ThemeTextColor;
      }
    }
    .arco-tree-node-title-text:hover {
      color: textColor.$ThemeTextColor;
    }
  }
}
</style>
