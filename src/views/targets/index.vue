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
        <a-button type="primary" class="ds-save-btn" @click="saveReport">
          <i class="fas fa-save ds-save-btn__icon" aria-hidden="true"></i>
          <span>保存</span>
        </a-button>
      </div>
    </header>

    <div class="ds-main-layout">
      <aside class="ds-sidebar-left">
        <div class="ds-sidebar-left__inner">
          <div class="ds-panel-section">
            <div class="ds-panel-subtitle">数据源</div>
            <a-select v-model="selectedDatasource" placeholder="请选择" allow-search class="ds-datasource-select"
              @change="handleDatasourceChange">
              <a-option v-for="item in datasourceOptions" :key="item.appId" :label="item.appName" :value="item.appId" />
            </a-select>
          </div>

          <div class="ds-panel-section" v-show="selectedDatasource">
            <div class="ds-panel-header-row">
              <div class="ds-panel-subtitle">字段</div>
              <span class="ds-add-link" @click="showAddFxModal">+ 新增指标</span>
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

      <main class="ds-content-area" v-show="selectedDatasource">
        <div class="ds-section-card">
          <div class="ds-section-card__header">
            <span class="ds-section-card__title">显示维度</span>
          </div>
          <div class="ds-section-card__body">
            <div class="ds-tag-area" :class="{ 'ds-tag-area--empty': groupFields.length === 0 }" @dragover="allowDrop"
              @drop="handleDropGroupFields">
              <div v-for="(field, idx) in groupFields" :key="idx" draggable="true"
                @dragstart="handleGroupFieldDragStart($event, idx)" @drop="handleGroupFieldDrop($event, idx)"
                @dragover="allowDrop">
                <GroupItem :data="field" :index="idx" @deleteItem="removeGroupField"
                  @editName="(payload) => handleEditGroupName(idx, payload)"
                  @editType="(payload) => handleEditGroupFormat(idx, payload)" />
              </div>
            </div>
          </div>
        </div>

        <div class="ds-section-card">
          <div class="ds-section-card__header">
            <span class="ds-section-card__title">显示指标</span>
          </div>
          <div class="ds-section-card__body">
            <div class="ds-tag-area" :class="{ 'ds-tag-area--empty': displayFields.length === 0 }" @dragover="allowDrop"
              @drop.stop="handleDropDisplayFields">
              <div v-for="(field, idx) in displayFields" :key="idx" draggable="true"
                @dragstart="handleDisplayFieldDragStart($event, idx)" @drop="handleDisplayFieldDrop($event, idx)"
                @dragover="allowDrop">
                <SelectItem :data="field" :index="idx" @deleteItem="removeDisplayField"
                  @editName="(payload) => handleEditTargetName(idx, payload)"
                  @editFunction="(func) => handleEditTargetFunction(idx, func)"
                  @editFormat="(format) => handleEditTargetFormat(idx, format)"
                  @editWarningPlans="(plans) => handleEditTargetWarning(idx, plans)" />
              </div>
            </div>
          </div>
        </div>

        <div class="ds-section-card">
          <div class="ds-section-card__header">
            <span class="ds-section-card__title">过滤条件</span>
          </div>
          <div class="ds-section-card__body">
            <div class="ds-tag-area" :class="{ 'ds-tag-area--empty': conditionFields.length === 0 }"
              @dragover="allowDropItem" @drop="handleDropConditionFields">
              <div v-for="(field, idx) in conditionFields" :key="idx" draggable="true"
                @dragstart="handleConditionFieldDragStart($event, idx)">
                <ConditionItem :deptList="deptList" :ref="(el: any) => setConditionItemRef(el, idx)" :data="field"
                  :index="idx" @deleteCondition="removeConditionField" @updateFilter="handleUpdateFilter" />
              </div>
            </div>
          </div>
        </div>

        <div class="ds-section-card"
          v-if="reportConfig.type === 'INDICATOR' && displayFields.length > 0 && groupFields.length === 0">
          <div class="ds-section-card__header">
            <span class="ds-section-card__title">指标预览</span>
          </div>
          <div class="ds-section-card__body ds-indicator-preview">
            <div class="indicator-value" :style="{ color: indicatorDisplayColor }">
              {{ indicatorValue }}{{ unit }}
            </div>
          </div>
        </div>

        <div class="ds-section-card"
          v-if="reportConfig.type === 'INDICATOR' && displayFields.length > 0 && groupFields.length === 1">
          <div class="ds-section-card__header">
            <span class="ds-section-card__title">指标预览</span>
          </div>
          <div class="ds-section-card__body ds-table-target">
            <div class="ds-table-target__header">
              <div class="ds-table-target__header-cell">{{ groupFields[0].showLabel || groupFields[0].label }}</div>
              <div class="ds-table-target__header-cell">{{ displayFields[0].showLabel || displayFields[0].label }}</div>
            </div>
            <div class="ds-table-target__body">
              <div class="ds-table-target__row" v-for="(row, indexTable) in indicatorTableData" :key="indexTable">
                <div class="ds-table-target__cell">{{ row[groupFields[0].id] }}</div>
                <div class="ds-table-target__cell">{{ getIndicatorValue(row) }}{{ unit }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="ds-section-card" v-if="displayFields.length > 0 && reportConfig.type !== 'INDICATOR'">
          <div class="ds-section-card__header ds-chart-header">
            <span class="ds-section-card__title">图表预览</span>
            <a-select v-model="reportConfig.type" style="width: 150px" @change="handleChartTypeChange">
              <a-option value="COLUMN">柱状图</a-option>
              <a-option value="BAR">条形图</a-option>
              <a-option value="FOLD_LINE">折线图</a-option>
              <a-option value="PIE">饼图</a-option>
              <a-option value="RADAR">雷达图</a-option>
              <a-option value="FUNNEL">漏斗图</a-option>
              <a-option value="GAUGE">仪表盘</a-option>
            </a-select>
          </div>
          <div class="ds-section-card__body ds-chart-body">
            <div ref="chartRef" class="chart"></div>
          </div>
        </div>
      </main>

      <div class="ds-empty-panel" v-show="!selectedDatasource">
        <div class="ds-empty-panel__box">
          <img src="@/assets/zanwuneirong@2x.png" alt="" class="ds-empty-panel__image" />
          <div class="ds-empty-panel__text">请从左侧选择您所需的数据源开始配置组件...</div>
        </div>
      </div>
    </div>

    <FxFieldModal ref="fxFieldModalRef" @confirm="handleFxFieldConfirm" @cancel="handleFxFieldCancel" />
  </div>
</template>

<script setup lang="ts">
import { listByRelation } from '@/api/homePage/index'
import { getAppForm } from '@/api/common/index'
import { queryReportData } from '@/api/designer/index'
import FxFieldModal from './FxFieldModal.vue'
import GroupItem from './groupItem.vue'
import SelectItem from './selectItem.vue'
import { setReportFormList } from '@/data/data_form.js'
import { getWarningColor } from '@/utils/warningCondition'
import { getFormById, setFormById } from '@/utils/form'
import ConditionItem from './conditionItem.vue'
import { getDeptTree } from '@/api/common/index'
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, computed, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconLeft, IconUp, IconDown, IconEdit, IconDelete, IconClose } from '@arco-design/web-vue/es/icon'
import echarts from '@/utils/echarts'
import { v6 } from 'uuid'

