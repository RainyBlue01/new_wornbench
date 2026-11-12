<template>
  <div class="original-panel" :class="{ 'original-panel--embedded': embedded }">
    <div class="original-content">
      <div class="original-card">
        <div class="data-toolbar">
          <a-space wrap :size="10">
            <button type="button" class="toolbar-btn " @click="goToFormInfo">
              <icon-plus />
              添加数据
            </button>
            <button v-if="!formOnlyFields" type="button" class="toolbar-btn" @click="openImportModal">
              <icon-import />
              导入数据
            </button>
            <a-trigger v-if="!formOnlyFields" position="br" auto-fit-position popup-container="body" trigger="click"
              :click-to-close="false">
              <button type="button" class="toolbar-btn">
                <icon-cloud-download />
                导出数据
                <icon-down />
              </button>
              <template #content>
                <div class="dropdown-menu-panel" @click.stop>
                  <div class="dropdown-menu-item" :class="{ 'dropdown-menu-item--disabled': !hasSelection }"
                    @click="exportData('select')">
                    <div class="dropdown-menu-label">
                      <icon-check-square />
                      <span>按选择导出</span>
                    </div>
                  </div>
                  <div class="dropdown-menu-item" :class="{ 'dropdown-menu-item--disabled': !hasActiveFilter }"
                    @click="exportData('filter')">
                    <div class="dropdown-menu-label">
                      <icon-filter />
                      <span>按筛选结果导出</span>
                    </div>
                  </div>
                  <div class="dropdown-menu-item" @click="exportData('all')">
                    <div class="dropdown-menu-label">
                      <icon-list />
                      <span>导出全部</span>
                    </div>
                  </div>
                </div>
              </template>
            </a-trigger>
          </a-space>
          <div class="toolbar-spacer" />
          <a-space wrap :size="10">
            <button type="button" class="toolbar-btn" @click="openFilterHandler">
              <icon-filter />
              数据筛选
            </button>
            <a-trigger position="br" auto-fit-position popup-container="body" trigger="click" :click-to-close="false">
              <button type="button" class="toolbar-btn">
                <icon-list />
                字段显示
                <icon-down />
              </button>
              <template #content>
                <div class="field-select-panel" @click.stop>
                  <!-- 分类菜单视图 -->
                  <div v-show="!showFieldList" class="field-menu-view">
                    <div v-for="group in visibleFieldGroups" :key="group.key" class="field-menu-item"
                      @click="handleGroupHover(group.key)">
                      <div class="field-menu-label">
                        <component :is="group.icon" />
                        <span>{{ group.label }}</span>
                        <icon-right />
                      </div>
                    </div>
                    <div class="field-divider" />
                    <div class="field-menu-item field-menu-item--reset" @click="resetToDefault">
                      <div class="field-menu-label">
                        <icon-refresh />
                        <span>恢复默认</span>
                      </div>
                    </div>
                  </div>
                  <!-- 字段列表视图 -->
                  <div v-show="showFieldList" class="field-detail-view">
                    <div class="field-detail-header" @click="handleBackToMenu">
                      <icon-left />
                      <span>{{visibleFieldGroups.find(g => g.key === activeGroup)?.label}}</span>
                    </div>
                    <div class="field-detail-content">
                      <a-checkbox v-for="field in visibleFieldGroups.find(g => g.key === activeGroup)?.fields || []"
                        :key="field.value" v-model="checkColumnOptions" :value="field.value"
                        @change="changeColumnOptions">
                        {{ field.label }}
                      </a-checkbox>
                    </div>
                  </div>
                </div>
              </template>
            </a-trigger>
            <a-trigger position="br" auto-fit-position popup-container="body" trigger="click" :click-to-close="false">
              <button type="button" class="toolbar-btn " @click="handleDeleteTriggerClick">
                <icon-delete />
                删除
                <icon-down />
              </button>
              <template #content>
                <div class="dropdown-menu-panel" @click.stop>
                  <div class="dropdown-menu-item" :class="{ 'dropdown-menu-item--disabled': !hasSelection }"
                    @click="batchDeleteHandler('select')">
                    <div class="dropdown-menu-label">
                      <icon-check-square />
                      <span>按选择删除</span>
                    </div>
                  </div>
                  <div class="dropdown-menu-item" :class="{ 'dropdown-menu-item--disabled': !hasActiveFilter }"
                    @click="batchDeleteHandler('filter')">
                    <div class="dropdown-menu-label">
                      <icon-filter />
                      <span>按筛选结果删除</span>
                    </div>
                  </div>
                  <div class="dropdown-menu-item" @click="batchDeleteHandler('all')">
                    <div class="dropdown-menu-label">
                      <icon-delete />
                      <span>删除全部</span>
                    </div>
                  </div>
                </div>
              </template>
            </a-trigger>
            <button v-if="!formOnlyFields" type="button" class="toolbar-btn" @click="toRecycle">
              <icon-delete />
              回收站
            </button>
            <button type="button" class="toolbar-btn" @click="refreshRecord">
              <icon-sync />
              刷新
            </button>
          </a-space>
        </div>
        <div ref="tableWrapRef" class="data-table-wrap">
          <a-table row-key="id" v-model:selected-keys="selectedKeys" :pagination="false" :columns="displayColumns"
            column-resizable :row-selection="{ type: 'checkbox', showCheckedAll: true }" :data="data"
            :bordered="{ cell: true }" :loading="tableLoading" :scroll="tableScroll" :scrollbar="scrollbar"
            @sorter-change="handleSortChange" @column-resize="handleColumnResize">
            <template #operation="row">
              <div class="original-operation-cell">
                <a-link v-if="!formOnlyFields" @click="upDateLift(row.record)">数据生命周期</a-link>
                <a-link @click="upDateDate(row.record)">修改</a-link>
                <a-link @click="deleteHandler(row.record)">
                  删除
                </a-link>
              </div>
            </template>
          </a-table>
        </div>
        <div class="data-pagination person-page">
          <PersonPagination :total="pagination.total" :current="pagination.current" :page-size="pagination.pageSize"
            @change="changePageNumHandler" @page-size-change="changePageSizeHandler" />
        </div>
      </div>
    </div>
    <recycle ref="recycleRef" :appdes="localAppdes" :columns="columns" />
    <lifeCycle ref="lifeCycleRef" />
    <upDateData :dept-lists="deptLists" :display-mode="formOnlyFields ? 'modal' : 'drawer'" ref="upDateDataRef"
      @init="refreshRecord" />
    <condition :dept-lists="deptLists" ref="conditionRef" @filter="conditionFilter" />
    <OriginalDataImportModal ref="importModalRef" :app-id="localAppdes.id || ''" :form-id="localAppdes.formId || ''"
      :app-name="localAppdes.appName" :map-fields="importMapFields" @success="handleImportSuccess" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import upDateData from '../original/upDateData.vue'
