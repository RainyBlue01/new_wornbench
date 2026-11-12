<template>
  <div class="ds-page">
    <header class="ds-page-header">
      <div class="ds-page-header__left">
        <button type="button" class="ds-back-btn" @click="goBack">
          <icon-left />
          <span>返回</span>
        </button>
        <div class="ds-breadcrumb">
          <span>工作台</span>
          <span class="ds-breadcrumb__sep">/</span>
          <span>{{ reportConfig.name || '报表' }}</span>
          <span class="ds-breadcrumb__sep">/</span>
          <span class="ds-breadcrumb__current">数据源设置</span>
        </div>
      </div>
      <div class="ds-page-header__right">
        <a-button type="primary" class="ds-save-btn" :loading="saving" @click="saveReport">
          <i v-if="!saving" class="fas fa-save ds-save-btn__icon" aria-hidden="true"></i>
          <span>保存</span>
        </a-button>
      </div>
    </header>

    <div class="ds-main-layout">
      <aside class="ds-sidebar-left">
        <div class="ds-sidebar-left__inner">
          <div class="ds-panel-section">
            <div class="ds-panel-subtitle">数据源</div>
            <a-select v-model="selectedDatasource" allow-search placeholder="请选择" class="ds-datasource-select"
              @change="handleDatasourceChange">
              <a-option v-for="item in datasourceOptions" :key="item.appId" :label="item.appName" :value="item.appId" />
            </a-select>
          </div>

          <div class="ds-panel-section" v-show="selectedDatasource">
            <div class="ds-panel-header-row">
              <div class="ds-panel-subtitle">字段</div>
              <span class="ds-add-link" @click="showAddFxModal">+ 新增计算字段</span>
            </div>

            <template v-for="(category, idx) in fieldCategories" :key="idx">
              <div class="ds-panel-section" v-if="category.fields.length > 0">
                <div class="ds-panel-subtitle">{{ category.name }}</div>
                <ul class="ds-field-list">
                  <template v-for="(field, fIdx) in category.fields" :key="fIdx">
                    <li v-if="field.children && field.children.length > 0">
                      <div class="ds-field-item ds-field-item--parent" @click="field.expanded = !field.expanded">
                        <span class="ds-field-item__label">{{ field.label }}</span>
                        <icon-down v-if="!field.expanded" class="ds-field-item__expand" />
                        <icon-up v-else class="ds-field-item__expand" />
                      </div>
                      <div class="ds-field-children" v-show="field.expanded">
                        <div v-for="(child, cIdx) in field.children" :key="cIdx"
                          class="ds-field-item ds-field-item--child" draggable="true"
                          @dragstart="handleFieldDragStart($event, child)">
                          <span class="ds-field-item__label">{{ child.label }}</span>
                          <span class="ds-field-item__type">{{ getFieldTypeLabel(child) }}</span>
                        </div>
                      </div>
                    </li>
                    <li v-else class="ds-field-item" draggable="true" @dragstart="handleFieldDragStart($event, field)">
                      <span class="ds-field-item__label">{{ field.label }}</span>
                      <span class="ds-field-item__type">{{ getFieldTypeLabel(field) }}</span>
                    </li>
                  </template>
                </ul>
              </div>
            </template>

            <div class="ds-panel-section" v-if="fxFields.length > 0">
              <div class="ds-panel-subtitle">计算字段</div>
              <ul class="ds-field-list">
                <li v-for="(field, fIdx) in fxFields" :key="fIdx" class="ds-field-item" draggable="true"
                  @dragstart="handleFieldDragStart($event, field)">
                  <span class="ds-field-item__label">{{ field.label }}</span>
                  <div class="ds-field-item__actions">
                    <icon-edit class="action-icon" @click.stop="editFxField(field, fIdx)" />
                    <icon-delete class="action-icon" @click.stop="deleteFxField(fIdx)" />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aside>

      <div class="ds-center-with-right" v-show="selectedDatasource">
        <main class="ds-content-area">
          <div class="ds-section-card">
            <div class="ds-section-card__header">
              <span class="ds-section-card__title">显示字段</span>
            </div>
            <div class="ds-section-card__body">
              <div class="ds-tag-area" @dragover="allowDrop" @drop.stop="handleDropDisplayFields">
                <span v-if="displayFields.length === 0" class="ds-tag-area__placeholder">拖拽字段到此处</span>
                <div v-for="(field, idx) in displayFields" :key="idx" class="ds-tag-area-item" draggable="true"
                  @dragstart="handleDisplayFieldDragStart($event, idx)" @drop="handleDisplayFieldDrop($event, idx)"
                  @dragover="allowDrop">
                  <SelectItem :data="field" :index="idx" :deptList="deptList" @deleteItem="removeDisplayField"
                    @editName="(payload) => handleEditName(idx, payload)"
                    @editAlign="(align) => handleEditAlign(idx, align)" @editTag="(tag) => handleEditTag(idx, tag)"
                    @editType="(form, data) => handleEditType(idx, form, data)"
                    @editChild="(form) => handleEditChild(idx, form)"
                    @editWarningPlans="(plans) => handleEditWarningPlans(idx, plans)" />
                </div>
              </div>
            </div>
          </div>

          <div class="ds-section-card">
            <div class="ds-section-card__header">
              <span class="ds-section-card__title">过滤条件</span>
            </div>
            <div class="ds-section-card__body">
              <div class="ds-tag-area" @dragover="allowDropItem" @drop="handleDropConditionFields">
                <span v-if="conditionFields.length === 0" class="ds-tag-area__placeholder">拖拽字段到此处</span>
                <div v-for="(field, idx) in conditionFields" :key="idx" class="ds-tag-area-item" draggable="true"
                  @dragstart="handleConditionFieldDragStart($event, idx)">
                  <ConditionItem :ref="(el: any) => setConditionItemRef(el, idx)" :data="field" :index="idx"
                    :deptList="deptList" :formList="allFormFields" @deleteCondition="removeConditionField"
                    @updateFilter="handleUpdateFilter" />
                </div>
              </div>
            </div>
          </div>

          <div class="ds-section-card">
            <div class="ds-section-card__header">
              <span class="ds-section-card__title">基础报表</span>
            </div>
            <div class="ds-section-card__body ds-section-card__body--no-padding ds-preview-wrap">
              <div ref="tableWrapRef" class="table-body">
                <a-table v-if="tableData.length > 0" row-key="id" :data="tableData" :columns="displayTableColumns"
                  :pagination="false" :scroll="tableScroll" :row-selection="rowSelection" column-resizable
                  :stripe="reportConfig.style.stripe" :loading="tableLoading" :bordered="{ wrapper: true, cell: true }"
                  @column-resize="handleColumnResize" @row-click="handleRowClick" />
                <div class="empty-table-tip" v-else>请先配置显示字段</div>
              </div>
              <PersonPagination v-if="reportConfig.fun.pageable && tableData.length > 0" :total="pagination.total"
                :current="pagination.pageNum" :page-size="pagination.pageSize" @change="handlePageChange"
                @page-size-change="handlePageSizeChange" />
            </div>
          </div>
        </main>

        <aside class="ds-sidebar-right">
          <div class="ds-panel-section">
            <div class="ds-panel-title">表格功能</div>
            <label class="ds-checkbox-row">
              <a-checkbox v-model="reportConfig.fun.checkBox">数据多选</a-checkbox>
            </label>
            <label class="ds-checkbox-row">
              <a-checkbox v-model="reportConfig.fun.showNum">显示序号</a-checkbox>
            </label>
            <label class="ds-checkbox-row">
              <a-checkbox v-model="reportConfig.fun.pageable">分页配置</a-checkbox>
            </label>
            <label class="ds-checkbox-row">
              <a-checkbox v-model="reportConfig.fun.download">数据下载</a-checkbox>
            </label>
            <label class="ds-checkbox-row">
              <a-checkbox v-model="reportConfig.fun.fixedHeader">固定表头</a-checkbox>
            </label>
          </div>

          <div class="ds-panel-section">
            <div class="ds-panel-title">固定列</div>
            <div class="ds-prop-row">
              <span class="ds-prop-row__label">固定右侧</span>
              <div class="ds-prop-row__value">
                <a-checkbox v-model="reportConfig.fun.right.enable" />
                <a-input-number v-model="reportConfig.fun.right.row" class="ds-prop-input" :min="1"
                  :max="displayFields.length || 1" size="small" />
                <span class="ds-prop-row__unit">列</span>
              </div>
            </div>
            <div class="ds-prop-row">
              <span class="ds-prop-row__label">固定左侧</span>
              <div class="ds-prop-row__value">
                <a-checkbox v-model="reportConfig.fun.left.enable" />
                <a-input-number v-model="reportConfig.fun.left.row" class="ds-prop-input" :min="1"
                  :max="displayFields.length || 1" size="small" />
                <span class="ds-prop-row__unit">列</span>
              </div>
            </div>
          </div>

          <div class="ds-panel-section">
            <div class="ds-panel-title">表格样式</div>
            <div class="ds-prop-row">
              <span class="ds-prop-row__label">表头字体颜色</span>
              <div class="ds-prop-row__value">
                <a-checkbox v-model="reportConfig.style.meterHeader.enable" />
                <a-color-picker v-model="reportConfig.style.meterHeader.color" size="small" />
              </div>
            </div>
            <div class="ds-prop-row">
              <span class="ds-prop-row__label">内容字体颜色</span>
              <div class="ds-prop-row__value">
                <a-checkbox v-model="reportConfig.style.content.enable" />
                <a-color-picker v-model="reportConfig.style.content.color" size="small" />
              </div>
            </div>
            <div class="ds-prop-row">
              <span class="ds-prop-row__label">对齐方式</span>
              <div class="ds-align-btns">
                <button type="button" class="ds-align-btn"
                  :class="{ 'ds-align-btn--active': reportConfig.style.align.align === 'left' }"
                  @click="setTableAlign('left')">
                  <i class="fas fa-align-left"></i>
                </button>
                <button type="button" class="ds-align-btn"
                  :class="{ 'ds-align-btn--active': reportConfig.style.align.align === 'center' }"
                  @click="setTableAlign('center')">
                  <i class="fas fa-align-center"></i>
                </button>
                <button type="button" class="ds-align-btn"
                  :class="{ 'ds-align-btn--active': reportConfig.style.align.align === 'right' }"
                  @click="setTableAlign('right')">
                  <i class="fas fa-align-right"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="ds-panel-section">
            <div class="ds-panel-title">其他</div>
            <label class="ds-checkbox-row">
              <a-checkbox v-model="reportConfig.style.stripe">斑马纹（行）</a-checkbox>
            </label>
          </div>
        </aside>
      </div>

      <div class="ds-empty-panel" v-show="!selectedDatasource">
        <div class="ds-empty-panel__box">
          <img src="@/assets/zanwuneirong@2x.png" alt="" class="ds-empty-panel__image" />
          <div class="ds-empty-panel__text">请从左侧选择您所需的数据源开始配置组件...</div>
        </div>
      </div>
    </div>

    <FxFieldModal ref="fxFieldModalRef" @confirm="handleFxFieldConfirm" @cancel="handleFxFieldCancel" />
    <Details ref="detailsRef" />
  </div>
