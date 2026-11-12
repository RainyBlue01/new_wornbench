<template>
  <div class="config-sidebar person-sidebar">
    <div class="sys-card person-sidebar-card">
      <div class="card-body person-sidebar-body">
        <div class="person-sidebar__nav">
          <div
            v-for="item in menuItems"
            :key="item.key"
            :class="['config-menu-item', { active: leftTab === item.key }]"
            @click="emit('switch-tab', item.key)"
          >
            <i :class="item.icon" aria-hidden="true" />
            {{ item.label }}
          </div>
        </div>

        <div class="person-sidebar__filter">
          <!-- 部门标签页 -->
          <template v-if="leftTab === 'dept'">
            <div class="person-sidebar__filter-fixed">
              <button
                type="button"
                class="person-tag-btn"
                :class="{ active: deptFilter === '__NO_DEPT__' }"
                @click="emit('dept-filter', '__NO_DEPT__')"
              >
                无部门成员{{ noDeptNum > 0 ? ` (${noDeptNum})` : "" }}
              </button>
              <button
                type="button"
                class="person-tag-btn"
                :class="{ active: deptFilter === '' }"
                @click="emit('dept-filter', '')"
              >
                全体成员
              </button>
            </div>
            <div class="person-sidebar__filter-scroll">
              <a-tree
                :field-names="{ key: 'id', title: 'label' }"
                :selected-keys="selectedDeptKeys"
                block-node
                :data="deptList"
                @select="onDeptSelect"
              />
            </div>
          </template>

          <!-- 职位标签页 -->
          <template v-else-if="leftTab === 'post'">
            <div class="person-sidebar__filter-fixed">
              <p class="person-sidebar__hint">按职位筛选成员</p>
              <button
                type="button"
                class="person-tag-btn"
                :class="{ active: !selectedPostId }"
                @click="emit('post-filter', '')"
              >
                全部
              </button>
            </div>
            <div class="person-sidebar__filter-scroll">
              <button
                v-for="post in postList"
                :key="post.id"
                type="button"
                class="person-tag-btn"
                :class="{ active: selectedPostId === post.id }"
                @click="emit('post-filter', post.id)"
              >
                {{ post.postName }}
              </button>
            </div>
          </template>

          <!-- 角色标签页 -->
          <template v-else-if="leftTab === 'role'">
            <div class="person-sidebar__filter-fixed">
              <p class="person-sidebar__hint">按角色权限筛选成员</p>
              <button
                type="button"
                class="person-tag-btn"
                :class="{ active: !selectedRoleId }"
                @click="emit('role-filter', '')"
              >
                全部
              </button>
            </div>
            <div class="person-sidebar__filter-scroll">
              <button
                v-for="role in roleList"
                :key="role.id"
                type="button"
                class="person-tag-btn"
                :class="{ active: String(selectedRoleId) === String(role.id) }"
                @click="emit('role-filter', role.id)"
              >
                {{ role.roleName }}
              </button>
            </div>
          </template>

          <template v-else-if="leftTab === 'leader'">
            <p class="person-sidebar__hint">显示学校分管领导</p>
          </template>

          <template v-else-if="leftTab === 'resigned'">
            <p class="person-sidebar__hint">显示已离职的成员</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  IconUser,
  IconUserGroup,
  IconSafe,
  IconIdcard,
  IconUserAdd,
} from "@arco-design/web-vue/es/icon";
import type { PersonLeftTab } from "../composables/usePersonPage";

const props = defineProps<{
  leftTab: PersonLeftTab;
  deptList: any[];
  roleList: any[];
  postList: any[];
  noDeptNum: number;
  deptFilter: string;
  selectedPostId: string | number | "";
  selectedRoleId: string | number | "";
}>();

const emit = defineEmits<{
  "switch-tab": [tab: PersonLeftTab];
  "dept-filter": [value: string];
  "post-filter": [id: string | number | ""];
  "role-filter": [id: string | number | ""];
}>();

const menuItems = [
  { key: "dept" as PersonLeftTab, label: "部门", icon: 'fas fa-building' },
  { key: "post" as PersonLeftTab, label: "职位", icon: 'fas fa-user-tag' },
  { key: "role" as PersonLeftTab, label: "角色", icon: 'fas fa-user-shield' },
  { key: "leader" as PersonLeftTab, label: "分管领导", icon: 'fas fa-user-tie' },
  { key: "resigned" as PersonLeftTab, label: "离职成员", icon: 'fas fa-user-slash' },
];

const selectedDeptKeys = computed(() => {
  if (props.deptFilter && props.deptFilter !== "__NO_DEPT__") {
    return [props.deptFilter];
  }
  return [];
});

const onDeptSelect = (keys: (string | number)[]) => {
  const id = keys?.[0];
  if (id != null) {
    emit("dept-filter", String(id));
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/system-settings.scss";

.person-sidebar {
  width: 280px;
  flex-shrink: 0;
  align-self: flex-start;

  .person-sidebar-body {
    padding: 12px;
  }

  .person-sidebar__nav {
    flex-shrink: 0;
  }

  .person-sidebar__filter {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: calc(100vh - 347px); // 调整高度，防止滚动区域过高
    overflow: hidden; // 防止外层滚动

    // 固定区域（不滚动）
    .person-sidebar__filter-fixed {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    // 可滚动区域
    .person-sidebar__filter-scroll {
      flex: 1;
      min-height: 0; // 允许flex子项缩小
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 8px;

      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;

        &:hover {
          background: #94a3b8;
        }
      }
    }
  }

  .person-sidebar__hint {
    margin: 0 0 4px;
    font-size: 12px;
    color: #94a3b8;
  }

  .person-tag-btn {
    width: 100%;
    text-align: left;
    padding: 5px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: #eff6ff;
      color: #2563eb;
      border-color: #bfdbfe;
    }

    &.active {
      background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
      color: #fff;
      border-color: transparent;
      font-weight: 600;
    }
  }

  :deep(.arco-tree-node-selected .arco-tree-node-title) {
    color: #2563eb;
    font-weight: 600;
  }

  :deep(.arco-tree-list-holder),
  :deep(.arco-virtual-list) {
    overflow-x: hidden !important;
  }
}
</style>
