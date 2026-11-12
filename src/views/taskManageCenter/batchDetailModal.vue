<template>
  <BaseModal :unmount-on-close="true" ref="modalRef">
    <div class="tables">
      <div class="tables-title">
        <div class="input-search-box">
          <div class="input-search">
            <span class="label">填报对象</span>
            <a-input v-model="fillObjectName" @change="refreshTaskPage" placeholder="请输入填报对象姓名" allow-clear />
          </div>
          <div class="input-search">
            <span class="label">填报部门</span>
            <a-cascader 
              placeholder="请选择填报部门" 
              :options="deptOptions" 
              v-model="fillObjectDeptIds" 
              :multiple="true"
              :check-strictly="true" 
              :field-names="{ value: 'id', label: 'label' }" 
              allow-clear
              @change="refreshTaskPage" 
            />
          </div>
        </div>
        <div class="tables-btn">
          <a-radio-group type="button" v-model="fillStateVal" @change="changeTaskState">
            <a-radio value="0">待填报</a-radio>
            <a-radio value="1">已填报</a-radio>
          </a-radio-group>
        </div>
        <div class="table-right">
          <div class="table-right-btn" @click="changeTableOrder">
            <icon-sort-ascending />
            {{ fillObjectOrder === 1 ? '最新' : '最旧' }}
          </div>
          <div class="table-right-btn" @click="refreshTaskPage">
            <icon-refresh />
            刷新
          </div>
        </div>
      </div>
      <div class="tables-body">
        <a-table :data="taskBatchObjectList" :columns="tableColumns" :pagination="false">
          <template #operation="record">
            <template v-if="fillStateVal === '0' && activeBatch?.batchState === 1">
              <div class="center-text" @click="handleFillObjectOperate('urge', record)">
                催一下
              </div>
            </template>
            <template v-if="fillStateVal === '1' && activeBatch?.batchState === 1">
              <div class="center-text" @click="handleFillObjectOperate('refill', record)">
                重填
              </div>
            </template>
            <template v-if="fillStateVal === '1'">
              <div class="center-text" @click="handleFillObjectOperate('view', record)">
                查看
              </div>
            </template>
          </template>
        </a-table>
      </div>
      <div class="tables-bottom">
        <div class="item" >
          <a-button @click="handleFillObjectOperate('urgeAll')" v-if="fillStateVal === '0' && activeBatch?.batchState === 1">
            <template #icon>
              <icon-notification/>
            </template>
            催全部待填报对象
          </a-button>
        </div>
        <a-pagination :total="pages.total" :current="pages.pageNum" :page-size="pages.pageSize"
                      :page-size-options="[10, 20, 30, 40]" @page-size-change="handleSizeChange"
                      @change="handleCurrentChange" show-total show-page-size/>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {fillObjectLaunchReset, fillObjectUrge, getFillBatchTask, getTaskBatchObjectList} from "@/api/taskFillManager";
import {getDeptTree} from "@/api/common";
import {convertToColumns, getFormById, setFormById} from "@/utils/form";
import {getCreatorApp} from "@/api/form";
import {Message, Modal} from "@arco-design/web-vue";
import BaseModal from "@/components/modal/baseModal.vue";

const modalRef = ref()

// 任务批次
interface BatchInfo {
  batchId?: string | number
  appId?: string | number
  formId?: string | number
  batchState?: number
}

const activeBatch = ref<BatchInfo>({})

const fillObjectName = ref('')
const fillObjectDeptIds = ref([])
const deptOptions = ref([])

const fillStateVal = ref('0')
const fillObjectOrder = ref(1)

const taskBatchObjectList = ref([])
const tableColumns = ref([])

// 固定字段
const fixColumns = [
  {
    title: "填报对象",
    dataIndex: "nickname",
  },
  {
    title: "填报对象所在部门",
    dataIndex: "deptName",
  }
]

const pages = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const showModal = (data: any) => {
  activeBatch.value = {...data}
  // 获取部门树
  getDeptTree().then(res => {
    deptOptions.value = res
  })
  changeTaskState('0')
  modalRef.value.handleClick({
    title: '批次详情',
    width: "1200px"
  })
}

const getFillBatchTaskPage = () => {
  const params = {
    current: pages.pageNum,
    size: pages.pageSize,
    state: fillStateVal.value,
    batchId: activeBatch.value.batchId,
    nickname: fillObjectName.value,
    depts: fillObjectDeptIds.value.map((v: any) => v[v.length - 1]).join(','),
    order: fillObjectOrder.value,
  }
  getTaskBatchObjectList(params).then(res => {
    taskBatchObjectList.value = (res.records || []).map((i: any) => {
      return { ...i, ...i.formData }
    })
    pages.total = res.total
    // 构建表格列
    buildColumns()
  })
}

const refreshTaskPage = () => {
  pages.pageNum = 1
  getFillBatchTaskPage()
}

const changeTaskState = (val: any) => {
  fillStateVal.value = val
  fillObjectName.value = ''
  fillObjectDeptIds.value = []
  refreshTaskPage()
}