</template>

<script setup lang="ts">
import { listByRelation } from '@/api/homePage/index'
import { getAppForm } from '@/api/common/index'
import { saveReportDesign, queryReportData } from '@/api/designer/index'
import { addClassToLayout } from '@/data/designer.js'
// import { getDesignerById } from '@/utils/designer'
import { getFormById, setFormById } from '@/utils/form'
import { setReportFormList } from '@/data/data_form.js'
import { getWarningColor } from '@/utils/warningCondition'
import { isFileFieldType, parseFileFieldValue } from '@/utils/fileFieldValue'
import { openFilePreview } from '@/utils/filePreview'
import { getReportDetailDisplayValue } from '@/utils/reportDetailValue'
import { getReportFieldFormatKind } from '@/utils/reportFieldFormat'
import { applyReportColumnWidths } from '@/utils/reportColumnWidth'
import { useResizableTableColumns } from '@/composables/useResizableTableColumns'
import FxFieldModal from './FxFieldModal.vue'
import SelectItem from './selectItem.vue'
import ConditionItem from './conditionItem.vue'
import Details from '@/components/basic/details.vue'
import PersonPagination from '@/views/user/components/PersonPagination.vue'
import { getDeptTree } from '@/api/common/index'
import { ref, reactive, nextTick, onMounted, computed, watch, h, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconLeft, IconUp, IconDown, IconEdit, IconDelete, IconClose, IconRight } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()
const formConfigs = ref(getFormById(route.query.appId))