const router = useRouter()
const route = useRoute()
const formConfigs = ref(getFormById(route.query.appId))
// 部门列表（供过滤条件中人员/部门选择使用）
const deptList = ref<any[]>([])

// 数据源相关
const selectedDatasource = ref('')
const datasourceOptions = ref<any[]>([])

// 页面加载时获取数据源列表（已移至 onMounted 中）

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
  } catch (error) {
    console.error('加载数据源失败:', error)
  }
}

// 字段相关
const fieldCategories = reactive([
  { name: '文本字段', collapsed: false, fields: [] as any[] },
  { name: '数字字段', collapsed: false, fields: [] as any[] },
  { name: '日期字段', collapsed: false, fields: [] as any[] },
  { name: '系统字段', collapsed: false, fields: [] as any[] },
  { name: '流程字段', collapsed: false, fields: [] as any[] }
])
const fxFields = ref<any[]>([])

// 显示维度、指标和过滤条件
const groupFields = ref<any[]>([])
const displayFields = ref<any[]>([])
const conditionFields = ref<any[]>([])
const conditionItemRefs = ref<Record<number, any>>({})
const setConditionItemRef = (el: any, idx: number) => {
  if (el) conditionItemRefs.value[idx] = el
  else delete conditionItemRefs.value[idx]
}

// 维度配置操作
const handleEditGroupName = (idx: number, payload: { showLabel: string }) => {
  const f = groupFields.value[idx]
  if (!f) return
  f.showLabel = payload.showLabel
  loadChartData()
}

