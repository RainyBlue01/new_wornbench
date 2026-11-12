<template>
  <base-modal ref="modalRef" @handle-ok="formSubmit" @handle-cancel="handleCancel">

    <a-input-search
      v-if="!formData.subscribeId"
      v-model="appSearchKeyword"
      class="app-search"
      allow-clear
      placeholder="搜索应用名称"
    />

    <p class="modal-desc">选择要授权的应用，授权后该应用可获取写入 webhook 推送权限</p>

    <a-form ref="refChangeForm" :style="{ width: '100%' }" :model="formData" :rules="rules" layout="vertical"
      scroll-to-first-error>
      <a-form-item v-if="!formData.subscribeId" field="appId" label="">
        <div class="app-list-container">
          <a-checkbox-group v-if="filteredAppList.length" v-model="formData.appId">
            <a-checkbox :value="app.value" v-for="app in filteredAppList" :key="app.value" class="app-checkbox-item">
              <div class="app-checkbox-content">
                <div class="app-icon">
                  <img v-if="app.showIcon" :src="app.showIcon" alt="" />
                  <img v-else :src="placeholderIcon" alt="" />
                </div>
                <div class="app-info">
                  <div class="app-name">{{ app.label }}</div>
                  <div class="app-category">{{ app.category == 1 ? '协作表单应用' : '协作流程应用' }}</div>
                </div>
              </div>
            </a-checkbox>
          </a-checkbox-group>
          <a-empty v-else class="app-empty" description="未找到匹配的应用" />
        </div>
      </a-form-item>
    </a-form>
  </base-modal>
</template>

<script setup lang="ts">
import { setSubscribe, putSubscribe } from "@/api/developer/index";
import { listByRelation } from "@/api/homePage/index";
import { computed, ref, reactive, shallowRef } from "vue";
import { Message } from "@arco-design/web-vue";
import placeholderIcon from '@/assets/icon_zhanwei.svg';

const refChangeForm = ref();
const modalRef = ref();
const emits = defineEmits(["init"]);

interface FormDataType {
  developerId: string;
  appId?: Array<string>;
  subscribeId?: string;
}

interface ShowItemPayload {
  developerId?: string;
  subscribeId?: string;
  authorizedAppIds?: Array<string | number>;
}

const appList = ref([
  { label: '税务管理系统', value: '1', category: 1 },
  { label: '财务记账系统', value: '2', category: 1 },
  { label: '人事管理系统', value: '3', category: 2 },
  { label: '图书系统', value: '4', category: 1 },
]);

const appSearchKeyword = shallowRef('');
const filteredAppList = computed(() => {
  const keyword = appSearchKeyword.value.trim().toLocaleLowerCase();

  if (!keyword) {
    return appList.value;
  }

  return appList.value.filter((app) =>
    app.label.toLocaleLowerCase().includes(keyword)
  );
});

const authorizedAppIds = ref<string[]>([]);

const changeApp = (value: string[]) => {
  if (value.length > 0) {
    let appId = value[0];
    let app = appList.value.find((item) => item.value == appId);

    appList.value.map(item => {
      if (item.category !== app.category) {
        item.disabled = true;
      } else {
        item.disabled = false;
      }
    });
  } else {
    appList.value.map(item => {
      item.disabled = false;
    });
  }
};
const win = window as any
const getAppList = () => {
  listByRelation().then((res) => {
    appList.value = res
      .filter((item: any) => !authorizedAppIds.value.includes(String(item.appId)))
      .map((item: any) => {
      return {
        label: item.appName,
        value: item.appId,
        category: item.category,
        showIcon: item.icon ? (win.api.dowUrl + item.icon + '&token=' + localStorage.getItem('wornbench_token')) : '',
      };
      });
  });
};

const formData = reactive<FormDataType>({
  appId: [],
  developerId: '',
});

const showItem = (item: ShowItemPayload) => {
  if (item.subscribeId) {
    formData.subscribeId = item.subscribeId;

    modalRef.value.handleClick({
      title: "修改订阅应用",
      okText: "完成",
      cancelText: "关闭",
      showBtn: true,
      width: "600px",
    });
  } else {
    formData.developerId = item.developerId || '';
    authorizedAppIds.value = (item.authorizedAppIds || []).map((appId) => String(appId));
    modalRef.value.handleClick({
      title: "新增授权应用",
      okText: "确认授权",
      cancelText: "取消",
      showBtn: true,
      width: "600px",
    });
    getAppList();
  }
};

const rules = ref({});

const handleCancel = () => {
  formData.developerId = "";
  formData.appId = [];
  formData.subscribeId = "";
  appSearchKeyword.value = "";
  authorizedAppIds.value = [];
};

const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      if (formData.subscribeId) {
        putSubscribe({}, formData.subscribeId).then(() => {
          Message.success("修改成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      } else {
        let params = {
          developerId: formData.developerId,
          apps: formData.appId,
        };

        // formData.appId.map(item => {
        //   let app = appList.value.find((items) => items.value == item);
        //   params.apps.push({
        //     appId: app.value,
        //     category: app.category
        //   });
        // });

        setSubscribe(params).then(() => {
          Message.success("授权成功");
          handleCancel();
          modalRef.value.handleClose();
          emits("init");
        });
      }
    }
  });
};

defineExpose({
  showItem,
});
</script>

<style lang="scss" scoped>
.subscription-container {
  padding: 0 24px 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px;
}

.modal-desc {
  font-size: 13px;
  color: #86909c;
  margin: 0 0 16px;
}

.app-search {
  width: 100%;
  margin-bottom: 12px;
}

.app-list-container {
  margin-bottom: 24px;
  width: 100%;

  :deep(.arco-checkbox-group) {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .arco-checkbox-checked {
      border-color: #3b82f6;
      background: #eff6ff;
    }
  }

  :deep(.arco-checkbox-item) {
    width: 100%;
  }

  .app-info {
    width: 430px;
  }
}

.app-empty {
  padding: 32px 0;
}


.app-checkbox-item {
  width: 100%;
  margin: 0 !important;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e5e6eb;
  // background: #f8fafc;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #c9cdd4;
    background: #f2f3f5;
  }

  &:deep(.arco-checkbox-checked) {
    border-color: #165dff;
    background: #e8f3ff;

    &:hover {
      border-color: #165dff;
      background: #e8f3ff;
    }

    .app-icon {
      box-shadow: 0 4px 12px rgba(22, 93, 255, 0.2);
    }
  }

  &:deep(.arco-checkbox-wrapper) {
    margin-right: 12px;
  }

  &:deep(.arco-checkbox-wrapper:hover) {
    background: transparent !important;
  }

  &:deep(.arco-checkbox-wrapper::after) {
    content: none !important;
  }

  .app-checkbox-content {
    display: flex;
    align-items: center;
    width: calc(100% - 40px);
  }

  .app-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    transition: all 0.2s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 12px;
    }
  }

  .app-info {
    flex: 1;
    margin-left: 12px;
  }

  .app-name {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 4px;
    line-height: 1.5;
  }

  .app-category {
    font-size: 12px;
    color: #86909c;
    line-height: 1.5;
  }
}

:deep(.arco-form-item) {
  margin-bottom: 24px;
}
</style>