// 报表标题
const reportTitle = ref('报表标题')

// 数据源相关
const selectedDatasource = ref('')
const datasourceOptions = ref<any[]>([])

// 字段相关
const fieldCategories = reactive([
  { name: '文本字段', collapsed: false, fields: [] as any[] },
  { name: '数字字段', collapsed: false, fields: [] as any[] },
  { name: '日期字段', collapsed: false, fields: [] as any[] },
  { name: '系统字段', collapsed: false, fields: [] as any[] },
  { name: '流程字段', collapsed: false, fields: [] as any[] }
])
const fxFields = ref<any[]>([])

// 显示字段和过滤条件
const displayFields = ref<any[]>([])
const conditionFields = ref<any[]>([])
const conditionItemRefs = ref<Record<number, any>>({})

const filterData = () => {

}
provide("provideDesigner", { filterData });
const setConditionItemRef = (el: any, idx: number) => {
  if (el) conditionItemRefs.value[idx] = el
  else delete conditionItemRefs.value[idx]
}

// 部门列表（供过滤条件中人员/部门选择使用）
const deptList = ref<any[]>([])
// 所有表单字段列表（供过滤条件使用）
const allFormFields = ref<any[]>([])

// 表格数据
const tableData = ref<any[]>([])
const tableColumns = ref<any[]>([])

// 报表配置
const reportConfig = reactive({
  name: '',
  fun: {
    checkBox: false,
    showNum: false,
    pageable: false,
    download: false,
    fixedHeader: false,
    right: { enable: false, row: 1 },
    left: { enable: false, row: 1 }
  },
  style: {
    theme: { enable: false, color: '#409EFF' },
    meterHeader: { enable: false, color: '#409EFF' },
    content: { enable: false, color: '#409EFF' },
    align: { enable: false, align: 'left' },
    stripe: true
  }
})
const token = localStorage.getItem("wornbench_token");

const previewLinkStyle = (cellColor?: string) => ({
  color: cellColor || 'var(--color-primary)',
  cursor: 'pointer',
  fontSize: '12px',
})

const stopRowClick = (e: Event) => e.stopPropagation()

const overflowColumnProps = {
  ellipsis: true,
  tooltip: { position: 'top' },
}
const tableWrapRef = ref<HTMLElement | null>(null)
const {
  columnWidthOverrides: resizedColumnWidths,
  displayColumns: displayTableColumns,
  scrollX: tableScrollX,
  handleColumnResize,
  resetColumnWidths,
} = useResizableTableColumns({
  columns: tableColumns,
  containerRef: tableWrapRef,
  selectionEnabled: () => reportConfig.fun.checkBox,
})

const renderCellContent = (val: any, rawVal: any, compType: string | undefined, warningPlans: any[]) => {
  const cellColor = getWarningColor(rawVal ?? val, warningPlans)
  const colorStyle = cellColor ? { color: cellColor } : {}

  if (compType === 'SIGNATURE') {
    if (!val) return h('div', '')
    return h('div', {
      style: {
        ...(cellColor ? { display: 'inline-block', boxShadow: `0 0 0 2px ${cellColor}`, borderRadius: '4px' } : {}),
        cursor: 'pointer',
      },
      onClick: (e: Event) => {
        stopRowClick(e)
        openFilePreview({ path: val, fileName: 'signature.png', type: 1 })
      },
    }, [h('img', {
      src: (window as any).api?.dowUrl + val + "&token=" + token,
      style: { height: '40px', marginBottom: '4px', display: 'block' },
    })])
  }

  if (isFileFieldType(compType)) {
    const files = parseFileFieldValue(val)
    if (files.length > 0) {
      return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px 0' } },
        files.map((file: any) => h('a', {
          href: 'javascript:void(0)',
          onClick: (e: Event) => {
            stopRowClick(e)
            e.preventDefault()
            openFilePreview(file)
          },
          style: previewLinkStyle(cellColor),
        }, file.fileName)))
    }
    return h('div', '')
  }

  return h('span', { style: colorStyle }, val ?? '')
}