const handleEditGroupFormat = (idx: number, payload: { dateType: number }) => {
  const f = groupFields.value[idx]
  if (!f) return
  if (!f.extra) f.extra = {}
  f.extra.format = payload.dateType
  loadChartData()
}

// 指标配置操作
const handleEditTargetName = (idx: number, payload: { showLabel: string }) => {
  const f = displayFields.value[idx]
  if (!f) return
  f.showLabel = payload.showLabel
  loadChartData()
}
const filterData = () => {

}
provide("provideDesigner", { filterData });
const handleEditTargetFunction = (idx: number, func: string) => {
  const f = displayFields.value[idx]
  if (!f) return
  f.function = func
  loadChartData()
}

const handleEditTargetFormat = (idx: number, format: any) => {
  const f = displayFields.value[idx]
  if (!f) return
  if (!f.format) f.format = {}
  f.format.number = format
  loadChartData()
}

const handleEditTargetWarning = (idx: number, plans: any[]) => {
  const f = displayFields.value[idx]
  if (!f) return
  f.warningPlans = plans
  loadChartData()
}

// 更新过滤条件
const handleUpdateFilter = (index: number, payload: { symbol: string; value: any; extra?: any }) => {
  const f = conditionFields.value[index]
  if (!f) return
  f.symbol = payload.symbol
  f.value = payload.value
  if (payload.extra) f.extra = payload.extra
  loadChartData()
}

// 图表类型
const chartType = ref('COLUMN')
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 报表配置
const reportConfig = reactive({
  type: 'COLUMN',
  name: '',
  props: '',
  style: {
    color: { enable: false, color: '#409EFF' },
    fontStyle: { enable: false, fontSize: '30px' }
  }
})

// 页面加载时获取数据源列表
onMounted(async () => {
  await loadDatasourceList()
  // 回显报表配置数据
  formConfigs.value.formList.map(v => {
    if (v.id == route.query.id) {
      reportConfig.type = v.type
      reportConfig.name = v.name
      reportConfig.props = v.props
      reportConfig.style = v.props.style

      // 回显显示维度、指标和过滤条件
      if (v.props.data) {
        groupFields.value = v.props.data.groupFields || []
        displayFields.value = v.props.data.selectFields || []
        conditionFields.value = v.props.data.conditionFields || []
      }
      fxFields.value = v.props.fxFields || []

      // 回显数据源
      const datasource = datasourceOptions.value.find(
        (d: any) => d.appId === v.props.data?.appId
      )
      if (datasource) {
        reportConfig.props.data.formId = datasource.formId
        selectedDatasource.value = v.props.data?.appId
        handleDatasourceChange(selectedDatasource.value, true)
      }
    }
  })

  // 页面加载完成后，如果显示指标不为空，则加载图表数据
  nextTick(() => {
    if (displayFields.value.length > 0) {
      loadChartData()
    }
  })
  const res = await getDeptTree()
  deptList.value = res || []
})
// 指标值
const indicatorValue = ref('0')
const indicatorRawValue = ref<any>('0')
const unit = ref('')
const indicatorTableData = ref<any[]>([])

const indicatorDisplayColor = computed(() => {
  const first = displayFields.value?.[0]
  const defaultColor = reportConfig.style.color.color
  if (!first?.warningPlans?.length) return defaultColor
  const matched = getWarningColor(indicatorRawValue.value, first.warningPlans)
  return matched || defaultColor
})

// 获取指标值（用于表格显示）
const getIndicatorValue = (row: any) => {
  if (!displayFields.value || displayFields.value.length === 0) return ''
  const firstField = displayFields.value[0]
  const resultKey = `${firstField.function.toLowerCase()}(${firstField.id})`
  const formatKey = resultKey + '_formatValue'

  // loadChartData 已将数据拆解，formatValue 存储在独立的 key 中
  if (row[formatKey] !== undefined && row[formatKey] !== null) {
    return row[formatKey]
  }

  // 回退到原始值（可能是 rawValue 或未拆解的完整对象）
  const val = row[resultKey]
  if (val && typeof val === 'object' && 'formatValue' in val) {
    return val.formatValue
  }
  return val ?? ''
}

// 计算字段弹窗
const fxFieldModalRef = ref()

// 拖拽相关
let draggedField: any = null
let draggedFieldIndex: number | null = null

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

// 页面导航
const goBack = () => {
  router.push({ path: '/designer', query: { id: route.query.appId, from: route.query.from, type: 3 } })
}