const changeTableOrder = () => {
  fillObjectOrder.value = fillObjectOrder.value === 1 ? 0 : 1
  refreshTaskPage()
}

const emit = defineEmits<{
  (e: 'view', data: any, batch: any): void
}>()

const handleFillObjectOperate = (val: string, item?: any) => {
  if (val === 'view') {
    // 查看填报数据，调用API获取详情
    getFillBatchTask(item.record.id).then(res => {
      // 通过emit通知父组件打开查看弹窗
      emit('view', res, activeBatch.value)
    })
    return
  }
  if (val === 'urge') {
    Modal.confirm({
      title: "提示",
      simple: true,
      renderToBody: false,
      titleAlign: "start",
      content: '是否发起填报催办?',
      hideCancel: false,
      okText: "确认",
      onOk: () => {
        const params = {
          batchId: activeBatch.value.batchId,
          urgingType: 2,
          userIds: [item.record.userId]
        }
        fillObjectUrge(params).then(() => {
          Message.success('催办成功')
        })
      }
    })
  } else if (val === 'refill') {
    Modal.confirm({
      title: "提示",
      simple: true,
      renderToBody: false,
      titleAlign: "start",
      content: '是否发起重新填报?',
      hideCancel: false,
      okText: "确认",
      onOk: () => {
        const params = {
          batchId: activeBatch.value.batchId,
          objectId: item.record.id
        }
        fillObjectLaunchReset(params).then(() => {
          changeTaskState(fillStateVal.value)
          Message.success('发起重新填报成功')
        })
      }
    })
  } else if (val === 'urgeAll') {
    Modal.confirm({
      title: "提示",
      simple: true,
      renderToBody: false,
      titleAlign: "start",
      content: '是否催全部待填报对象?',
      hideCancel: false,
      okText: "确认",
      onOk: () => {
        const params = {
          batchId: activeBatch.value.batchId,
          urgingType: 1
        }
        fillObjectUrge(params).then(() => {
          Message.success('催办成功')
        })
      }
    })
  }
}

const handleSizeChange = (val) => {
  pages.pageSize = val
  getFillBatchTaskPage()
}

const handleCurrentChange = (val) => {
  pages.pageNum = val
  getFillBatchTaskPage()
}

const buildColumns = async () => {
  tableColumns.value = []
  // 序号字段
  tableColumns.value.push({
    title: "序号",
    key: "index",
    render: (record: any) => {
      return record.rowIndex + 1
    },
    fixed: "left",
    width: 60,
  })

  // 追加固定字段
  fixColumns.forEach((fixColumn) => {
    tableColumns.value.push(fixColumn)
  })

  if (fillStateVal.value === '1') {
    let formConfig = getFormById(activeBatch.value.appId)
    if (formConfig) {
      const res = await getCreatorApp(activeBatch.value.appId)
      formConfig = res.formConfig ? JSON.parse(res.formConfig) : {}
      setFormById(formConfig, activeBatch.value.appId)
    }
    const formFields = formConfig.formList
    const formColumn = convertToColumns(formFields)

    // 表单字段
    formColumn.forEach((column: any) => {
      tableColumns.value.push(column)
    })
  }

  // 操作字段
  tableColumns.value.push({
    title: "操作",
    width: 120,
    fixed: "right",
    slotName: "operation",
  })
}

defineExpose({
  showModal
})
</script>

<style scoped lang="scss">
.tables {
  background-color: #fff;

  &-title {
    padding: 0 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 16px;

    .input-search-box {
      display: flex;
      gap: 12px;
      flex: 1;

      .input-search {
        display: flex;
        align-items: center;
        gap: 8px;

        .label {
          font-size: 14px;
          color: #333;
          white-space: nowrap;
        }

        :deep(.arco-input-wrapper) {
          width: 200px;
          border-radius: 8px;
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        :deep(.arco-select-view) {
          width: 200px;
          border-radius: 8px;
          background: #f8fafc;
          border-color: #e2e8f0;
        }
      }
    }

    .tables-btn {
      flex-shrink: 0;
    }

    .table-right {
      display: flex;
      gap: 8px;
      flex-shrink: 0;

      .table-right-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        font-size: 14px;
        color: #666;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          background-color: #f5f5f5;
          color: #333;
        }
      }
    }
  }

  &-body {
    padding: 0;
    height: calc(100vh - 450px);
    overflow: auto;

    :deep(.arco-table-th) {
      background: #f8fafc !important;
      color: #475569;
      font-size: 12px;
      font-weight: 600;
    }

    :deep(.arco-table-td) {
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }
  }

  &-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0 0;
    border-top: 1px solid #f1f5f9;
    margin-top: 16px;
  }
}

:deep(.arco-radio-group-button) {
  .arco-radio-button {
    border-radius: 8px;
  }

  .arco-radio-checked {
    background: #dbeafe !important;
    color: #2563eb !important;
  }
}

.center-text + .center-text {
  margin-left: 10px;
}

.center-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #d97706;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;

  &:hover {
    background: #fff7ed;
  }
}
</style>