// 仅重建列定义（不重新请求数据）
const rebuildColumns = () => {
  const globalAlign = reportConfig.style.align
  const headerCfg = reportConfig.style.meterHeader
  const contentCfg = reportConfig.style.content
  const leftCfg = reportConfig.fun.left
  const rightCfg = reportConfig.fun.right

  // 过滤掉仅详情显示的字段（tag === true）
  const visibleFields = displayFields.value.filter((field: any) => !field.tag)
  const total = visibleFields.length

  const dataColumns = visibleFields.map((field: any, idx: number) => {

    const col: any = {
      ...overflowColumnProps,
      title: field.showLabel,
      dataIndex: field.column,
      width: field.width || 200,
      align: field.align ? field.align : globalAlign.enable ? globalAlign.align : 'left',
      render: ({ record }: any) => {
        const fieldData = field.code ? record[field.code] : record[field.column]
        // 适配新数据格式：{ rawValue: '...', formatValue: '...' }
        let val = fieldData?.formatValue !== undefined ? fieldData.formatValue : fieldData

        // 处理选项字段映射
        if (field.column == 'instance_state' || field.column == 'input_source') {
          field.extra?.options?.map(v => {
            if (v.value == val) {
              val = v.label
            }
          })
        }

        const checkVal = fieldData?.rawValue !== undefined ? fieldData.rawValue : val
        return renderCellContent(val, checkVal, field.type, field.warningPlans || [])
      },
    }

    if (headerCfg.enable && headerCfg.color) {
      col.headerCellStyle = { color: headerCfg.color }
    }

    if (contentCfg.enable && contentCfg.color) {
      col.bodyCellStyle = { color: contentCfg.color }
    }

    if (leftCfg.enable && idx < leftCfg.row) {
      col.fixed = 'left'
    }

    if (rightCfg.enable && idx >= total - rightCfg.row) {
      col.fixed = 'right'
    }
    // 处理关联查询和子表单的分组表头
    if ((field.type === 'RELATION_DATA' || field.type === 'SUBFORM') && field.extra?.children && field.extra.children.length > 0) {
      col.children = field.extra.children.map((child: any) => {
        const childCol: any = {
          ...overflowColumnProps,
          title: child.showLabel,
          dataIndex: `${field.column}.${child.column || child.id}`,
          width: child.width || 150,
          align: child.align ? child.align : globalAlign?.enable ? globalAlign.align : 'left',
          render: ({ record }: any) => {
            // 获取子字段数据
            const parentData = record[field.column]
            const compType = child.type || child.componentType
            const childKey = child.column || child.id

            // 适配新的子表单数据格式：{ formatValue: [{字段ID: 值, ...}, ...], rawValue: [{字段ID: 值, ...}, ...] }
            let dataArray = []
            if (parentData && typeof parentData === 'object') {
              // 优先取 formatValue 数组（直接就是包含字段值的对象数组）
              dataArray = parentData.formatValue || parentData.rawValue || []
            } else if (Array.isArray(parentData)) {
              dataArray = parentData
            }
            // 处理多条数据（数组）
            if (Array.isArray(dataArray) && dataArray.length > 0) {
              const rawArray = parentData?.rawValue || dataArray
              return h('div', dataArray.map((item: any, rowIdx: number) => {
                let rowVal = ''
                let rowRaw = ''
                if (item && typeof item === 'object') {
                  rowVal = item[childKey] ?? ''
                }
                const rawItem = rawArray[rowIdx]
                if (rawItem && typeof rawItem === 'object') {
                  rowRaw = rawItem[childKey] ?? rowVal
                } else {
                  rowRaw = rowVal
                }

                return renderCellContent(rowVal, rowRaw, compType, child.warningPlans || [])
              }))
            }

            return h('span', '')
          },
        }

        if (headerCfg?.enable && headerCfg.color) {
          childCol.headerCellStyle = { color: headerCfg.color }
        }
        if (contentCfg?.enable && contentCfg.color) {
          childCol.bodyCellStyle = { color: contentCfg.color }
        }

        return childCol
      })
    }

    // 处理节点信息字段的分组表头
    if (field.nodeInfo && field.extra) {
      const nodeKeys = ['operator', 'status', 'duration']
      col.children = nodeKeys.map(key => {
        const config = field.extra[key] || {}
        const childCol: any = {
          ...overflowColumnProps,
          title: config.showLabel || key,
          dataIndex: `${field.column}.${key}`,
          width: config.width || 150,
          align: config.align || (globalAlign?.enable ? globalAlign.align : 'left'),
          render: ({ record }: any) => {
            console.log(record)
            const nodeData = record[field.column]
            const val = nodeData?.formatValue?.[key] ?? ''
            return h('span', val)
          }
        }
        if (headerCfg?.enable && headerCfg.color) {
          childCol.headerCellStyle = { color: headerCfg.color }
        }
        if (contentCfg?.enable && contentCfg.color) {
          childCol.bodyCellStyle = { color: contentCfg.color }
        }
        return childCol
      })
    }

    return col
  })

  const columns: any[] = []

  if (reportConfig.fun.showNum) {
    const indexCol: any = {
      title: '序号',
      width: 60,
      align: 'center',
      render: ({ rowIndex }: any) => `${rowIndex + 1}`,
    }

    if (headerCfg.enable && headerCfg.color) {
      indexCol.headerCellStyle = { color: headerCfg.color }
    }

    if (contentCfg.enable && contentCfg.color) {
      indexCol.bodyCellStyle = { color: contentCfg.color }
    }

    if (leftCfg.enable) {
      indexCol.fixed = 'left'
    }
    columns.push(indexCol)
  }

  columns.push(...dataColumns)
  tableColumns.value = columns
}

const loadTableData = async () => {
  if (displayFields.value.length === 0) {
    tableData.value = []
    pagination.total = 0
    return
  }

  const datasource = datasourceOptions.value.find(
    (d: any) => d.appId === selectedDatasource.value
  )
  if (!datasource) return
  const config = {
    data: {
      appId: selectedDatasource.value,
      formId: datasource.formId,
      selectFields: displayFields.value,
      conditionFields: conditionFields.value,
    },
    fun: reportConfig.fun,
    style: reportConfig.style,
    fxFields: fxFields.value,
  }

  const params = {
    componentId: route.query.id,
    componentType: reportConfig.type,
    reportId: formConfigs.value.reportId,
    componentConfig: JSON.stringify(config),

  }
  if (reportConfig.fun.pageable) {
    params.size = pagination.pageSize
    params.current = pagination.pageNum
  }

  tableLoading.value = true
  try {
    const res = await queryReportData(params)
    if (reportConfig.fun.pageable) {
      pagination.total = res.total ?? 0
      tableData.value = res.records
    } else {
      pagination.total = res.total ?? 0
      tableData.value = res
    }
  } catch (error) {
    console.error('加载表格数据失败:', error)
    tableData.value = []
    pagination.total = 0
  } finally {
    tableLoading.value = false
  }
}
// 更新表格列并加载数据
const updateTableColumns = () => {
  rebuildColumns()
  loadTableData()
}