import lifeCycle from '../original/lifeCycle.vue'
import recycle from '../original/recycle.vue'
import {
  originalPageRecordApi,
  getOriginalApi,
  deleteOriginalApi,
  batchExportOriginal,
  filterExportOriginal,
  allExportOriginal,
  batchDeleteOriginal,
  filterDeleteOriginal,
  allDeleteOriginal,
} from '@/api/original/index'
import { getCreatorDes } from '@/api/homePage/index'
import { getDeptTree } from '@/api/common/index'
import { convertToColumns, getFormById } from '@/utils/form'
import condition from '../original/condition.vue'
import OriginalDataImportModal from './OriginalDataImportModal.vue'
import PersonPagination from '@/views/user/components/PersonPagination.vue'
import type { ImportMapField } from '@/types/originalImport'
import { blobDownload } from '@/utils/export'
import { applyColumnWidths, setColumnWidth } from '@/utils/originalColumnWidthCache'

const emits = defineEmits(['navChange'])

const props = withDefaults(
  defineProps<{
    appdes?: Record<string, any>
    embedded?: boolean
    active?: boolean
    formOnlyFields?: boolean
  }>(),
  {
    appdes: () => ({}),
    embedded: false,
    active: true,
    formOnlyFields: false,
  },
)

const route = useRoute()
const router = useRouter()
const localAppdes = ref<Record<string, any>>({})
const deptLists = ref([])
const columns = ref<any[]>([])
const showColumns = ref<any[]>([])
const data = ref<any[]>([])
const tableLoading = ref(false)
const selectedKeys = ref([])
const columnOptions = ref<any[]>([])
const checkColumnOptions = ref<any[]>([])
const matchValue = ref(false)
const conditions = ref<any[]>([])
const initialized = ref(false)
const activeGroup = ref<string | null>(null)
const showFieldList = ref(false)
const formFieldMap = ref<Map<string, any>>(new Map())
const formOnlyFields = computed(() => props.formOnlyFields)
const isNormalForm = computed(() => Number(localAppdes.value.category) === 1)
const originalDataEditEnabled = (window as any).api?.originalDataEditEnabled === true

const fieldGroups = ref([
  {
    key: 'form',
    label: '表单字段',
    icon: 'icon-file',
    fields: [] as any[],
  },
  {
    key: 'process',
    label: '流程数据',
    icon: 'icon-swap',
    fields: [] as any[],
  },
  {
    key: 'system',
    label: '系统数据',
    icon: 'icon-settings',
    fields: [] as any[],
  },
])

const visibleFieldGroups = computed(() =>
  formOnlyFields.value
    ? fieldGroups.value.filter((group) => (localAppdes.value.category === 2 && (group.key === 'form' || group.key === 'process')) || (localAppdes.value.category !== 2 && group.key === 'form'))
    : fieldGroups.value,
)

const lifeCycleRef = ref()
const upDateDataRef = ref()
const conditionRef = ref()
const recycleRef = ref()
const importModalRef = ref()
const scrollbar = ref(true)
const tableWrapRef = ref<HTMLElement | null>(null)
const tableWrapWidth = ref(0)
const columnWidthOverrides = ref<Record<string, number>>({})
let tableWrapResizeObserver: ResizeObserver | null = null

const DEFAULT_COLUMN_WIDTH = 200
const DEFAULT_MIN_COLUMN_WIDTH = 180
const TABLE_SELECTION_COLUMN_WIDTH = 48
const MIN_AUTO_FILL_COLUMN_WIDTH = 180

const importMapFields = computed<ImportMapField[]>(() => {
  const groupKeyMap: Record<string, ImportMapField['group']> = {
    form: 'form',
    process: 'process',
    system: 'system',
  }
  return fieldGroups.value.flatMap((group) =>
    group.fields.map((field) => ({
      key: field.value,
      label: field.label,
      group: groupKeyMap[group.key] || 'form',
    })),
  )
})

const getColumnWidth = (column: any): number => {
  if (column.children?.length) {
    return column.children.reduce((sum: number, child: any) => sum + getColumnWidth(child), 0)
  }

  const key = column.dataIndex || column.key
  const overrideWidth = key ? columnWidthOverrides.value[key] : undefined
  const width = overrideWidth ?? column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH
  return Math.max(Number(width) || DEFAULT_COLUMN_WIDTH, Number(column.minWidth) || DEFAULT_MIN_COLUMN_WIDTH)
}

const tableContentWidth = computed(() =>
  showColumns.value.reduce(
    (sum, column) => sum + getColumnWidth(column),
    TABLE_SELECTION_COLUMN_WIDTH,
  ),
)

