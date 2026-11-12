<template>
  <a-modal
      class="scene-log-modal"
      :visible="dialogVisible"
      :width="960"
      :body-style="{height: '600px', display: 'flex','flex-direction': 'column'}"
      :footer="false"
      :mask-closable="false"
      :esc-to-close="false"
      @cancel="handleClose"
  >
    <template #title>
      <div class="title">运行日志</div>
    </template>

    <div class="dialog-title">
      <div class="left">动作：{{ sceneObject.name }}</div>
      <div class="right">
        <a-range-picker
            v-model="searchObj.date"
            :time-picker-props="{ defaultValue: ['00:00:00', '23:59:59'] }"
            format="YYYY-MM-DD HH:mm:ss"
            @change="handleSearch"
            allow-clear
        />
        <a-select
            v-model="searchObj.processId"
            placeholder="当前流程"
            allow-clear
            @change="handleSearch"
        >
          <a-option
              v-for="item in processOptions"
              :key="item.id"
              :value="item.id"
              :label="item.name"
          />
        </a-select>
        <a-select
            v-model="searchObj.state"
            placeholder="状态"
            allow-clear
            @change="handleSearch"
        >
          <a-option
              v-for="item in methodType"
              :key="item.value"
              :value="item.value"
              :label="item.label"
          />
        </a-select>
      </div>
    </div>

    <div class="dialog-content">
      <a-table
          :data="tableData"
          :pagination="false"
          :bordered="true"
          row-key="index"
      >
        <template #columns>
          <a-table-column title="序号" :width="80" align="center">
            <template #cell="{ rowIndex }">
              {{ rowIndex + 1 }}
            </template>
          </a-table-column>
          <a-table-column title="当前流程" data-index="name"/>
          <a-table-column title="触发时间" data-index="triggerTime"/>
          <a-table-column title="耗时" data-index="duration"/>
          <a-table-column title="状态">
            <template #cell="{ record }">
              <div :style="record.state === 1 ? 'color:#4080ff;' : 'color:#F26161;'">
                <a-tooltip v-if="record.state === 0" :content="record.error">
                  <icon-question-circle class="question-icon"/>
                </a-tooltip>
                {{ record.state === 1 ? '成功' : '失败' }}
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
    <div class="dialog-page">
      <a-pagination
          :total="page.total"
          :current="page.pageNum"
          :page-size="page.pageSize"
          show-jumper
          @change="handleCurrentChange"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import {Message} from '@arco-design/web-vue'
import {IconQuestionCircle} from '@arco-design/web-vue/es/icon'
import {getLogProcessSelect, getLogRecordPage} from "@/api/connector";

const dialogVisible = ref(false)
const sceneObject = ref({})
const processOptions = ref([])

const searchObj = reactive({
  date: [],
  processId: '',
  state: '',
})

const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const methodType = [
  {label: '成功', value: 1},
  {label: '失败', value: 0}
]

const getList = async () => {
  try {
    const params = {
      startTime: searchObj.date && searchObj.date.length > 0 ? searchObj.date[0] : '',
      endTime: searchObj.date && searchObj.date.length > 0 ? searchObj.date[1] : '',
      processId: searchObj.processId,
      state: searchObj.state,
      current: page.pageNum,
      size: page.pageSize
    }
    const res = await getLogRecordPage(sceneObject.value.id, params)

    tableData.value = (res.records || []).map((item, index) => ({
      ...item,
      index: index + 1
    }))
    page.total = res.total || 0
  } catch (error) {
    Message.error('获取日志列表失败')
  }
}

const getProcessOptions = async () => {
  try {
    const res = await getLogProcessSelect(sceneObject.value.id, {})
    processOptions.value = res || []
  } catch (error) {
    Message.error('获取流程列表失败')
  }
}

const handleSearch = () => {
  page.pageNum = 1
  getList()
}

const handleCurrentChange = (val: number) => {
  page.pageNum = val
  getList()
}

const resetSearch = () => {
  searchObj.date = []
  searchObj.processId = ''
  searchObj.state = ''

  page.pageNum = 1
  page.total = 0
  tableData.value = []
}

const showModal = (sceneObj: any) => {
  sceneObject.value = sceneObj
  dialogVisible.value = true
  resetSearch()
  getList()
  getProcessOptions()
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  resetSearch()
}

defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
.scene-log-modal {

  .title {
    font-size: 16px;
    color: #000;
    font-weight: 500;
  }

  .dialog-content {
    flex: 1;

    :deep(.arco-table) {
      height: 100%;
    }
  }

  .dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .left {
      color: rgba(0, 0, 0, 0.9);
      font-size: 14px;
    }

    .right {
      display: flex;
      gap: 10px;

      :deep(.arco-select) {
        width: 140px;
      }
    }
  }

  .dialog-page {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .question-icon {
    margin-right: 4px;
    color: #f26161;
    cursor: help;
  }
}

:deep(.arco-table) {
  .arco-table-th {
    background-color: #f3f6ff;
  }
}

// 分页样式覆盖
:deep(.arco-pagination) {
  .arco-pagination-item {
    border-radius: 3px;

    &.arco-pagination-item-active {
      background-color: #396fff;
      border-color: #396fff;
      color: #fff;
    }
  }
}
</style>