formConfigs.value.formList.map(v => {
  if (v.id == route.query.id) {
    console.log(v)
    reportConfig.name = v.name
    reportConfig.props = v.props
    reportConfig.fun = v.props.fun
    reportConfig.style = v.props.style
    reportConfig.type = v.type
    displayFields.value = v.props.data.selectFields
    conditionFields.value = v.props.data.conditionFields
    fxFields.value = v.props.fxFields
  }
})

// 监听配置变化，仅刷新列定义（不重新请求数据）
watch(
  () => reportConfig,
  () => {
    if (displayFields.value.length > 0) {
      rebuildColumns()
    }
  },
  { deep: true }
)
// 监听配置变化，仅刷新列定义（不重新请求数据）
watch(
  () => reportConfig.fun.pageable,
  () => {
    if (displayFields.value.length > 0) {
      loadTableData()
    }
  },
  { deep: true }
)


// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 计算字段弹窗
const fxFieldModalRef = ref()

// 拖拽相关
let draggedField: any = null
let draggedFieldIndex: number | null = null

const saving = ref(false)

const FIELD_TYPE_LABELS: Record<string, string> = {
  INPUT: '文本',
  TEXTAREA: '文本',
  NUMBER: '数字',
  DATE: '日期',
  DATETIME: '日期',
  TIME: '时间',
  SELECT: '文本',
  RADIO: '文本',
  CHECKBOX: '文本',
  SWITCH: '布尔',
  USER: '文本',
  DEPT: '文本',
  ATTACHMENT: '文本',
  SUBFORM: '文本',
}

const getFieldTypeLabel = (field: any) => {
  if (field?.flow) return '文本'
  const type = String(field?.type || '').toUpperCase()
  return FIELD_TYPE_LABELS[type] || '文本'
}

const setTableAlign = (align: 'left' | 'center' | 'right') => {
  reportConfig.style.align.enable = true
  reportConfig.style.align.align = align
}

// 页面导航
const goBack = () => {
  if (route.query.appId) {
    router.push({ path: '/designer', query: { id: route.query.appId, from: route.query.from, type: 3 } })
  } else {
    router.go(-1)
  }
}

// 保存报表
const saveReport = async () => {
  const appId = route.query.appId
  if (!appId) {
    Message.warning('缺少应用ID')
    return
  }

  // 查找 formList 中对应的报表配置项
  const targetIndex = formConfigs.value.formList.findIndex((v: any) => v.id === route.query.id)

  if (targetIndex === -1) {
    Message.warning('未找到对应的报表配置')
    return
  }
  const datasource = datasourceOptions.value.find(
    (d: any) => d.appId === selectedDatasource.value
  )
  if (!datasource) return
  console.log(conditionFields.value)
  const persistedDisplayFields = applyReportColumnWidths(displayFields.value, resizedColumnWidths.value)

  // 准备更新的报表配置数据
  const updatedReportConfig = {
    ...formConfigs.value.formList[targetIndex],
    props: {
      data: {
        appId: selectedDatasource.value,
        formId: datasource.formId,
        selectFields: persistedDisplayFields,
        conditionFields: conditionFields.value,
      },
      fun: reportConfig.fun,
      style: reportConfig.style,
      fxFields: fxFields.value
    },
  }
  console.log(updatedReportConfig)
  // 替换 formList 中对应的项
  const newFormList = [...formConfigs.value.formList]
  newFormList[targetIndex] = updatedReportConfig

  // 为 formList 添加 @class 属性映射
  const formListWithClass = addClassToLayout(newFormList)

  // 准备保存数据
  const saveData: any = {
    reportConfig: {
      name: formConfigs.value.name,
      category: formConfigs.value.category,
      formList: formListWithClass
    }
  }

  saveData.reportConfig = JSON.stringify(saveData.reportConfig)

  try {
    saving.value = true
    await saveReportDesign(saveData, appId)

    // 更新本地缓存
    formConfigs.value.formList = newFormList
    displayFields.value = persistedDisplayFields
    resetColumnWidths()
    setFormById(formConfigs.value, route.query.appId)

    Message.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    Message.error('保存失败')
  } finally {
    saving.value = false
  }
}
// 页面加载时获取数据源列表
onMounted(async () => {
  await loadDatasourceList()
  try {
    const res = await getDeptTree()
    deptList.value = res || []
  } catch (e) { }
})

// 加载数据源列表
const loadDatasourceList = async () => {
  try {
    const res = await listByRelation()
    let Apps = []
    res.map(v => {
      if (v.category !== 3) {
        Apps.push(v)
      }
    })
    datasourceOptions.value = Apps || []
    selectedDatasource.value = reportConfig.props.data.appId || ''
    handleDatasourceChange(selectedDatasource.value)
  } catch (error) {
  }
}
const fieldList = ref([])
const category = ref(1)
// 数据源变化
const handleDatasourceChange = async (value: string) => {
  // 记录切换前的显示字段数量，用于判断是否是初始化（初始化时 displayFields 通常已有保存的数据）
  const prevDisplayCount = displayFields.value.length
  resetColumnWidths()

  if (!value) {
    // 清空字段
    fieldCategories.forEach(cat => cat.fields = [])
    displayFields.value = []
    conditionFields.value = []
    tableData.value = []
    tableColumns.value = []
    return
  }

  try {
    // 调用 getAppForm 接口获取表单字段
    const res = await getAppForm(value)
    let formConfig = JSON.parse(res.formConfig)

    const datasources = datasourceOptions.value.find(
      (d: any) => d.appId === selectedDatasource.value
    )
    console.log(datasources)
    category.value = datasources.category
    parseFormFields(formConfig)

    // 如果切换前没有显示字段（说明是第一次选数据源），或者切换前有字段但现在是手动切换（通过 selectedDatasource 状态辅助判断）
    // 更简单的逻辑：只要不是页面刚打开时的自动回显，就清空。
    // 我们可以通过检查 reportConfig.props.data.formId 是否与当前 value 一致来判断是否是回显触发
    const isRestoring = !!(reportConfig.props?.data?.appId && value === reportConfig.props.data.appId)

    if (!isRestoring && prevDisplayCount > 0) {
      // 手动切换数据源，清空已配置的字段和条件
      displayFields.value = []
      conditionFields.value = []
      tableData.value = []
      tableColumns.value = []
    } else if (isRestoring && displayFields.value.length > 0) {
      // 初始化回显，重新加载表格数据
      updateTableColumns()
    }
  } catch (error) {
    console.error('加载字段失败:', error)
    Message.error('加载字段失败')
  }
}