const tableFillerWidth = computed(() =>
  Math.max(tableWrapWidth.value - tableContentWidth.value, 0),
)

const isAutoFillColumn = (column: any) =>
  !column.children?.length
  && column.key !== 'index'
  && column.slotName !== 'operation'
  && column.fixed !== 'right'

const getAutoFillColumnCount = (columns: any[]): number =>
  columns.reduce((count, column) => {
    if (column.children?.length) return count + getAutoFillColumnCount(column.children)
    return count + (isAutoFillColumn(column) ? 1 : 0)
  }, 0)

const applyAutoFillWidth = (columns: any[], extraWidth: number, fillCount: number): any[] => {
  const extraWidthPerColumn = fillCount > 0 ? extraWidth / fillCount : 0

  return columns.map((column) => {
    if (column.children?.length) {
      return {
        ...column,
        children: applyAutoFillWidth(column.children, extraWidth, fillCount),
      }
    }
    if (!isAutoFillColumn(column)) return column

    const width = Math.max(getColumnWidth(column) + extraWidthPerColumn, MIN_AUTO_FILL_COLUMN_WIDTH)
    return {
      ...column,
      width,
      minWidth: Math.max(Number(column.minWidth) || DEFAULT_MIN_COLUMN_WIDTH, MIN_AUTO_FILL_COLUMN_WIDTH),
    }
  })
}

const withTextOverflow = (column: any): any => {
  if (column.children?.length) {
    return { ...column, children: column.children.map(withTextOverflow) }
  }

  // Keep links, images and multi-row subform cells interactive and readable.
  if (column.slotName === 'operation' || column.key === 'index' ||
      column.parentDataIndex || ['ATTACH', 'PICTURE', 'SIGNATURE'].includes(column.dataType)) {
    return column
  }
  return { ...column, ellipsis: true, tooltip: true }
}

const displayColumns = computed(() => {
  const fillCount = getAutoFillColumnCount(showColumns.value)
  const sizedColumns = tableFillerWidth.value <= 0 || fillCount === 0
    ? showColumns.value
    : applyAutoFillWidth(showColumns.value, tableFillerWidth.value, fillCount)
  return sizedColumns.map(withTextOverflow)
})

const tableDisplayWidth = computed(() => Math.max(tableContentWidth.value, tableWrapWidth.value))

const tableScroll = computed(() => ({
  x: tableDisplayWidth.value,
  maxHeight: props.embedded ? 'calc(100vh - 267px)' : 'calc(100vh - 320px)',
}))

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
})

const fixColumns = [
  { title: '主键', dataIndex: 'id', key: 'id' },
  { title: '创建人', dataIndex: 'createUser', key: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '修改人', dataIndex: 'updateUser', key: 'updateUser' },
  { title: '修改时间', dataIndex: 'updateTime', key: 'updateTime' },
  { title: '提交ip', dataIndex: 'submitIp', key: 'submitIp' },
  {
    title: '数据来源',
    dataIndex: 'inputSource',
    key: 'inputSource',
    render: (data: any) => {
      const inputSource = data.record.inputSource
      if (inputSource == 1) return '填写'
      if (inputSource == 2) return '导入'
      return '未知'
    },
  },
]

const mergeAppdes = (source: Record<string, any>) => {
  localAppdes.value = {
    ...localAppdes.value,
    ...source,
    id: source.id ?? localAppdes.value.id ?? route.query.id,
    formId: source.formId ?? localAppdes.value.formId ?? route.query.formId,
    processId: source.processId ?? localAppdes.value.processId ?? route.query.processId,
    appName: source.appName ?? localAppdes.value.appName ?? route.query.appName,
  }
}

const goToFormInfo = () => {
  // 通过事件通知父组件切换导航状态
  emits('navChange', 'form')
}

const openImportModal = () => {
  if (!localAppdes.value.formId || !localAppdes.value.id) {
    Message.warning('应用或表单ID不存在')
    return
  }
  importModalRef.value?.open()
}

const getBaseParams = () => ({
  formId: localAppdes.value.formId,
  appId: localAppdes.value.id,
})

const getFilterParams = () => ({
  ...getBaseParams(),
  current: pagination.current,
  size: pagination.pageSize,
  logicDelete: 0,
  match: matchValue.value,
  conditions: conditions.value,
  dataIds: [] as any[],
})

/** 是否已应用有效筛选（与列表请求里的 conditions 一致，避免无筛选时误操作） */
const hasActiveFilter = computed(() =>
  (conditions.value || []).some((c: any) => c?.field && c?.symbol),
)

/** 表格是否勾选了至少一行 */
const hasSelection = computed(() => (selectedKeys.value?.length ?? 0) > 0)

/** 流程运行中：instanceState 1=运行中，0=已完成 */
const isProcessRunning = (record: any) => Number(record?.instanceState) === 1

const getSelectedRecords = () => {
  const ids = new Set(selectedKeys.value)
  return data.value.filter((row: any) => ids.has(row.id))
}

const hasRunningInSelection = () => getSelectedRecords().some(isProcessRunning)

const ensureVisitorFormAction = () => {
  if (formOnlyFields.value && !isNormalForm.value) {
    Message.warning('只有普通表单能进行操作')
    return false
  }
  return true
}

const handleDeleteTriggerClick = (event: MouseEvent) => {
  if (formOnlyFields.value && !isNormalForm.value) {
    event.stopPropagation()
    Message.warning('只有普通表单能进行操作')
  }
}

