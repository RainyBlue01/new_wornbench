<template>
  <div class="select-form-source">
    <div class="form-item">
      <div class="form-item-body">
        <a-select
          allow-clear
          placeholder="请选择关联表单"
          v-model="activeForm.props.sourceFormCode"
          @change="onFormChange"
          allow-search
        >
       
            <a-option
              v-for="app in otherGroups"
              :key="app.formId"
              :value="app.formId"
              :label="app.appName"
            />
        </a-select>
      </div>
    </div>

    <div class="form-item">
     
      <div class="form-item-body">
        <a-select
          allow-clear
          placeholder="请选择表单字段"
          :field-names="fieldNames"
          allow-search
          v-model="activeForm.props.sourceFieldCode"
          :disabled="!activeForm.props.sourceFormCode"
          :options="fieldOptions"
        />
      </div>
    </div>

    <div class="form-item">
      <div class="form-item-title">排序规则</div>
      <div class="form-item-body sort-row">
        <a-select
          v-model="activeForm.props.sortField"
          placeholder="排序字段"
          :options="sortOptions1"
          style="flex: 1"
        />
        <a-select
          v-model="activeForm.props.sortOrder"
          placeholder="升/降"
          style="width: 100px; margin-left: 8px"
          :options="[
            { label: '升序', value: 'asc' },
            { label: '降序', value: 'desc' },
          ]"
        />
      </div>
    </div>

    <div class="form-item">
      <div class="form-item-title">
        <span>数据过滤</span>
        <span class="add-filter" @click="openFilter">
          <icon-plus-circle /> 新增逻辑规则
        </span>
      </div>
      <div class="filter-summary" @click="openFilter">
        {{ filterSummary }}
      </div>
    </div>

    <condition
      ref="conditionRef"
      :formData="filterFormData"
      :drawingList="activeForm.props.sourceFieldList || []"
      :activeForm="activeForm"
      :tableList="[]"
      :category="sourceCategory"
      @addData="onFilterSave"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import condition from './condition.vue'
import {
  fetchRelationApps,
  loadFormFieldBySelect,
  getCompatibleSourceFields,
  getSortFieldOptions,
  type RelationApp,
  type FieldMeta,
} from '@/utils/relationFormFields'
import { refreshSelectComponentOptions } from '@/utils/formSelectOptions'

const props = defineProps<{
  activeForm: any
  formConfs: any
}>()
   const fieldNames = {value: 'id', label: 'title'}
const route = useRoute()
const conditionRef = ref()
const currentApps = ref<RelationApp[]>([])
const otherGroups = ref<{ label: string; apps: RelationApp[] }[]>([])
const appMap = ref<Map<string, RelationApp>>(new Map())
const fieldOptions = ref<{ label: string; value: string }[]>([])
const sortOptions = ref<{ label: string; value: string }[]>([])
const sortOptions1 = ref<{ label: string; value: string }[]>([{label: '创建时间', value: 'create_time'}, {label: '修改时间', value: 'modify_time'}])
const sourceCategory = ref(1)
const allFields = ref<FieldMeta[]>([])
const previousSourceFormCode = ref('')

const SOURCE_FORM_CACHE_KEY = '_sourceFormSwitchCache'

const ensureFormCache = (activeForm: any) => {
  if (!activeForm.props[SOURCE_FORM_CACHE_KEY]) {
    activeForm.props[SOURCE_FORM_CACHE_KEY] = {}
  }
  return activeForm.props[SOURCE_FORM_CACHE_KEY] as Record<string, any>
}

const snapshotFormBinding = (formProps: any) => ({
  sourceFieldCode: formProps.sourceFieldCode || '',
  conditionType: formProps.conditionType || 'and',
  conditionList: JSON.parse(JSON.stringify(formProps.conditionList || [])),
  sortField: formProps.sortField || 'create_time',
  sortOrder: formProps.sortOrder || 'desc',
})

const filterFormData = {
  title: '数据过滤条件',
  type: 'addCondition',
}

const filterSummary = computed(() => {
  const list = props.activeForm.props.conditionList
  if (Array.isArray(list) && list.length > 0) {
    return `已配置 ${list.length} 条过滤规则`
  }
  return '选项数据的过滤规则'
})

const loadApps = async () => {
  const { current, groups, flat } = await fetchRelationApps(route.query.id as string)
  currentApps.value = current
  console.log(groups,current)
  otherGroups.value = groups
  appMap.value = new Map(flat.map((a) => [a.formId, a]))
}

const loadFields = async (formId: string) => {
  const app = appMap.value.get(formId)
  if (!app) {
    fieldOptions.value = []
    sortOptions.value = [
      { label: '创建时间', value: 'create_time' },
      { label: '修改时间', value: 'update_time' },
    ]
    return
  }
  const { fields, category } = await loadFormFieldBySelect(app.appId)
 
  sourceCategory.value = category
  allFields.value = fields
  props.activeForm.props.sourceFieldList = fields
  props.activeForm.props.sourceAppId = app.appId

  fieldOptions.value = fields
  sortOptions.value = fields
}

const onFormChange = async (formId: string) => {
  const cache = ensureFormCache(props.activeForm)
  const prevId = previousSourceFormCode.value

  if (prevId) {
    cache[prevId] = snapshotFormBinding(props.activeForm.props)
  }

  previousSourceFormCode.value = formId || ''

  if (!formId) {
    props.activeForm.props.sourceAppId = ''
    props.activeForm.props.sourceFieldList = []
    fieldOptions.value = []
    return
  }

  const app = appMap.value.get(formId)
  if (app) {
    props.activeForm.props.sourceAppId = app.appId
  }
  await loadFields(formId)

  const saved = cache[formId]
  if (saved) {
    props.activeForm.props.sourceFieldCode = saved.sourceFieldCode
    props.activeForm.props.conditionType = saved.conditionType
    props.activeForm.props.conditionList = saved.conditionList
    props.activeForm.props.sortField = saved.sortField
    props.activeForm.props.sortOrder = saved.sortOrder
  } else {
    props.activeForm.props.sourceFieldCode = ''
    props.activeForm.props.conditionList = []
  }
}

const openFilter = () => {
  conditionRef.value?.showItem()
}

const onFilterSave = async (val: any) => {
  props.activeForm.props.conditionList = val.logicConditions
  props.activeForm.props.conditionType = val.mode
  await refreshSelectComponentOptions(props.activeForm, props.formConfs)
}

watch(
  () => props.activeForm.id,
  async () => {
    await loadApps()
    previousSourceFormCode.value = props.activeForm.props.sourceFormCode || ''
    if (props.activeForm.props.sourceFormCode) {
      await loadFields(props.activeForm.props.sourceFormCode)
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.form-item {
  margin-bottom: 14px;
}

.form-item-title {
  color: #949495;
  font-size: 12px;
  line-height: 32px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-filter {
  cursor: pointer;
  color: textColor.$ThemeTextColor;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sort-row {
  display: flex;
  align-items: center;
}

.filter-summary {
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #94a3b8;
  cursor: pointer;
  min-height: 36px;
  line-height: 20px;

  &:hover {
    border-color: #cbd5e1;
    color: #64748b;
  }
}
</style>