// 解析表单字段数据
const parseFormFields = (formData: any) => {

  // 清空所有字段分类
  fieldCategories.forEach(cat => cat.fields = [])
  fieldCategories[3].fields.push({
    id: "id",
    "column": "id",
    label: "主键",
    showLabel: '主键',
    type: "INPUT",
  });
  fieldCategories[3].fields.push({
    "column": "create_user",
    "showLabel": "创建人",
    id: "create_user",
    label: "创建人",

    type: "INPUT",
    default: "",
  });
  fieldCategories[3].fields.push({
    "column": "create_time",
    "showLabel": "创建时间",
    id: "create_time",
    label: "创建时间",
    type: "DATE",
    format: {
      dateTime: { "type": 0 },
    },
    props: {
      format: "YYYY-MM-DD HH:mm:ss",
      "value-format": "YYYY-MM-DD HH:mm:ss",
    },
  });
  fieldCategories[3].fields.push({
    "column": "update_user",
    "showLabel": "修改人",
    id: "update_user",
    label: "修改人",
    type: "INPUT",
    default: "",
  });
  fieldCategories[3].fields.push({
    "column": "update_time",
    "showLabel": "修改时间",
    id: "update_time",
    label: "修改时间",
    type: "DATE",
    format: {
      dateTime: { "type": 0 },
    },
    props: {
      format: "YYYY-MM-DD HH:mm:ss",
      "value-format": "YYYY-MM-DD HH:mm:ss",
    },
    default: "",
  });
  fieldCategories[3].fields.push({
    "column": "submit_ip",
    "showLabel": "提交ip",
    id: "submit_ip",
    label: "提交ip",
    type: "INPUT",
    default: "",
  });

  fieldCategories[3].fields.push({
    "column": "input_source",
    "showLabel": "数据来源",
    id: "input_source",
    label: "数据来源",
    type: "SELECT",
    "extra": {
      options: [
        { value: 0, label: "填写" },
        { value: 1, label: "导入" },
      ],
    },
  });

  if (category.value === 2) {
    fieldCategories[3].fields.push({
      "column": "instance_id",
      "showLabel": "流程实例id",
      id: "instance_id",
      label: "流程实例id",
      type: "INPUT",
      default: "",
    });

    fieldCategories[3].fields.push({
      "column": "instance_state",
      "showLabel": "流程状态",
      id: "instance_state",
      label: "流程状态",
      "extra": {
        options: [
          { value: 0, label: "已完成" },
          { value: 1, label: "运行中" },
        ],
      },
      type: "SELECT",
    });
    fieldCategories[4].fields.push({
      "column": "currentNodeName",
      "showLabel": "当前节点",
      id: "currentNodeName",
      label: "当前节点",
      type: "INPUT",
      flow: true,
      currentNode: true,
      default: "",
    });

    fieldCategories[4].fields.push({
      "column": "currentCandidate",
      "showLabel": "当前节点负责人",
      id: "currentCandidate",
      label: "当前节点负责人",
      type: "INPUT",
      flow: true,
      currentCandidate: true,
    });
    fieldCategories[4].fields.push({
      "column": "flowDuration",
      "showLabel": "流程耗时",
      id: "flowDuration",
      label: "流程耗时",
      type: "INPUT",
      flow: true,
      flowDuration: true,
    });
    fieldCategories[4].fields.push({
      "column": "nodeInfo",
      "showLabel": "节点信息",
      id: "nodeInfo",
      label: "节点信息",
      type: "SUBFORM",
      flow: true,
      "extra": {
        operator: {
          align: 'left',
          showLabel: '节点负责人'
        },
        status: {
          align: 'left',
          showLabel: '节点状态'
        },
        duration: {
          align: 'left',
          showLabel: '节点耗时'
        },
      },
      nodeInfo: true,
    });
  }
  // 保存完整的 formList 供过滤条件使用
  allFormFields.value = formData.formList || []

  // 根据组件类型分类字段
  if (formData.formList) {
    let list = []
    setReportFormList(formData.formList, list)
    list.forEach((component: any) => {
      const field: any = {
        "id": component.id,
        "label": component.title,
        "column": component.id,
        "type": component.type,
        "showLabel": component.title,
        "props": {
          format: component.props?.format,
          "value-format": component.props?.["value-format"] || component.props?.valueFormat,
        },
        "extra": {
          options: component.props.options
        },
        "tag": false,
        "warningPlans": [],
        "flow": false,
        "nodeInfo": false,
        "currentNode": false,
        "currentCandidate": false,
        "flowDuration": false,
        "subform": false,
        "relationData": false
      }

      // if (component.props) {
      //   field.props = component.props
      // }

      if (['NUMBER', 'RATE', 'MONEY'].includes(component.type)) {
        fieldCategories[1].fields.push(field)
      } else if (['DATE', 'TIME'].includes(component.type)) {
        if (component.type == 'DATE') {
          field.format = {
            dateTime: { "type": 0 },
          }
        }

        fieldCategories[2].fields.push(field)
      } else if (['DATE_INTERVAL', 'TIME_INTERVAL'].includes(component.type)) {
        // 区间类型字段拆分为开始和结束两个子字段
        const isDateInterval = component.type === 'DATE_INTERVAL'
        const isType = component.type === 'DATE_INTERVAL' ? 'DATE' : 'TIME'
        const startLabel = component.title + (isDateInterval ? '_开始时间' : '_开始时间')
        const endLabel = component.title + (isDateInterval ? '_结束时间' : '_结束时间')

        const startField = {
          ...field,
          id: component.id + '_start',
          column: component.id + '_start',
          label: startLabel,
          type: isType,
          format: isType == 'DATE' ? { dateTime: { "type": 0 } } : {},
          showLabel: startLabel,
        }
        const endField = {
          ...field,
          id: component.id + '_end',
          column: component.id + '_end',
          label: endLabel,
          type: isType,
          format: isType == 'DATE' ? { dateTime: { "type": 0 } } : {},
          showLabel: endLabel,
        }
        // 父节点包含子字段
        field.expanded = false
        field.children = [startField, endField]
        fieldCategories[2].fields.push(field)
      } else if (component.type === 'ADDRESS') {
        // 地址类型字段拆分为省、市、区、详细地址四个子字段
        const children: any[] = []

        const provField = {
          ...field,
          id: component.id + '_prov',
          column: component.id + '_prov',
          label: component.title + '_省',
          type: 'INPUT',
          format: {
            address: { "province": true, "city": false, "county": false, "detail": false },
          },
          showLabel: component.title + '_省',
        }
        children.push(provField)

        const cityField = {
          ...field,
          id: component.id + '_city',
          column: component.id + '_city',
          label: component.title + '_市',
          type: 'INPUT',
          showLabel: component.title + '_市',
          format: {
            address: { "province": false, "city": true, "county": false, "detail": false },
          },
        }
        children.push(cityField)

        if (component.props.option == 'prov-city-dist-det' || component.props.option == 'prov-city-dist') {
          const distField = {
            ...field,
            id: component.id + '_dist',
            column: component.id + '_dist',
            type: 'INPUT',
            label: component.title + '_区',
            showLabel: component.title + '_区',
            format: {
              address: { "province": false, "city": false, "county": true, "detail": false },
            },
          }
          children.push(distField)
        }

        if (component.props.option == 'prov-city-dist-det') {
          const detField = {
            ...field,
            id: component.id + '_det',
            column: component.id + '_det',
            type: 'INPUT',
            label: component.title + '_详细地址',
            showLabel: component.title + '_详细地址',
            format: {
              address: { "province": false, "city": false, "county": false, "detail": true },
            },
          }
          children.push(detField)
        }

        // 父节点包含子字段
        field.expanded = false
        field.children = children
        fieldCategories[0].fields.push(field)
      } else if (component.type === 'RELATION_DATA' || component.type === 'SUBFORM') {
        // 将子表单或关联数据的子字段格式化为统一的字段格式
        const childFieldList = component.type === 'SUBFORM' ? component.children : component.props.fieldList
        field.extra.children = (childFieldList || []).map((child: any) => {
          return {
            "id": child.id,
            "label": child.title,
            "column": child.id,
            "type": child.type,
            "showLabel": child.title,
            "extra": {
              options: child.props?.options
            },
            "tag": false,
            "warningPlans": [],
            "flow": false,
            "nodeInfo": false,
            "currentNode": false,
            "currentCandidate": false,
            "flowDuration": false,
            "subform": component.type == 'SUBFORM',
            "relationData": component.type == 'RELATION_DATA'
          }
        })
        fieldCategories[0].fields.push(field)
      } else {
        fieldCategories[0].fields.push(field)
      }


    })
  }
}