const exportData = (type: string = 'all') => {
  if (type === 'select' && selectedKeys.value.length === 0) {
    Message.warning('请先选择数据')
    return
  }
  if (type === 'filter' && !hasActiveFilter.value) {
    Message.warning('请先通过「数据筛选」设置并应用筛选条件')
    return
  }

  let request: Promise<any>
  if (type === 'select') {
    request = batchExportOriginal({
      ...getBaseParams(),
      dataIds: selectedKeys.value,
    })
  } else if (type === 'filter') {
    request = filterExportOriginal(getFilterParams())
  } else {
    request = allExportOriginal(getBaseParams())
  }

  request.then(() => {
    Message.success('请前往任务中心下载任务')
  })
}

const toRecycle = () => {
  recycleRef.value.show()
}

const openFilterHandler = () => {
  const formConfig = getFormById(localAppdes.value.id)
  conditionRef.value.show(formConfig.formList, localAppdes.value.processId, formOnlyFields.value)
}

const refreshRecord = () => {
  pagination.current = 1
  originalPageRecord()
}

const changeColumnOptions = () => {
  const allSelected = new Set(checkColumnOptions.value)
  const filteredColumns: any[] = []

  // 保留序号列
  const indexColumn = columns.value.find(c => c.key === 'index')
  if (indexColumn) filteredColumns.push(indexColumn)

  // 根据选中状态过滤字段列
  columns.value.forEach((col) => {
    if (col.slotName === 'operation') return // 跳过操作列，稍后单独添加
    if (col.key === 'index') return // 已处理序号列

    const fieldGroup = visibleFieldGroups.value.find(g =>
      g.fields.some(f => f.value === col.dataIndex)
    )

    if (fieldGroup) {
      if (allSelected.has(col.dataIndex)) {
        filteredColumns.push(col)
      }
    } else {
      // 不在分组中的列（如流程相关列）默认保留
      filteredColumns.push(col)
    }
  })

  // 添加操作列
  // filteredColumns.push({
  //   title: '操作',
  //   key: 'operation',
  //   width: 200,
  //   fixed: 'right',
  //   slotName: 'operation',
  // })

  if (formOnlyFields.value) {
    const operationColumn = columns.value.find((col) => col.slotName === 'operation')
    if (operationColumn) filteredColumns.push(operationColumn)
  }

  showColumns.value = buildShowColumns(filteredColumns)
}

const resetToDefault = () => {
  checkColumnOptions.value = []
  fieldGroups.value.forEach((g) =>
    g.fields.forEach((f) => checkColumnOptions.value.push(f.value)),
  )
  changeColumnOptions()
}

const handleGroupHover = (key: string) => {
  activeGroup.value = key
  showFieldList.value = true
}

const handleBackToMenu = () => {
  showFieldList.value = false
  activeGroup.value = null
}

const handleSortChange = (dataIndex: string, direction: string) => {

  if (!direction || direction === 'ascend') {
    data.value = [...data.value].sort((a, b) => {
      const aVal = a[dataIndex]
      const bVal = b[dataIndex]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      return aVal > bVal ? 1 : -1
    })
  } else {
    data.value = [...data.value].sort((a, b) => {
      const aVal = a[dataIndex]
      const bVal = b[dataIndex]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return -1
      if (bVal == null) return 1
      return aVal < bVal ? 1 : -1
    })
  }
  // console.log('Sort changed:', dataIndex, direction,data)
}

const upDateLift = (record: any) => {
  lifeCycleRef.value.show({
    dataId: record.id,
    formId: localAppdes.value.formId,
  })
}

const upDateDate = (record: any) => {
  if (!ensureVisitorFormAction()) return
  getOriginalApi(localAppdes.value.formId, record.id).then((res) => {
    upDateDataRef.value.showItems({ id: record.id, ...res }, localAppdes.value.formId)
  })
}

const deleteHandler = (record: any) => {
  if (!ensureVisitorFormAction()) return
  if (isProcessRunning(record)) {
    Message.warning('运行中的数据不可删除')
    return
  }
  Modal.confirm({
    title: '提示',
    simple: true,
    renderToBody: false,
    titleAlign: 'start',
    content: '确定要删除数据吗？',
    hideCancel: false,
    okText: '确认',
    onOk: async () => {
      await deleteOriginalApi({
        formId: localAppdes.value.formId,
        dataId: record.id,
      })
      Message.success('删除数据成功')
      originalPageRecord()
    },
  })
}

const batchDeleteHandler = (type: string = 'select') => {
  if (!ensureVisitorFormAction()) return
  if (type === 'select' && selectedKeys.value.length === 0) {
    Message.warning('请先选择数据')
    return
  }
  if (type === 'select' && hasRunningInSelection()) {
    Message.warning('所选数据中包含运行中的流程，运行中的数据不可删除')
    return
  }
  if (type === 'filter' && !hasActiveFilter.value) {
    Message.warning('请先通过「数据筛选」设置并应用筛选条件')
    return
  }
  Modal.confirm({
    title: '提示',
    simple: true,
    renderToBody: false,
    titleAlign: 'start',
    content: type === 'all' ? '确定要删除全部数据吗？' : '确定要删除数据吗？',
    hideCancel: false,
    okText: '确认',
    onOk: async () => {
      if (type === 'select') {
        await batchDeleteOriginal({
          ...getBaseParams(),
          dataIds: selectedKeys.value,
        })
      } else if (type === 'filter') {
        await filterDeleteOriginal(getFilterParams())
      } else {
        await allDeleteOriginal(getBaseParams())
      }
      Message.success('删除数据成功')
      selectedKeys.value = []
      originalPageRecord()
    },
  })
}

const changePageSizeHandler = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  originalPageRecord()
}

const changePageNumHandler = (current: number) => {
  pagination.current = current
  originalPageRecord()
}

const conditionFilter = (filter: any) => {
  matchValue.value = filter.match
  conditions.value = filter.conditions
  originalPageRecord()
}

