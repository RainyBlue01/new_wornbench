<template>
  <div class="security-sidebar">
    <div class="security-card">
      <div class="card-header">
        <h3>安全组列表</h3>
        <a-button class="btn-ghost-sm" @click="addHandler">
          <template #icon>
            <icon-plus />
          </template>
          新增
        </a-button>
      </div>
      <div class="card-body">
        <emptyBox
          v-if="!groupList.length"
          embedded
          desc="暂无安全组，点击右上角新增"
        />
        <div v-else class="sg-list">
          <div
            v-for="group in groupList"
            :key="group.id"
            :class="[
              'sg-item',
              { active: chooseGroup?.id == group.id },
              { system: group.id == '1' },
            ]"
            @click="changeGroup(group)"
          >
            <div
              class="sg-icon"
              :class="{ orange: group.id != '1' }"
            >
              <i class="fas fa-crown" v-if="group.id == '1'" > </i>
              <i class="fas fa-users" v-else ></i>
            </div>
            <div class="sg-info">
              <div class="sg-name">
                {{ group.groupName }}
                <span v-if="group.id == '1'" class="builtin-tag">(内置)</span>
              </div>
              <div class="sg-desc">{{ getGroupDesc(group) }}</div>
            </div>
            <div
              v-if="group.id != '1'"
              class="sg-actions"
              @click.stop
            >
              <button
                class="sg-action-btn edit"
                type="button"
                title="编辑"
                @click="updateHandler(group)"
              >
                <icon-edit />
              </button>
              <button
                class="sg-action-btn"
                type="button"
                title="删除"
                @click="deleteHandler(group)"
              >
                <icon-delete />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <create ref="createRef" @init="loadGroup" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import {
  getGroupList,
  deleteGroup,
  grantUsers,
} from "@/api/securityCenter";
import { Message, Modal } from "@arco-design/web-vue";
import create from "./create.vue";
import emptyBox from "@/components/emptyBox/emptyBox.vue";

const createRef = ref();
const groupList = ref<any[]>([]);
const chooseGroup = ref<any>();
const personCounts = ref<Record<string, number>>({});
const emits = defineEmits(["check"]);

const getGroupDesc = (group: any) => {
  const count = personCounts.value[group.id];
  const personText =
    count > 0 ? `关联 ${count} 人` : "未关联人员";
  return `${personText} · ${group.intro || ""}`;
};

const loadPersonCounts = async (groups: any[]) => {
  const entries = await Promise.all(
    groups.map(async (g) => {
      try {
        const users = await grantUsers(g.id);
        return [g.id, users?.length ?? 0] as const;
      } catch {
        return [g.id, 0] as const;
      }
    }),
  );
  personCounts.value = Object.fromEntries(entries);
};

const loadGroup = () => {
  getGroupList().then(async (res) => {
    groupList.value = res || [];
    if (groupList.value.length) {
      await loadPersonCounts(groupList.value);
      chooseGroup.value = groupList.value[0];
      emits("check", chooseGroup.value);
    }
  });
};

const changeGroup = (group: any) => {
  chooseGroup.value = group;
  emits("check", group);
};

const addHandler = () => {
  createRef.value.showItem();
};

const updateHandler = (group: any) => {
  createRef.value.showItem(group);
};

const deleteHandler = (group: any) => {
  Modal.confirm({
    title: "提示",
    simple: true,
    renderToBody: false,
    titleAlign: "start",
    popupContainer: "#job",
    content: "确定要删除该安全组吗？",
    hideCancel: false,
    okText: "确认删除",
    onOk: async () => {
      deleteGroup(group.id).then(() => {
        Message.success("删除成功");
        loadGroup();
      });
    },
  });
};

loadGroup();

const refreshCounts = async () => {
  if (groupList.value?.length) {
    await loadPersonCounts(groupList.value);
  }
};

defineExpose({ refresh: loadGroup, refreshCounts });
</script>

<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.security-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.security-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
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

.sg-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sg-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;

  &:hover {
    background: #f8fafc;
    border-color: #e2e8f0;

    .sg-actions {
      opacity: 1;
    }
  }

  &.active {
    background: #eff6ff;
    border-color: #dbeafe;
  }

  &.system:hover {
    background: #eff6ff;
    border-color: #dbeafe;
  }
}

.sg-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;

  &.orange {
    background: linear-gradient(135deg, #fb923c, #f97316);
  }
}

.sg-info {
  flex: 1;
  min-width: 0;
}

.sg-name {
  font-size: 13px;
  font-weight: 600;
  color: #334155;

  .builtin-tag {
    color: #f59e0b;
    font-size: 10px;
    font-weight: 500;
  }
}

.sg-desc {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sg-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.sg-action-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  padding: 0;

  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  &.edit:hover {
    background: #eff6ff;
    color: textColor.$ThemeTextColor;
  }
}
</style>
<style>
.arco-modal-simple .arco-modal-footer {
  text-align: right;
}
</style>