// 字段拖拽开始
const handleFieldDragStart = (event: DragEvent, field: any) => {
  draggedField = field
  draggedFieldIndex = null
}

// 切换字段展开/折叠
const toggleFieldExpand = (field: any) => {
  field.expanded = !field.expanded
}

// 允许放置
const allowDrop = (event: DragEvent) => {
  event.preventDefault()
}

const allowDropItem = (event: DragEvent) => {
  event.preventDefault()
}

// 放置到显示字段区
const handleDropDisplayFields = (event: DragEvent) => {
  event.preventDefault()
  console.log(draggedFieldIndex)
  if (draggedField && draggedFieldIndex === null) {
    const newField = {
      ...draggedField,
      showLabel: draggedField.showLabel || draggedField.label,
      width: 200,
      align: ''
    }

    // 检查是否已存在
    const existsIndex = displayFields.value.findIndex(f => f.column === newField.column)
    if (existsIndex !== -1) {
      Message.warning('该字段已添加')
    } else {
      displayFields.value.push(newField)
      updateTableColumns()
    }
  }
}

// 放置到过滤条件区
const handleDropConditionFields = (event: DragEvent) => {
  event.preventDefault()
  if (draggedField && draggedFieldIndex === null) {
    // 规则计算字段不能作为过滤条件
    if (draggedField.code) {
      Message.warning('计算字段不可作为过滤条件')
      return
    }

    // 子表单和关联数据字段不能作为过滤条件
    if (draggedField.type === 'SUBFORM' || draggedField.type === 'RELATION_DATA' || draggedField.flow) {
      Message.warning('子表单/关联数据/流程字段不可作为过滤条件')
      return
    }

    const newField = {
      ...draggedField,
      showLabel: draggedField.showLabel || draggedField.label,
      column: draggedField.column || draggedField.id,
      type: draggedField.type,
      field: draggedField.id,
      condition: '',
      value: '',
    }

    const exists = conditionFields.value.some(f => f.column === newField.column)
    if (!exists) {
      conditionFields.value.push(newField)
      const newIdx = conditionFields.value.length - 1
      nextTick(() => {
        conditionItemRefs.value[newIdx]?.openFilter()
      })
    } else {
      Message.warning('该条件已添加')
    }
  }
}

// 显示字段拖拽排序
const handleDisplayFieldDragStart = (event: DragEvent, index: number) => {
  draggedFieldIndex = index
  draggedField = displayFields.value[index]
}

const handleDisplayFieldDrop = (event: DragEvent, toIndex: number) => {
  event.preventDefault()
  if (draggedFieldIndex !== null) {
    const fromIndex = draggedFieldIndex
    const item = displayFields.value[fromIndex]
    displayFields.value.splice(fromIndex, 1)
    displayFields.value.splice(toIndex, 0, item)
    setTimeout(() => {
      draggedFieldIndex = null
    })

  }
}

