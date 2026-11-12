<template>
  <div class="sys-settings-page">
    <userBanner url="/homepage" :title="'基础资源'" :active="3" />
    <div class="sys-settings-main config-layout">
      <sidebar active="1" />
      <div class="config-main">
        <div class="sys-card">
          <div class="card-header">
            <h3>部门管理</h3>
            <div class="header-actions">
              <a-button class="btn-ghost-sm" @click="addDept(2)">
                <template #icon>
                  <icon-upload />
                </template>
                批量导入
              </a-button>
              <a-button type="primary" class="btn-ghost-sm" @click="addDept(1)">
                <template #icon>
                  <icon-plus />
                </template>
                新增
              </a-button>
              <!-- <a-button type="primary" class="btn-ghost-sm" :loading="syncingDept" @click="syncDeptData">
                <template #icon>
                  <icon-loop />
                </template>
                更新
              </a-button> -->
            </div>
          </div>
          <div class="card-body">
            <a-tree :data="data" :expanded-keys="expandedKeys" @expand="onExpand" block-node>
              <template #title="nodeData">
                <div class="tree-node-content">
                  <span>{{ nodeData.label }}</span>
                  <div class="node-actions">
                    <icon-edit @click.stop="editItem(nodeData)" />
                    <icon-plus @click.stop="addDeptItem(nodeData)" />
                    <icon-delete @click.stop="deleteItem(nodeData)" />
                  </div>
                </div>
              </template>
            </a-tree>
          </div>
        </div>
      </div>
    </div>
    <base-modal ref="modalRefs">
      <base-import :schedule-data="scheduleData" @close-model="closeModels" />
    </base-modal>
    <create ref="createRef" @init="getList" :createData="data" />
  </div>
</template>
<script setup lang="ts">
import { Modal, Message } from "@arco-design/web-vue";
import { getDept, deleteDept, importDept, syncDepts } from "@/api/department/index";
import { getCacheList } from "@/api/common/index";
import fileUrl from "@/assets/import/dept.xlsx";
import { ref, reactive } from "vue";
import create from "./create.vue";
import sidebar from "@/views/basicResource/sidebar.vue";
const data = ref([]);
const expandedKeys = ref([]);
const createRef = ref();
const modalRefs = ref();
const typeOptions = ref([]);
const columns = ref([]);
const syncingDept = ref(false);

getCacheList("deptClassify").then((res) => {
  typeOptions.value = res;
});

const scheduleData = reactive({
  downloadFileTitle: "导入部门失败文档.xlsx",
  downloadnowFileTitle: "导入部门文档.xlsx",
  exportTemplateFn: () => {
    return downloadTemplate();
  },
  uploadFiles: (e: any) => {
    const formdata = new FormData();
    formdata.append("file", e.fileItem.file);
    return importDept(formdata);
  },
});
const closeModels = () => {
  modalRefs.value.handleClose();
  // getTableData()
};
const getList = () => {
  getDept().then((res) => {
    data.value = res;
  });
};
getList();

const onExpand = (keys: any[]) => {
  expandedKeys.value = keys;
};

const addDeptItem = (val: any) => {
  createRef.value.showItem(val.id);
};
const downloadTemplate = () => {
  // 使用相对路径
  const fileUrls = fileUrl;
  // 创建一个隐藏的a标签
  const link = document.createElement("a");
  link.href = fileUrls;
  link.download = "部门模板信息.xlsx"; // 设置下载文件名
  // 将a标签添加到DOM并触发点击事件
  document.body.appendChild(link);
  link.click();
  // 移除a标签
  document.body.removeChild(link);
};
const editItem = (item: any) => {
  createRef.value.updateItem(item);
};
const addDept = (val: any) => {
  if (val === 1) {
    createRef.value.showItem();
  } else {
    modalRefs.value.handleClick({
      title: "批量导入部门",
      showBtn: true,
      width: "500px",
    });
  }
};
const syncDeptData = () => {
  Modal.confirm({
    title: "\u63d0\u793a",
    simple: true,
    renderToBody: false,
    titleAlign: "start",
    content: "\u6b64\u64cd\u4f5c\u5c06\u540c\u6b65\u90e8\u95e8\u6570\u636e\uff0c\u53ef\u80fd\u4f1a\u5f71\u54cd\u6d41\u7a0b\u76f8\u5173\u4eba\u5458\u548c\u7ec4\u7ec7\u4fe1\u606f\uff0c\u662f\u5426\u7ee7\u7eed\uff1f",
    hideCancel: false,
    okText: "\u786e\u8ba4\u540c\u6b65",
    onOk: async () => {
      syncingDept.value = true;
      try {
        await syncDepts();
        Message.success("\u90e8\u95e8\u540c\u6b65\u5df2\u63d0\u4ea4\uff0c\u8bf7\u7a0d\u540e\u5237\u65b0\u5217\u8868");
        getList();
      } finally {
        syncingDept.value = false;
      }
    },
  });
};
const deleteItem = (item: any) => {
  Modal.confirm({
    title: "提示",
    simple: true,
    renderToBody: false,
    titleAlign: "start",
    popupContainer: "#job",
    content: "确定要删除该部门吗？",
    hideCancel: false,
    okText: "确认删除",
    onOk: async () => {
      deleteDept(item.id).then((res) => {
        Message.success("删除成功");
        getList();
      });
    },
  });
};
</script>
<style lang="scss" scoped>
@use "../../styles/system-settings.scss";

.sys-settings-main.config-layout {
  height: calc(100vh - 104px);
  min-height: 0;
}

.config-main,
.sys-card {
  height: 100%;
  min-height: 0;
}

.sys-card {
  display: flex;
  flex-direction: column;
}

.card-header {
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.tree-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 16px;

  .node-actions {
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s;

    svg {
      font-size: 14px;
      color: #94a3b8;
      cursor: pointer;

      &:hover {
        color: rgb(var(--primary-6));
      }
    }
  }

  &:hover .node-actions {
    opacity: 1;
  }
}

:deep(.arco-tree) {
  .arco-tree-node-title-text {
    flex: 1;
  }

  .arco-tree-node-expand-icon {
    color: #94a3b8;
  }
}

.header-actions {
  display: flex;
  gap: 8px;
}
</style>
<style>
.arco-modal-simple .arco-modal-footer {
  text-align: right;
}
</style>