// 导入成功处理
const handleImportSuccess = () => {
  refreshRecord()
}

const originalPageRecord = async () => {
  if (!localAppdes.value.formId || !localAppdes.value.id) return
  tableLoading.value = true
  try {
    const res = await originalPageRecordApi({
      formId: localAppdes.value.formId,
      appId: localAppdes.value.id,
      current: pagination.current,
      size: pagination.pageSize,
      match: matchValue.value,
      conditions: conditions.value,
    })
    pagination.total = res.total
    pagination.current = res.current
    pagination.pageSize = res.size
    const startIndex = 0
    data.value = res.records.map((record: any, index: number) => {
      const handleObj = { ...record, ...record.dataValue, rowIndex: startIndex + index }
      return handleObj
    })
  } finally {
    tableLoading.value = false
  }
}

/** 从 options 中查找 label */
const findOptionLabel = (options: any[], value: any) => {
  if (!options?.length) return null
  const opt = options.find(
    (item) => item.value === value || item.key === value || String(item.value) === String(value),
  )
  return opt?.label ?? opt?.text ?? null
}

/** 格式化字段显示值（将 value 转换为 label） */
const formatFieldDisplayValue = (field: any, rawValue?: any) => {
  const val = rawValue !== undefined ? rawValue : field?.props?.value
  if (val === null || val === undefined || val === '') return ''

  const type = field?.type
  const options = field?.props?.options || field?.props?.optionList || []

  // 调试日志：检查翻译逻辑
  // console.log('[formatFieldDisplayValue]', { fieldId: field?.id, type, val, optionsLength: options.length })

  if (type === 'USER' || type === 'DEPT') {
    if (Array.isArray(val)) {
      return val.map((item) => item?.nickname || item?.label || item?.deptName || item?.name).filter(Boolean).join('、')
    }
    return String(val)
  }
  if (type === 'USER_MULTIPLE' || type === 'DEPT_MULTIPLE') {
    if (!Array.isArray(val)) return String(val)
    return val.map((item) => item?.nickname || item?.label || item?.deptName || item?.name).filter(Boolean).join('、')
  }
  if (type === 'SELECT' || type === 'RADIO' || type === 'SWITCH') {
    const label = findOptionLabel(options, val)
    // console.log('[SELECT/RADIO]', { val, label, options })
    return label ?? String(val)
  }
  if (type === 'SELECT_MULTIPLE' || type === 'CHECKBOX') {
    const values = Array.isArray(val) ? val : String(val).split(',').filter(Boolean)
    const labels = values.map((item) => findOptionLabel(options, item) ?? String(item))
    return labels.join('、')
  }
  if (type === 'ATTACH' || type === 'PICTURE' || type === 'SIGNATURE') {
    if (Array.isArray(val)) {
      return val.map((item) => item?.fileName || item?.name || '附件').join('、')
    }
    return String(val)
  }
  if (type === 'DATE_INTERVAL' || type === 'TIME_INTERVAL') {
    if (typeof val === 'object' && val) {
      const start = val.start ?? ''
      const end = val.end ?? ''
      return [start, end].filter(Boolean).join(' ~ ')
    }
  }
  if (type === 'ADDRESS' && typeof val === 'object' && val) {
    return [val.prov, val.city, val.dist, val.det].filter(Boolean).join('')
  }
  if (typeof val === 'object') {
    return JSON.stringify(val)
  }
  return String(val)
}

/** 合并 DATE_INTERVAL/TIME_INTERVAL/ADDRESS 复合字段子列为单列 */
// Render multiple values inside one table cell with horizontal separators.
const getDisplayPartText = (item: any) => {
  if (item === null || item === undefined || item === '') return ''
  if (typeof item !== 'object') return String(item)
  return String(item.nickname || item.label || item.deptName || item.fileName || item.name || JSON.stringify(item))
}

const getTableCellDisplayParts = (field: any, rawValue?: any): string[] => {
  const val = rawValue !== undefined ? rawValue : field?.props?.value
  if (val === null || val === undefined || val === '') return []

  const type = field?.type
  const options = field?.props?.options || field?.props?.optionList || []

  if (type === 'SELECT' || type === 'RADIO' || type === 'SWITCH') {
    const label = findOptionLabel(options, val)
    return [label ?? String(val)]
  }

  if (type === 'SELECT_MULTIPLE' || type === 'CHECKBOX') {
    const values = Array.isArray(val) ? val : String(val).split(',').filter(Boolean)
    return values.map((item) => findOptionLabel(options, item) ?? String(item)).filter(Boolean)
  }

  if (type === 'DATE_INTERVAL' || type === 'TIME_INTERVAL') {
    if (typeof val === 'object' && val) {
      const start = val.start ?? ''
      const end = val.end ?? ''
      return [[start, end].filter(Boolean).join(' ~ ')].filter(Boolean)
    }
  }

  if (type === 'ADDRESS' && typeof val === 'object' && val) {
    return [[val.prov, val.city, val.dist, val.det].filter(Boolean).join('')].filter(Boolean)
  }

  const values = Array.isArray(val) ? val : [val]
  return values.map(getDisplayPartText).filter(Boolean)
}

const renderTableCellDisplayValue = (field: any, rawValue?: any) => {
  const parts = getTableCellDisplayParts(field, rawValue)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]

  return h(
    'div',
    { class: 'original-multi-value-cell', title: parts.join(' / ') },
    parts.map((part, index) =>
      h(
        'span',
        {
          class: 'original-multi-value-cell__item',
          key: `${part}-${index}`,
          title: part,
        },
        part + (index < parts.length - 1 ? '，' : ''),
      ),
    ),
  )
}