// 条件字段拖拽排序
const handleConditionFieldDragStart = (event: DragEvent, index: number) => {
  draggedFieldIndex = index
  draggedField = conditionFields.value[index]
}
// 移除显示字段
const removeDisplayField = (index: number) => {
  displayFields.value.splice(index, 1)
  updateTableColumns()
}

// 字段配置操作
const handleEditName = (idx: number, payload: { showLabel: string }) => {
  displayFields.value[idx].showLabel = payload.showLabel
  updateTableColumns()
}

const handleEditAlign = (idx: number, align: string) => {
  displayFields.value[idx].align = align
  updateTableColumns()
}

const handleEditTag = (idx: number, tag: boolean) => {
  displayFields.value[idx].tag = tag
}

const handleEditType = (idx: number, form: any, data: any) => {
  const field = displayFields.value[idx]
  const formatKind = getReportFieldFormatKind(field || data)
  field.format ||= {}

  if (formatKind === 'number') {
    field.format.number = {
      ...form,
      decimal: form.scale ? form.num : 0,
    }
  } else if (formatKind === 'dateTime') {
    const current = field.format.dateTime
    field.format.dateTime = {
      ...(current && typeof current === 'object' ? current : {}),
      type: form.dateType,
    }
  } else if (formatKind === 'address') {
    field.format.address = {
      province: form.province,
      city: form.city,
      county: form.county,
      detail: form.detail,
    }
  }
  updateTableColumns()
}

const handleEditChild = (idx: number, form: any) => {
  displayFields.value[idx].extra = form
}

const handleEditWarningPlans = (idx: number, plans: any[]) => {
  displayFields.value[idx].warningPlans = plans
}

// 移除过滤条件
const removeConditionField = (index: number) => {
  conditionFields.value.splice(index, 1)
  loadTableData()
}

// 更新过滤条件
const handleUpdateFilter = (index: number, payload: { condition: string; value: any; extra?: any }) => {
  const field = conditionFields.value[index]
  if (field) {
    field.condition = payload.condition
    field.value = payload.value
    field.symbol = payload.condition
    field.field = field.id
    if (payload.extra) {
      field.extra = payload.extra
    }
  }
  loadTableData()
}

// 行选择（数据多选）
const rowSelection = computed(() => {
  if (!reportConfig.fun.checkBox) return undefined
  return { type: 'checkbox' as const, showCheckedAll: true }
})

// 表格滚动配置
const tableScroll = computed(() => {
  const scroll: Record<string, any> = { x: tableScrollX.value }
  if (reportConfig.fun.fixedHeader) {
    // 开启分页时，给分页区域预留空间，避免遮挡表格内容
    scroll.maxHeight = reportConfig.fun.pageable ? 'calc(100vh - 410px)' : 'calc(100vh - 367px)'
  }
  return scroll
})




const tableLoading = ref(false)



// 显示字段配置弹窗
const showFieldConfig = (field: any, index: number) => {
  // TODO: 显示字段配置弹窗
  // console.log('配置字段:', field)
}

// 过滤条件配置弹窗
const showConditionConfig = (field: any, index: number) => {
  // TODO: 显示过滤条件配置弹窗
  // console.log('配置条件:', field)
}

// 新增计算字段
const showAddFxModal = () => {
  // 收集所有可用字段
  const allFields = [
    ...fieldCategories[1].fields,
  ]

  // 检查是否有数字字段
  if (allFields.length === 0) {
    Message.warning('无数字字段不可新增计算字段')
    return
  }

  fxFieldModalRef.value?.show(allFields)
}

// 确认添加计算字段（新增或编辑）
const handleFxFieldConfirm = (fieldData: any, code) => {
  if (code) {
    // 编辑模式：更新已有字段
    const index = fxFields.value.findIndex(f => f.code === fieldData.code)
    if (index !== -1) {
      fxFields.value[index] = fieldData
      Message.success('修改成功')
    } else {
      Message.error('未找到要修改的字段')
    }
  } else {
    // 新增模式：添加新字段
    fxFields.value.push(fieldData)
    Message.success('添加成功')
  }
}

// 取消添加计算字段
const handleFxFieldCancel = () => {
  console.log('取消添加')
}

// 编辑计算字段
const editFxField = (field: any, index: number) => {
  // 收集所有可用字段
  const allFields = [
    ...fieldCategories[1].fields,
  ]
  // 打开编辑弹窗
  fxFieldModalRef.value?.show(allFields, field)
}

// 删除计算字段
const deleteFxField = (index: number) => {
  fxFields.value.splice(index, 1)
}

// 详情查看组件引用
const detailsRef = ref()

// 分页变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page
  loadTableData()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.pageNum = 1
  loadTableData()
}

// 点击表格行查看详情
const handleRowClick = (record: any) => {
  // 构建 topList：需要显示的字段列表
  const topList = displayFields.value.map((field: any) => ({
    label: field.showLabel,
    column: field.column,
    type: field.type,
    extra: field.extra,
    nodeInfo: field.nodeInfo || false
  }))

  // 构建 datas：字段值映射
  const datas: any = {}
  displayFields.value.forEach((field: any) => {
    const val = field.code ? record[field.code] : record[field.column]
    datas[field.column] = {
      formatValue: getReportDetailDisplayValue(val)
    }
  })

  // 调用 Details 组件显示
  detailsRef.value?.showItem(topList, datas)
}
</script>

<style lang="scss" scoped>
@use '@/styles/data-source-settings.scss';

:deep(.ds-save-btn.arco-btn) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #5b8ff9 0%, #3b82f6 100%);
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.22);
  font-size: 14px;
  font-weight: 500;
}

.ds-save-btn__icon {
  font-size: 13px;
}

:deep(.arco-btn) {
  border-radius: 8px;
}

.ds-preview-wrap {
  padding: 12px 12px;
}

.table-body {}
</style>
