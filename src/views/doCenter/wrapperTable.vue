<template>
  <div class="doCenter" :class="{ 'doCenter--embedded': embedded }">
    <div class="doCenter-wrapper">
      <div class="doCenter-wrapper-left">
        <a-space>
          <a-select multiple :max-tag-count="1" :tag-nowrap="true" v-model="chooseAppIds" :options="appOptions"
            :style="{ width: '200px', borderRadius: '12px' }" :field-names="{ value: 'appId', label: 'appName' }"
            placeholder="请选择应用" allow-clear @change="chooseAppHandler" class="rounded-input">
          </a-select>
          <a-select v-model="setTime" :options="allTime" :style="{ width: '200px', borderRadius: '12px' }"
            placeholder="请选择时间" @change="setTimeHandler" class="rounded-input">
          </a-select>
          <a-range-picker v-if="setTime == 100" v-model="customDateRange"
            :style="{ width: '200px', borderRadius: '12px' }" class="rounded-input" @change="customDateChangeHandler" />
          <a-select v-model="sortOrder" :style="{ width: '100px', borderRadius: '12px' }" placeholder="排序"
            @change="sortChangeHandler" class="rounded-input">
            <a-option :value="1">最新</a-option>
            <a-option :value="-1">最旧</a-option>
          </a-select>
          <a-select v-if="props.classify == 'apply'" allow-clear v-model="processStatus"
            :style="{ width: '120px', borderRadius: '12px' }" placeholder="流程状态" @change="statusChangeHandler"
            class="rounded-input">
            <a-option :value="''">全部状态</a-option>
            <a-option :value="0">审批中</a-option>
            <a-option :value="1">已通过</a-option>
            <a-option :value="2">流程失败</a-option>
          </a-select>
          <a-select v-if="props.classify == 'notice'" v-model="readStatus"
            :style="{ width: '120px', borderRadius: '12px' }" placeholder="阅读状态" @change="readStatusChangeHandler"
            class="rounded-input">
            <a-option :value="0">已读</a-option>
            <a-option :value="1">未读</a-option>
          </a-select>
        </a-space>
      </div>
      <div class="doCenter-wrapper-right">
        <a-input placeholder="搜索流程" v-model="keyword" @change="keywordChangeHandler" class="rounded-input">
          <template #prefix>
            <i class="fas fa-search wb-search-ic"></i>
          </template>
        </a-input>

      </div>
    </div>
    <div class="doCenter-table">
      <div class="doCenter-table-item" v-for="(record, index) in records">
        <slot name="record" :record="record" :rowIndex="index" />
      </div>
      <empty-box v-show="records.length === 0" />
    </div>
    <div class="doCenter-pagination">
      <PersonPagination :total="pagination.total" :current="pagination.current" :page-size="pagination.pageSize"
        :show-page-size="false" :show-jump="false" @change="changePageNumHandler" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import PersonPagination from "@/views/user/components/PersonPagination.vue";
const props = defineProps({
  getAppOptions: Function,
  getTableData: Function,
  classify: String,
  embedded: Boolean,
});

const emits = defineEmits(["getDataNum"]);

// template 中直接使用 props.embedded 即可

const latest = ref(true);
const sortOrder = ref(1); // 1: 最新, -1: 最旧
const processStatus = ref(''); // 0: 审批中, 1: 已通过, 2: 流程失败
const readStatus = ref(1); // 1: 已读, 0: 未读
const checkBox = ref(0);
const appOptions = ref([]);
const chooseAppIds = ref([]);
const records = ref([]);
const keyword = ref("");
const router = useRouter();
const setTime = ref(0);
const customDateRange = ref([]);
const allTime = reactive([
  { label: "全部时间", value: 0 },
  { label: "今天", value: 1 },
  { label: "最近3天", value: 3 },
  { label: "最近7天", value: 7 },
  { label: "最近30天", value: 30 },
  { label: "自定义日期", value: 100 },
])
const setTimeHandler = () => {
  if (setTime.value !== 100) {
    customDateRange.value = [];
  }
  requestRecord();
};

const customDateChangeHandler = () => {
  requestRecord();
};

const changePageNumHandler = (current) => {
  pagination.current = current;
  requestRecord();
};

const pagination = reactive({
  total: 1,
  current: 1,
  pageSize: 10,
});

function sortChangeHandler(value: number) {
  sortOrder.value = value || 1;
  requestRecord();
}
function keywordChangeHandler(value: string) {
  keyword.value = value || "";
  requestRecord();
}

function statusChangeHandler(value: string | undefined) {
  processStatus.value = value ?? '';
  requestRecord();
}

function readStatusChangeHandler(value: number) {
  readStatus.value = value ?? 1;
  requestRecord();
}

function latestHandler() {
  latest.value = latest.value ? false : true;
  requestRecord();
}

function chooseAppHandler() {
  requestRecord();
}