/** 鍚堝苟 DATE_INTERVAL/TIME_INTERVAL/ADDRESS 澶嶅悎瀛楁瀛愬垪涓哄崟鍒?*/
const getResizeColumnKey = (column: any) => {
  const fieldKey = column.fieldDataIndex ?? column.dataIndex
  return column.parentDataIndex && fieldKey ? `${column.parentDataIndex}.${fieldKey}` : fieldKey
}

const wrapColumnRender = (col: any) => {
  const fieldDataIndex = col.fieldDataIndex ?? col.dataIndex
  const formField = formFieldMap.value.get(fieldDataIndex)
  const originalRender = col.render

  return {
    ...col,
    render: ({ record, column }: any) => {
      const raw = record?.[fieldDataIndex]
      const renderColumn = {
        ...column,
        ...col,
        dataIndex: fieldDataIndex,
        parentDataIndex: col.parentDataIndex ?? column?.parentDataIndex,
        formField: col.formField ?? formField,
        parent: col.parentDataIndex
          ? { dataIndex: col.parentDataIndex }
          : column?.parent,
      }

      if (originalRender) {
        return originalRender({ record, column: renderColumn })
      }

      if (formField) {
        return renderTableCellDisplayValue(formField, raw)
      }

      return raw == null || raw === '' ? '' : String(raw)
    },
  }
}

const mergeCompositeColumns = (sourceColumns: any[]) => {
  const mergedColumns: any[] = []
  const seenParents = new Set<string>()

  for (const col of sourceColumns) {
    if (col.slotName === 'operation') {
      mergedColumns.push(col)
      continue
    }

    if (col.children?.length) {
      mergedColumns.push({
        ...col,
        render: undefined,
        children: col.children.map((child: any) => {
          const resizeKey = getResizeColumnKey(child)
          return wrapColumnRender({
            ...child,
            fieldDataIndex: child.fieldDataIndex ?? child.dataIndex,
            dataIndex: resizeKey,
            key: resizeKey,
            resizable: true,
          })
        }),
      })
      continue
    }

    if (col.parentFieldId) {
      if (seenParents.has(col.parentFieldId)) continue
      seenParents.add(col.parentFieldId)
      const formField = formFieldMap.value.get(col.parentFieldId)
      mergedColumns.push({
        ...col,
        title: formField?.title || col.title,
        dataIndex: col.parentFieldId,
        key: col.parentFieldId,
        parentFieldId: undefined,
        fieldPart: undefined,
        sortable: { sortDirections: ['ascend', 'descend'] },
        width: DEFAULT_COLUMN_WIDTH,
        minWidth: DEFAULT_MIN_COLUMN_WIDTH,
        render: ({ record }: any) => {
          const raw = record?.[col.parentFieldId]
          return renderTableCellDisplayValue(formField, raw)
        },
      })
    } else {
      mergedColumns.push(wrapColumnRender(col))
    }
  }
  return mergedColumns
}

const buildShowColumns = (sourceColumns: any[]) => {
  const appId = localAppdes.value.id
  const merged = mergeCompositeColumns(sourceColumns)
  return appId ? applyColumnWidths(merged, appId) : merged
}

const handleColumnResize = (dataIndex: string, width: number) => {
  const appId = localAppdes.value.id
  if (!appId || !dataIndex) return
  const nextWidth = Math.max(width, DEFAULT_MIN_COLUMN_WIDTH)
  columnWidthOverrides.value = {
    ...columnWidthOverrides.value,
    [dataIndex]: nextWidth,
  }
  setColumnWidth(appId, dataIndex, nextWidth)
}

const layoutColumnTypes = new Set(['ROW', 'COL'])

const flattenLayoutColumns = (sourceColumns: any[]): any[] => {
  return sourceColumns.flatMap((column) => {
    if (layoutColumnTypes.has(column?.dataType) && Array.isArray(column.children)) {
      return flattenLayoutColumns(column.children)
    }

    return [column]
  })
}

const getColumnDisplayTitle = (column: any) => {
  if (column?.dataType === 'SUBFORM' && !String(column.title ?? '').trim()) {
    return '子表单'
  }

  return column.title
}

