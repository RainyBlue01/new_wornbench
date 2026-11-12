<template>
  <div class="sys-settings-page" id="job">
    <userBanner url="/homepage" :title="'基础资源'" active="3" />
    <div class="sys-settings-main config-layout">
      <sidebar active="3" />
      <div class="config-main">
        <div class="sys-card">
          <div class="card-header">
            <h3>角色管理</h3>
            <div class="header-actions">
              <a-input-search v-model="pagination.name" @search="search" placeholder="搜索角色名称" style="width: 240px" />
              <a-button type="primary" class="btn-ghost-sm" @click="addJob">
                <template #icon>
                  <icon-plus />
                </template>
                新增
              </a-button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="!data.length" class="empty-state">
              <icon-empty />
              <p>暂无角色数据</p>
            </div>
            <div v-else class="role-list">
              <div v-for="item in data" :key="item.id" class="role-card">
                <div class="role-card-icon">
                  <icon-user />
                </div>
                <div class="role-card-content">
                  <div class="role-card-title">
                    <h4>{{ item.roleName }}</h4>
                    <span class="role-index">{{ item.roleIndex || '' }}</span>
                  </div>
                  <div class="role-card-desc" v-if="item.roleDesc">
                    {{ item.roleDesc || '暂无描述' }}
                  </div>
                </div>
                <div class="role-card-actions">
                  <icon-edit @click="editItem(item)" title="编辑" />
                  <icon-delete @click="deleteItem(item)" title="删除" />
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <PersonPagination :total="pagination.total" :current="pagination.current" :page-size="pagination.size"
              :show-page-size="false" :show-jump="false" @change="pagingChange" />
          </div>
        </div>
      </div>
    </div>
    <create ref="createRef" @init="search" />
  </div>
</template>

<script setup lang="ts">
import { Modal, Message } from '@arco-design/web-vue';
import { deleteRole, getRole } from '@/api/role/index';
import { ref, reactive } from 'vue';
import create from './create.vue';
import sidebar from "@/views/basicResource/sidebar.vue";
import PersonPagination from '@/views/user/components/PersonPagination.vue';
const createRef = ref();
const data = ref([]);
const scroll = { y: 'calc(100vh - 228px)' };
const pagination = ref({
  total: 1,
  name: "",
  current: 1,
  size: 10,
});
const columns = [
  {
    title: "序号",
    width: 80,
    align: "center",
    slotName: "serialNumber",
  },
  {
    title: "角色名称",
    dataIndex: "roleName",
  },
  {
    title: "管理",
    width: 128,
    slotName: "optional",
  },
];
const deleteItem = (item: any) => {
  Modal.confirm({
    title: "提示",
    simple: true,
    renderToBody: false,
    titleAlign: "start",
    popupContainer: "#job",
    content: "确定要删除该角色吗？",
    hideCancel: false,
    okText: "确认删除",
    onOk: async () => {
      deleteRole(item.id).then((res) => {
        Message.success("删除成功");
        search();
      });
    },
  });
};
const editItem = (item: any) => {
  createRef.value.showItem(item);
};
const addJob = () => {
  createRef.value.showItem();
};
const search = () => {
  pagingChange(1);
};
const pagingChange = (val: any) => {
  pagination.value.current = val;
  getList();
};
const getList = () => {
  getRole(pagination.value).then((res) => {
    pagination.value.total = res.total;
    data.value = res.records;
  });
};
getList();
</script>
<style lang="scss" scoped>
@use "../../styles/system-settings.scss";

.card-body {
  max-height: calc(100vh - 269px);
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #94a3b8;

  svg {
    font-size: 48px;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .role-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #fff;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      border-color: #eae8f0;
      background: #f8fafc;
      // box-shadow: 0 2px 8px rgba(var(--primary-6), 0.1);
    }

    .role-card-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgb(var(--primary-6)) 0%, #60a5fa 100%);
      border-radius: 8px;
      color: #fff;

      svg {
        font-size: 20px;
      }
    }

    .role-card-content {
      flex: 1;

      .role-card-title {
        display: flex;
        align-items: center;
        gap: 8px;

        h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .role-index {
          font-size: 12px;
          color: #94a3b8;
        }
      }

      .role-card-desc {
        margin-top: 4px;
        font-size: 13px;
        color: #64748b;
      }
    }

    .role-card-actions {
      display: flex;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.2s;

      svg {
        font-size: 16px;
        color: #94a3b8;
        cursor: pointer;

        &:hover {
          color: rgb(var(--primary-6));
        }
      }
    }

    &:hover .role-card-actions {
      opacity: 1;
    }
  }
}

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;

  :deep(.person-pagination) {
    margin-top: 0;
    width: 100%;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
<style>
.arco-modal-simple .arco-modal-footer {
  text-align: right;
}
</style>