function checkBoxHandler(value: number) {
  checkBox.value = value;
  requestRecord();
}


function requestRecord() {
  const params: any = {
    appIds: chooseAppIds.value.join(","),
    latest: sortOrder.value === 1, // 将 sortOrder 转换为 latest
    states: props.classify == 'notice' ? readStatus.value : '',
    search: keyword.value,
    current: pagination.current,
    size: pagination.pageSize,
  };

  // 处理流程状态参数
  if (props.classify == 'apply') {
    params.processFinish = processStatus.value;
  }

  // 处理时间参数
  if (setTime.value === 0) {
    // 全部时间：不传时间参数
  } else if (setTime.value === 100) {
    // 自定义日期
    if (customDateRange.value && customDateRange.value.length === 2) {
      params.custom = true;
      params.customStartDate = customDateRange.value[0];
      params.customEndDate = customDateRange.value[1];
    }
  } else {
    // 预设天数：1, 3, 7, 30
    params.custom = false;
    params.days = setTime.value;
  }

  props.getTableData(params).then((res) => {
    records.value = res.records;
    pagination.total = res.total;
    pagination.current = res.current;
    pagination.pageSize = res.size;
    emits("getDataNum", res.total);
  });
}

function requestAppOption() {
  props.getAppOptions().then((res) => {
    appOptions.value = res;
  });
}

function refreshHandler() {
  pagination.total = 0;
  pagination.current = 1;
  pagination.pageSize = 10;
  chooseAppIds.value = [];
  latest.value = true;

  requestRecord();
}

function initialize() {
  requestAppOption();
  refreshHandler();
}

defineExpose({ initialize });
</script>



<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.doCenter {
  &-wrapper {
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    background-color: #fff;
    padding: 16px 24px;
    gap: 16px;
    flex-wrap: wrap;

    &-left {
      flex: 1;
      min-width: 0;

      :deep(.arco-space) {
        flex-wrap: wrap;
        gap: 12px;
        width: 100%;
      }

      // 筛选器响应式宽度
      :deep(.arco-select) {
        min-width: 160px;
        flex: 1 1 160px;

        .arco-input-wrapper {
          width: 100% !important;
          min-width: 0;
        }
      }

      :deep(.arco-range-picker) {
        min-width: 200px;
        flex: 1 1 200px;

        .arco-input-wrapper {
          width: 100% !important;
          min-width: 0;
        }
      }
    }

    &-right {
      flex-shrink: 0;

      :deep(.arco-input-wrapper) {
        width: 240px;

        @media (max-width: 768px) {
          width: 200px;
        }

        @media (max-width: 480px) {
          width: 100%;
          flex: 1 1 100%;
        }
      }

      .arco-btn:hover {
        background: #fff;
      }

      .arco-icon {
        color: rgba(0, 0, 0, 0.9) !important;
      }

      span {
        color: rgba(0, 0, 0, 0.9) !important;
      }
    }

    // 小屏幕适配
    @media (max-width: 1200px) {
      padding: 12px 16px;

      &-left {
        :deep(.arco-select) {
          min-width: 140px;
        }
      }
    }

    @media (max-width: 768px) {
      padding: 12px;
      flex-direction: column;
      gap: 12px;

      &-left {
        width: 100%;

        :deep(.arco-space) {
          gap: 8px;
        }

        :deep(.arco-select),
        :deep(.arco-range-picker) {
          min-width: 100%;
          flex: 1 1 100%;
        }
      }

      &-right {
        width: 100%;

        :deep(.arco-input-wrapper) {
          width: 100%;
        }
      }
    }
  }

  // 搜索框特殊样式
  :deep(.rounded-input.arco-input-wrapper) {
    background: #f5f6f7;
    border: 1px solid transparent;
    border-radius: 12px;

    .arco-input {
      background: transparent;
      border: none;

      &::placeholder {
        color: #9ca3af;
      }
    }

    &:hover,
    &:focus,
    &.arco-input-focus {
      background: #f5f6f7;
      border-color: transparent;
    }
  }

  // 搜索图标样式
  .wb-search-ic {
    color: #9ca3af;
    font-size: 14px;
  }

  &-table {
    background-color: #fff;
    // overflow: auto;
    padding: 8px 0;
    // height: calc(100vh - 335px);

    &-item {
      cursor: pointer;

      &:hover {
        background: #f8fafc;
      }
    }
  }

  &-pagination {
    padding: 16px 24px;
    background-color: #fff;
    margin-top: 8px;
    border-radius: 0 0 8px 8px;
    border-top: 1px solid #e5e7eb;

    :deep(.person-pagination) {
      margin-top: 0;
      width: 100%;
    }

    @media (max-width: 768px) {
      padding: 12px 16px;
    }

    @media (max-width: 480px) {
      padding: 12px;
    }
  }
}
</style>