const buildColumns = () => {

  const formConfig = getFormById(localAppdes.value.id)
  const formFields = formConfig?.formList ?? []
  columns.value = []
  columnWidthOverrides.value = {}
  checkColumnOptions.value = []

  // 构建字段映射表（用于翻译下拉/单选等值）
  formFieldMap.value.clear()
  const flattenFields = (list: any[]) => {
    list.forEach((item) => {
      if (item.id) {
        formFieldMap.value.set(item.id, item)
      }
      if (item.children) {
        flattenFields(item.children)
      }
    })
  }
  flattenFields(formFields)

  // Reset field groups
  fieldGroups.value[0].fields = []
  fieldGroups.value[1].fields = []
  fieldGroups.value[2].fields = []

  columns.value.push({
    title: '序号',
    key: 'index',
    render: ({ record }: any) => (record.rowIndex ?? 0) + 1,
    align: 'center',
    fixed: 'left',
    width: 75,
    minWidth: 75,
  })

  flattenLayoutColumns(convertToColumns(formFields)).forEach((column: any) => {
    const childrenCount = column.children?.length || 0
    const colDef: any = {
      ...column,
      title: getColumnDisplayTitle(column),
      sortable: { sortDirections: ['ascend', 'descend'] },
      width: DEFAULT_COLUMN_WIDTH,
      minWidth: DEFAULT_MIN_COLUMN_WIDTH,
    }
    // 多级表头：父列不参与 resize，宽度由子列撑开
    if (childrenCount) {
      colDef.children = column.children!.map((child: any) => ({
        ...child,
        sortable: { sortDirections: ['ascend', 'descend'] },
        width: DEFAULT_COLUMN_WIDTH,
        minWidth: DEFAULT_MIN_COLUMN_WIDTH,
      }))
      colDef.width = undefined
      colDef.minWidth = undefined
      colDef.resizable = false
    }
    columns.value.push(colDef)
    fieldGroups.value[0].fields.push({ label: colDef.title, value: column.dataIndex })
    checkColumnOptions.value.push(column.dataIndex)
  })
  if (!formOnlyFields.value && localAppdes.value.category === 2) {

    const instanceIdColumn = {
      title: '流程实例id',
      dataIndex: 'instanceId',
      key: 'instanceId',
      width: 180,
      sortable: { sortDirections: ['ascend', 'descend'] },
      minWidth: DEFAULT_MIN_COLUMN_WIDTH,
    }
    columns.value.push(instanceIdColumn)
    fieldGroups.value[1].fields.push({ label: instanceIdColumn.title, value: instanceIdColumn.dataIndex })
    checkColumnOptions.value.push(instanceIdColumn.dataIndex)

    const instanceStateColumn = {
      title: '流程状态',
      dataIndex: 'instanceState',
      key: 'instanceState',
      width: 100,
      minWidth: DEFAULT_MIN_COLUMN_WIDTH,
      sortable: { sortDirections: ['ascend', 'descend'] },
      render: (row: any) => {
        const instanceState = row.record.instanceState
        if (instanceState == 1) return '运行中'
        if (instanceState == 0) return '已完成'
        return '未知状态'
      },
    }
    columns.value.push(instanceStateColumn)
    fieldGroups.value[1].fields.push({ label: instanceStateColumn.title, value: instanceStateColumn.dataIndex })
    checkColumnOptions.value.push(instanceStateColumn.dataIndex)
  }
  if (!formOnlyFields.value) {
    fixColumns.forEach((fixColumn) => {
      const fixCol = { ...fixColumn, sortable: { sortDirections: ['ascend', 'descend'] }, width: DEFAULT_COLUMN_WIDTH, minWidth: DEFAULT_MIN_COLUMN_WIDTH }
      // if (fixColumn.dataIndex === 'id') {
      //   fixCol.width = 200
      //   fixCol.minWidth = 140
      // }
      columns.value.push(fixCol)
      fieldGroups.value[2].fields.push({ label: fixColumn.title, value: fixColumn.dataIndex })
      checkColumnOptions.value.push(fixColumn.dataIndex)
    })
  }



  // 同步到 showColumns：合并复合字段子列为单列，并应用本地列宽缓存
  if (formOnlyFields.value) {
    const instanceStateColumn = {
      title: '流程状态',
      dataIndex: 'instanceState',
      key: 'instanceState',
      width: 100,
      minWidth: DEFAULT_MIN_COLUMN_WIDTH,
      sortable: { sortDirections: ['ascend', 'descend'] },
      render: (row: any) => {
        const instanceState = row.record.instanceState
        if (instanceState == 1) return '运行中'
        if (instanceState == 0) return '已完成'
        return '未知状态'
      },
    }
    if (localAppdes.value.category === 2) {
      columns.value.push(instanceStateColumn)
      fieldGroups.value[1].fields.push({ label: instanceStateColumn.title, value: instanceStateColumn.dataIndex })
      checkColumnOptions.value.push(instanceStateColumn.dataIndex)
    }

    columns.value.push({
      title: '操作',
      key: 'operation',
      width: 140,
      minWidth: 140,
      fixed: 'right',
      slotName: 'operation',
    })
  } else if (originalDataEditEnabled) {
    columns.value.push({
      title: '操作',
      key: 'operation',
      width: 220,
      minWidth: 220,
      fixed: 'right',
      slotName: 'operation',
    })
  }

  showColumns.value = buildShowColumns(columns.value)
}

const initPageData = () => {
  if (!localAppdes.value.id || !localAppdes.value.formId) return
  buildColumns()
  originalPageRecord()
  initialized.value = true
}

const loadAppdesAndInit = async () => {
  const appId = localAppdes.value.id
  if (!appId) return

  if (props.embedded && props.appdes?.formId) {
    initPageData()
    return
  }

  try {
    const res = await getCreatorDes(appId)
    mergeAppdes(res)
  } catch {
    // ignore
  }
  initPageData()
}

watch(
  () => props.appdes,
  (val) => {
    if (!val?.id) return
    mergeAppdes(val)
    if (props.active && val.formId) {
      loadAppdesAndInit()
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => props.active,
  (visible) => {
    if (visible && localAppdes.value.id && localAppdes.value.formId) {
      if (!initialized.value) {
        loadAppdesAndInit()
      } else {
        originalPageRecord()
      }
    }
  },
)

onMounted(() => {
  if (tableWrapRef.value) {
    tableWrapResizeObserver = new ResizeObserver(([entry]) => {
      tableWrapWidth.value = Math.ceil(entry.contentRect.width)
    })
    tableWrapResizeObserver.observe(tableWrapRef.value)
  }

  getDeptTree().then((res) => {
    deptLists.value = res
  })

  if (!props.embedded) {
    mergeAppdes({
      id: route.query.id,
      formId: route.query.formId,
      processId: route.query.processId,
      appName: route.query.appName,
    })
    if (props.active) {
      loadAppdesAndInit()
    }
  }
})

onBeforeUnmount(() => {
  tableWrapResizeObserver?.disconnect()
  tableWrapResizeObserver = null
})
</script>
<style lang="scss" scoped></style>
<style lang="scss">
/* 简单下拉菜单样式 - 用于导入、导出、删除等操作菜单 */
.dropdown-menu-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  padding: 8px 0;

  .dropdown-menu-item {
    padding: 10px 16px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #f8fafc;
    }

    &.dropdown-menu-item--disabled {
      opacity: 0.45;
      cursor: not-allowed;

      &:hover {
        background: transparent;
      }
    }
  }

  .dropdown-menu-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #475569;

    svg {
      font-size: 15px;
      color: #94a3b8;
    }

    span {
      flex: 1;
    }
  }
}