// 本地保存报表
const saveReport = () => {
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
  if (!datasource) {
    Message.warning('请选择数据源')
    return
  }

  // 准备更新的报表配置数据
  const updatedReportConfig = {
    ...formConfigs.value.formList[targetIndex],
    props: {
      data: {
        appId: selectedDatasource.value,
        formId: datasource.formId,
        groupFields: groupFields.value,
        selectFields: displayFields.value,
        conditionFields: conditionFields.value,
      },
      style: reportConfig.style,
      fxFields: fxFields.value,
    },
    type: reportConfig.type,
  }
  // 替换 formList 中对应的项
  const newFormList = [...formConfigs.value.formList]
  newFormList[targetIndex] = updatedReportConfig

  // 更新本地缓存
  formConfigs.value.formList = newFormList
  setFormById(formConfigs.value, route.query.appId)

  Message.success('保存成功')
}

// 数据源变化
const handleDatasourceChange = async (value: string, isInit = false) => {
  // 记录切换前的配置数量，用于判断是否需要清空
  const prevGroupCount = groupFields.value.length
  const prevDisplayCount = displayFields.value.length
  const prevConditionCount = conditionFields.value.length

  if (!value) {
    // 清空字段
    fieldCategories.forEach(cat => cat.fields = [])
    groupFields.value = []
    displayFields.value = []
    conditionFields.value = []
    fxFields.value = []
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
    formConfig.category = datasources.category
    parseFormFields(formConfig)

    // 如果不是初始化触发，且之前有任何配置，则清空所有配置
    if (!isInit && (prevGroupCount > 0 || prevDisplayCount > 0 || prevConditionCount > 0)) {
      // 手动切换数据源，清空已配置的维度、指标和条件
      groupFields.value = []
      displayFields.value = []
      conditionFields.value = []
      indicatorValue.value = '0'
      indicatorTableData.value = []
      if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
      }
    } else if (isInit && (displayFields.value.length > 0 || groupFields.value.length > 0)) {
      // 初始化回显，重新加载图表数据
      loadChartData()
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
    props: {
      format: "yyyy-MM-dd HH:mm:ss",
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
        { value: 1, label: "填写" },
        { value: 2, label: "导入" },
      ],
    },
  });

  if (formData.category === 2) {
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
      type: "SELECT",
      "extra": {
        options: [
          { value: 0, label: "已完成" },
          { value: 1, label: "运行中" },
        ],
      },
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
  }
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
        "extra": { options: component.props.options },
        "tag": false,
        "warningPlans": [],
      }

      // if (component.props) {
      //   field.props = component.props
      // }

      if (['NUMBER', 'RATE', 'MONEY'].includes(component.type)) {
        fieldCategories[1].fields.push(field)
      } else if (['DATE', 'TIME'].includes(component.type)) {
        field.format = {
          dateTime: { "type": 0 },
        },
          fieldCategories[2].fields.push(field)
      } else if (['DATE_INTERVAL', 'TIME_INTERVAL'].includes(component.type)) {
        // 区间类型字段拆分为开始和结束两个子字段
        const isType = component.type === 'DATE_INTERVAL' ? 'DATE' : 'TIME'
        const isDateInterval = component.type === 'DATE_INTERVAL'
        const startLabel = component.title + (isDateInterval ? '_开始时间' : '_开始时间')
        const endLabel = component.title + (isDateInterval ? '_结束时间' : '_结束时间')

        const startField = {
          ...field,
          id: component.id + '_start',
          column: component.id + '_start',
          label: startLabel,
          type: isType,
          format: {
            dateTime: { "type": 0 },
          },
          showLabel: startLabel,
        }
        const endField = {
          ...field,
          id: component.id + '_end',
          column: component.id + '_end',
          type: isType,
          label: endLabel,
          format: {
            dateTime: { "type": 0 },
          },
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
          type: 'INPUT',
          label: component.title + '_省',
          showLabel: component.title + '_省',
          format: {
            address: { "province": true, "city": false, "county": false, "detail": false },
          },
        }
        children.push(provField)

        const cityField = {
          ...field,
          id: component.id + '_city',
          column: component.id + '_city',
          type: 'INPUT',
          label: component.title + '_市',
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
            label: component.title + '_区',
            type: 'INPUT',
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
            label: component.title + '_详细地址',
            type: 'INPUT',
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

// 允许放置
const allowDrop = (event: DragEvent) => {
  event.preventDefault()
}

const allowDropItem = (event: DragEvent) => {
  event.preventDefault()
}

// 放置到显示维度区
const handleDropGroupFields = (event: DragEvent) => {
  event.preventDefault()
  if (draggedField && draggedFieldIndex === null) {
    // 指标字段不能作为显示维度
    if (draggedField.code) {
      Message.warning('指标字段不可作为显示维度')
      return
    }
    // 子表单和关联数据字段不能作为显示维度
    if (draggedField.type === 'SUBFORM' || draggedField.type === 'RELATION_DATA' || draggedField.flow) {
      Message.warning('子表单/关联数据/流程字段不可作为显示维度')
      return
    }
    const newField = {
      "id": draggedField.id,
      "label": draggedField.label,
      "column": draggedField.id,
      "type": draggedField.type,
      "code": draggedField.code,
      "extra": {},
      "showLabel": draggedField.label
    }

    const exists = groupFields.value.some(f => f.column === newField.column)
    if (!exists) {
      // 根据图表类型限制维度数量
      if (['INDICATOR', 'PIE', 'FUNNEL'].includes(reportConfig.type) && groupFields.value.length >= 1) {
        Message.warning(`${reportConfig.type === 'INDICATOR' ? '指标卡' : reportConfig.name}只能选择一个维度`)
        return
      }
      if (['FOLD_LINE', 'COLUMN', 'BAR', 'RADAR'].includes(reportConfig.type) && groupFields.value.length >= 2) {
        Message.warning(`${reportConfig.name}最多可选择两个维度`)
        return
      }

      groupFields.value.push(newField)
      loadChartData()
    } else {
      Message.warning('该维度已添加')
    }
  }
}

// 放置到显示指标区
const handleDropDisplayFields = (event: DragEvent) => {
  event.preventDefault()
  if (draggedField && draggedFieldIndex === null) {
    const newField = {
      ...draggedField,
      format: {
      }
    }
    newField.format.number = {
      thousandth: false,
      percent: false,
      scale: false,
      decimal: 0,
      unit: "",
    };
    if (newField.type == "NUMBER" || newField.type == "MONEY" || newField.type == "RATE") {
      newField.function = "SUM";

    } else {
      newField.function = "COUNT";
    }
    const exists = displayFields.value.some(f => f.column === newField.column)
    if (!exists) {
      // 根据图表类型限制指标数量
      if (['INDICATOR', 'PIE', 'FUNNEL', 'GAUGE'].includes(reportConfig.type) && displayFields.value.length >= 1) {
        Message.warning(`${reportConfig.name}只能选择一个指标`)
        return
      }
      if (['FOLD_LINE', 'COLUMN', 'BAR', 'RADAR'].includes(reportConfig.type) &&
        displayFields.value.length >= 1 && groupFields.value.length >= 2) {
        Message.warning(`${reportConfig.name}维度为二时最多选择一个指标`)
        return
      }

      displayFields.value.push(newField)
      loadChartData()
    } else {
      Message.warning('该指标已添加')
    }
  }
}

// 放置到过滤条件区
const handleDropConditionFields = (event: DragEvent) => {
  event.preventDefault()
  if (draggedField && draggedFieldIndex === null) {
    // 指标字段不能作为过滤条件
    if (draggedField.code) {
      Message.warning('指标字段不可作为过滤条件')
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
      // loadChartData()
    } else {
      Message.warning('该条件已添加')
    }
  }
}

// 维度字段拖拽排序
const handleGroupFieldDragStart = (event: DragEvent, index: number) => {
  draggedFieldIndex = index
  draggedField = groupFields.value[index]
}

const handleGroupFieldDrop = (event: DragEvent, toIndex: number) => {
  event.preventDefault()
  if (draggedFieldIndex !== null) {
    const fromIndex = draggedFieldIndex
    const item = groupFields.value[fromIndex]
    groupFields.value.splice(fromIndex, 1)
    groupFields.value.splice(toIndex, 0, item)
    draggedFieldIndex = null
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
    draggedFieldIndex = null
  }
}

// 条件字段拖拽排序
const handleConditionFieldDragStart = (event: DragEvent, index: number) => {
  draggedFieldIndex = index
  draggedField = conditionFields.value[index]
}

// 移除维度字段
const removeGroupField = (index: number) => {
  groupFields.value.splice(index, 1)
  loadChartData()
}

// 移除显示字段
const removeDisplayField = (index: number) => {
  displayFields.value.splice(index, 1)
  loadChartData()
}

// 移除过滤条件
const removeConditionField = (index: number) => {
  conditionFields.value.splice(index, 1)
  loadChartData()
}

// 加载图表数据
const loadChartData = async () => {
  if (displayFields.value.length === 0) {
    indicatorValue.value = '0'
    indicatorRawValue.value = '0'
    indicatorTableData.value = []
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
    return
  }

  const datasource = datasourceOptions.value.find(
    (d: any) => d.appId === selectedDatasource.value
  )
  if (!datasource) return
  const config = {
    data: {
      appId: datasource.id,
      formId: datasource.formId,
      groupFields: groupFields.value,
      selectFields: displayFields.value,
      conditionFields: conditionFields.value,
    },
    "style": {
      "color": {
        "enable": false,
        "color": "#409EFF"
      },
      "fontStyle": {
        "enable": false,
        "fontSize": "30px"
      }
    },
    fxFields: fxFields.value,
  }

  const params = {
    componentId: route.query.id,
    componentType: reportConfig.type,
    reportId: formConfigs.value?.reportId || '',
    componentConfig: JSON.stringify(config),
  }

  try {
    const res: any = await queryReportData(params)

    if (reportConfig.type === 'INDICATOR') {
      unit.value = displayFields.value[0]?.format?.number?.unit || ''
      const firstField = displayFields.value[0]
      const resultKey = `${firstField.function.toLowerCase()}(${firstField.id})`

      if (groupFields.value.length === 0) {
        // 无维度:纯指标卡片
        const resultData = res?.[0]?.[resultKey]
        if (resultData && typeof resultData === 'object' && 'formatValue' in resultData) {
          indicatorValue.value = resultData.formatValue?.toString() || '0'
          indicatorRawValue.value = resultData.rawValue ?? resultData.formatValue ?? '0'
        } else {
          indicatorValue.value = resultData?.toString() || '0'
          indicatorRawValue.value = resultData ?? '0'
        }
        indicatorTableData.value = []
      } else if (groupFields.value.length === 1) {
        // 有一个维度:表格形式
        const rows: any[] = []
        const list = res || []

        list.forEach((item: any) => {
          const row: any = {}
          // 复制所有字段(包括维度字段和计算字段)
          Object.keys(item).forEach(key => {
            const val = item[key]
            if (val && typeof val === 'object' && 'rawValue' in val && 'formatValue' in val) {
              // 指标数据格式:{ rawValue: 7, formatValue: "7" }
              row[key] = val.rawValue
              row[key + '_formatValue'] = val.formatValue
            } else {
              // 维度字段直接复制
              row[key] = val
            }
          })
          rows.push(row)
        })
        indicatorTableData.value = rows
        indicatorValue.value = '0'
      }
    } else {
      nextTick(() => {
        initChart(res)
      })
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}

// 初始化图表
const initChart = (data: any) => {
  console.log(reportConfig.type)
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)

  let option: any = {}
  let item = [];
  const baseTooltip = {
    confine: true,
    appendToBody: true,
    extraCssText: 'max-width: 360px; white-space: normal;'
  }
  const grid = { left: 12, right: 12, top: 40, bottom: 12, containLabel: true }
  const legend = {
    top: 8,
    left: 'center',
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    textStyle: { fontSize: 12, color: '#4E5969' }
  }
  // 自定义 tooltip formatter
  const tooltipFormatter = (params: any) => {
    const getFieldConfig = (seriesOrName: string) => {
      const list = displayFields.value || []
      if (list.length === 1) return list[0]
      return list.find((f: any) => f?.showLabel === seriesOrName) || null
    }

    const extractValue = (v: any) => {
      if (v && typeof v === 'object' && 'value' in v) return (v as any).value
      return v
    }

    const formatTooltipValue = (rawValue: any, fieldConfig: any) => {
      const numberFormat = fieldConfig?.format?.number
      if (!numberFormat) return rawValue ?? ''

      const decimal = numberFormat.decimal ?? 0
      const isPercent = !!numberFormat.percent
      const needScale = !!numberFormat.scale || isPercent

      const n = typeof rawValue === 'number' ? rawValue : Number(rawValue)
      // 非数字时直接返回原值（避免 toFixed/toString 报错）
      if (Number.isNaN(n)) return rawValue ?? ''

      let v: string | number = n
      if (isPercent) v = n * 100
      if (needScale) v = Number(v).toFixed(decimal)

      if (numberFormat.thousandth) {
        v = String(v).replace(/(^|\s)\d+/g, (m: string) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
      }

      return v
    }

    const buildLine = (color: string, label: string, value: any, fieldConfig: any) => {
      const numberFormat = fieldConfig?.format?.number
      const formattedValue = formatTooltipValue(extractValue(value), fieldConfig)
      let line = ''
      line +=
        '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background:' +
        color +
        '"></span>'
      line += label + ':' + formattedValue
      if (numberFormat?.percent) line += '%'
      if (numberFormat?.unit) line += numberFormat.unit
      return line
    }

    if (Array.isArray(params)) {
      const singleLabel = (displayFields.value || []).length === 1 ? displayFields.value?.[0]?.showLabel : null
      return params
        .map((param: any) => {
          const fieldConfig = getFieldConfig(param.seriesName)
          const label = singleLabel || param.seriesName
          return buildLine(param.color, label, param.value, fieldConfig) + '</br>'
        })
        .join('')
    }

    // 单项触发时：优先用 seriesName，当只有一个指标时用该指标 showLabel
    const seriesOrName = params?.seriesName || params?.name
    const fieldConfig = getFieldConfig(seriesOrName)
    const label = (displayFields.value || []).length === 1 ? displayFields.value?.[0]?.showLabel : (params?.seriesName || params?.name)
    return buildLine(params.color, label, params.value, fieldConfig)
  }
  if (reportConfig.type === 'BAR') {
    option = {
      tooltip: {
        ...baseTooltip,
        trigger: 'axis',
        formatter: tooltipFormatter
      },
      grid,
      legend,
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} ' + (displayFields.value[0]?.format?.number?.unit || '')
        }
      },
      yAxis: {
        type: 'category',
        data: data.column,
        axisLabel: {
          formatter: function (value: string) {
            if (value.length > 8) {
              return `${value.slice(0, 8)}...`
            }
            return value
          }
        }
      },
      series: data.dataList.map((item: any) => ({
        type: 'bar',
        name: item.name,
        data: item.data.map((d: any) => d.rawValue ?? d),
        barMaxWidth: 32,
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      }))
    }
  } else if (reportConfig.type === 'FOLD_LINE' || reportConfig.type === 'COLUMN') {

    data.dataList.map((v) => {
      let a = [];
      v.data.map((v1) => {
        if (v1.rawValue) {
          a.push({
            value: v1.rawValue,
            itemStyle: {
              color: v1.color,
            },
          });
        } else {
          a.push({
            value: v1,
            itemStyle: {
              color: v1.color,
            },
          });
        }
      });

      item.push({
        name: v.name,
        type: reportConfig.type === 'FOLD_LINE' ? "line" : "bar",
        data: a ? a : 0,
        smooth: reportConfig.type === 'FOLD_LINE',
        symbol: reportConfig.type === 'FOLD_LINE' ? 'circle' : 'none',
        symbolSize: reportConfig.type === 'FOLD_LINE' ? 6 : 0,
        lineStyle: reportConfig.type === 'FOLD_LINE' ? { width: 2 } : undefined,
        areaStyle: reportConfig.type === 'FOLD_LINE' ? { opacity: 0.08 } : undefined,
        barMaxWidth: reportConfig.type === 'FOLD_LINE' ? undefined : 32,
        itemStyle: reportConfig.type === 'FOLD_LINE' ? undefined : { borderRadius: [4, 4, 0, 0] }
      });
    });
    option = {
      tooltip: {
        ...baseTooltip,
        trigger: 'axis',
        formatter: tooltipFormatter
      },
      grid,
      legend,
      xAxis: {
        type: 'category',
        data: data.column,
        axisTick: { alignWithLabel: true },
        axisLabel: {
          formatter: function (value: string) {
            if (value.length > 8) {
              return `${value.slice(0, 8)}...`
            }
            return value
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} ' + (displayFields.value[0]?.format?.number?.unit || '')
        }
      },
      series: item
    }
  } else if (reportConfig.type === 'PIE') {
    option = {
      tooltip: {
        ...baseTooltip,
        trigger: 'item',
        formatter: tooltipFormatter
      },
      legend: { ...legend, top: 8 },
      series: [{
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '56%'],
        avoidLabelOverlap: true,
        label: { color: '#4E5969', formatter: '{b}' },
        labelLine: { length: 10, length2: 8 },
        data: (data?.dataList?.[0]?.data || []).map((d: any) => ({
          name: d?.name,
          value: d?.value?.rawValue ?? d?.value ?? 0,
          itemStyle: d?.value?.color ? { color: d.value.color } : undefined,
        })),
        emphasis: { scale: true, scaleSize: 8 }
      }]
    }
  } else if (reportConfig.type === 'RADAR') {
    const radarIndicator =
      Array.isArray(data?.column) && data.column.length > 0
        ? data.column.map((name: string) => ({ name }))
        : (data?.dataList?.[0]?.data || []).map((d: any) => ({ name: d?.name }))
    option = {
      tooltip: {
        ...baseTooltip,
        trigger: 'item',
        formatter: tooltipFormatter
      },
      legend: { ...legend, top: 8 },
      radar: {
        indicator: radarIndicator,
        radius: '62%',
        center: ['50%', '58%'],
        shape: 'polygon',
        axisName: { color: '#4E5969', fontSize: 12 },
        splitLine: { lineStyle: { color: ['#E5E6EB'] } },
        splitArea: { areaStyle: { color: ['rgba(255,255,255,0)', 'rgba(244,246,248,0.6)'] } },
        axisLine: { lineStyle: { color: '#E5E6EB' } }
      },
      series: data.dataList.map((item: any) => ({
        type: 'radar',
        name: item.name,
        data: [{
          value: (item?.data || []).map((d: any) => {
            // radar 数据：[{ rawValue, formatValue, color }, ...]
            if (d && typeof d === 'object') {
              if ('rawValue' in d) return (d as any).rawValue ?? 0
              if ('value' in d) return (d as any).value?.rawValue ?? (d as any).value ?? 0
            }
            return d ?? 0
          })
        }],
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.08 }
      }))
    }
  } else if (reportConfig.type === 'FUNNEL') {
    option = {
      tooltip: {
        ...baseTooltip,
        trigger: 'item',
        formatter: tooltipFormatter
      },
      legend: { ...legend, top: 8 },
      series: [{
        type: 'funnel',
        top: 52,
        bottom: 12,
        left: '10%',
        width: '80%',
        sort: 'descending',
        gap: 2,
        label: { color: '#4E5969', formatter: '{b}' },
        data: (data?.dataList?.[0]?.data || []).map((d: any) => ({
          name: d?.name,
          value: d?.value?.rawValue ?? d?.value ?? 0,
          itemStyle: d?.value?.color ? { color: d.value.color } : undefined,
        }))
      }]
    }
  } else if (reportConfig.type === 'GAUGE') {
    const gaugeData = data?.dataList?.[0]?.data
    const gaugeRawValue =
      gaugeData && typeof gaugeData === 'object' ? (gaugeData.rawValue ?? gaugeData.value?.rawValue ?? gaugeData.value) : gaugeData
    const gaugeFormatValue =
      gaugeData && typeof gaugeData === 'object' ? (gaugeData.formatValue ?? '') : ''
    const gaugeUnit = displayFields.value[0]?.format?.number?.unit || ''
    option = {
      tooltip: {
        ...baseTooltip,
        trigger: 'item',
        formatter: tooltipFormatter
      },
      series: [{
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '92%',
        startAngle: 200,
        endAngle: -20,
        axisLine: { lineStyle: { width: 14 } },
        splitLine: { length: 10, lineStyle: { width: 2, color: '#E5E6EB' } },
        axisTick: { length: 6, lineStyle: { color: '#E5E6EB' } },
        axisLabel: { distance: 20, color: '#86909C', fontSize: 10 },
        pointer: { width: 4, length: '60%' },
        anchor: { show: true, size: 10, itemStyle: { color: '#FFFFFF', borderWidth: 2, borderColor: '#165DFF' } },
        title: { show: true, offsetCenter: [0, '40%'], color: '#4E5969', fontSize: 12 },
        detail: {
          offsetCenter: [0, '62%'],
          fontSize: 22,
          fontWeight: 700,
          color: '#1D2129',
          formatter: (v: any) => `${gaugeFormatValue || v}${gaugeUnit}`
        },
        data: [{
          value: gaugeRawValue ?? 0,
          name: displayFields.value[0]?.showLabel
        }]
      }]
    }
  }

  chartInstance.setOption(option)
}

// 图表类型变化
const handleChartTypeChange = (value: string) => {
  reportConfig.type = value
  loadChartData()
}

// 显示字段配置弹窗
const showFieldConfig = (field: any, index: number) => {
  console.log('配置字段:', field)
}

// 新增计算字段
const showAddFxModal = () => {
  // 收集所有可用字段（数字字段 + 计算字段）
  const allFields = [
    ...fieldCategories[1].fields,
  ]

  // 检查是否有数字字段
  if (allFields.length === 0) {
    Message.warning('无数字字段不可新增指标')
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

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/data-source-settings.scss';

.ds-save-btn {
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

.ds-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