/* 字段显示面板样式 - 包含分类菜单和字段列表 */
.field-select-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  padding: 8px 0;

  .field-menu-item {
    padding: 10px 16px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #f8fafc;
    }
  }

  .field-menu-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #475569;

    svg {
      font-size: 15px;
      color: #94a3b8;
    }

    span {
      flex: 1;
    }

    .icon-right {
      margin-left: auto;
      font-size: 12px;
      color: #cbd5e1;
    }
  }

  .field-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 4px 0;
  }

  .field-menu-item--reset {
    .field-menu-label {
      color: #64748b;
      justify-content: center;
      gap: 6px;

      svg {
        color: #94a3b8;
      }
    }

    &:hover {
      background: #f8fafc;

      .field-menu-label {
        color: rgb(var(--primary-6));
      }
    }
  }

  /* 字段列表视图样式 */
  .field-detail-view {
    .field-detail-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      background: #f8fafc;
      transition: background 0.2s;

      &:hover {
        background: #f1f5f9;
      }

      svg {
        font-size: 16px;
        color: #64748b;
      }
    }

    .field-detail-content {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 260px;
      overflow-y: auto;

      :deep(.arco-checkbox) {
        margin: 0;
        margin-top: 5px;
        font-size: 13px;
        color: #475569;
      }

      :deep(.arco-checkbox-label) {
        color: #475569;
      }

      :deep(.arco-checkbox-checked .arco-checkbox-label) {
        color: rgb(var(--primary-6));
        font-weight: 500;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
@use "@/styles/system-settings.scss";

.original-panel::v-deep {

  .arco-input-wrapper,
  .arco-textarea-wrapper {
    border-radius: 8px !important;
  }
}

.original-panel {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;

  &--embedded {
    min-height: auto;
    flex: 1;
    background: transparent;
  }
}

.original-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .original-panel--embedded & {
    padding: 24px 16px 24px;
  }
}

.original-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 24px;
}

.data-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.toolbar-spacer {
  flex: 1;
  min-width: 12px;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  transition: all 0.2s ease;
  font-family: inherit;
  line-height: 1.4;

  &:hover {
    background: #f8fafc;
    color: #334155;
    border-color: #cbd5e1;
  }

  &--primary {
    color: #fff;
    background: rgb(var(--primary-6));
    border-color: rgb(var(--primary-6));

    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  }

  &--danger {
    color: #ef4444;
    border-color: #fecaca;

    &:hover {
      background: #fef2f2;
      color: #dc2626;
      border-color: #fca5a5;
    }
  }

  :deep(svg) {
    font-size: 14px;
  }
}

/* 字段显示面板样式保留在 scoped 中，因为它没有被渲染到 body */

.data-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;

  :deep(.arco-table) {
    border: 0px solid #e2e8f0;
    border-radius: 16px;
  }

  :deep(.arco-table-container) {
    border-radius: 16px;
    border: 0;
  }

  :deep(.arco-table-th) {
    background: #f8fafc !important;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    // padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
  }

  :deep(.arco-table-td) {
    // padding: 14px 16px;
    color: #334155;
    font-size: 13px;
    border-bottom: 1px solid #f1f5f9;
    white-space: normal;
    vertical-align: middle;

    .arco-table-cell {
      padding: 9px 16px;
    }
  }

  :deep(.arco-table-tr:hover .arco-table-td) {
    background: #f8fafc;
  }

  :deep(.arco-table-tr:last-child .arco-table-td) {
    border-bottom: none;
  }

  :deep(.arco-link) {
    color: rgb(var(--primary-6));
    font-weight: 500;
    padding: 0;
  }

  :deep(.original-multi-value-cell) {
    display: block;
    max-width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    //  border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
    //background: #fff;
    vertical-align: middle;
  }

  :deep(.original-multi-value-cell__item) {
    // min-width: 0;
    // max-width: 160px;
    // padding: 2px 8px;
    // color: #334155;
    // line-height: 20px;
    // white-space: nowrap;
    // overflow: hidden;
    // text-overflow: ellipsis;
    //border-right: 1px solid #e2e8f0;
  }

  :deep(.original-multi-value-cell__item:last-child) {
    border-right: 0;
  }

  :deep(.original-operation-cell) {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  :deep(.original-operation-cell > .arco-link + .arco-link) {
    margin-left: 12px;
  }

  :deep(.arco-table-cell:has(.arco-table-td-content > div + div)) {
    height: 100%;
    padding: 0;
  }

  :deep(.arco-table-td-content:has(> div + div)) {
    display: flex;
    min-height: 100%;
    flex-direction: column;
    justify-content: center;
  }

  :deep(.arco-table-td-content:has(> div + div) > div) {
    margin-bottom: 0 !important;
    padding: 7px 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  :deep(.arco-table-td-content:has(> div + div) > div:first-child) {
    padding-top: 7px;
  }

  :deep(.arco-table-td-content:has(> div + div) > div:last-child) {
    padding-bottom: 7px;
    border-bottom: 0;
  }

  :deep(.arco-checkbox-checked .arco-checkbox-icon),
  :deep(.arco-checkbox-indeterminate .arco-checkbox-icon) {
    background-color: rgb(var(--primary-6));
    border-color: rgb(var(--primary-6));
  }
}

.data-pagination {
  flex-shrink: 0;
}
</style>
