<template>
  <div v-if="isAttributeVisible" class="form-item">
    <div v-if="!formData.hideLabel" class="form-item-title">
      <div class="left">
        {{ formData.label == '数字限制' ? '字数限制' : formData.label }}
      </div>
      <div class="right">
        <a-switch v-if="formData.type === 'linkage'" v-model="linkageProps.enable" />
        <a-switch @change="changeSwitch" v-if="formData.type === 'switch' ||
          formData.type === 'numSwitch' ||
          formData.type === 'fold'
        " v-model="activeForm.props[formData.field]" />
        <a-radio-group type="button" v-if="formData.type === 'radio'" v-model="activeForm.props[formData.field]"
          :options="formData.options">
        </a-radio-group>
        <div class="form-item-title-right" @click="addOption" v-if="formData.type === 'options'">
          <icon-plus-circle /> 添加选项
        </div>
        <div class="form-item-title-right" @click="addCol" v-if="formData.type === 'children'">
          <icon-plus-circle /> 添加列
        </div>
        <div class="form-item-title-right" v-if="formData.type === 'btnAction'">
          <a-button type="text" size="small" @click="showBtnActionModal">调试</a-button>
        </div>

      </div>
    </div>
    <div class="form-item-body">
      <a-input v-if="formData.type === 'type'" readonly v-model="activeForm.typeName"
        :placeholder="formData.label"></a-input>
      <inputModal :activeForm="activeForm" :formConfs="formConfs" v-if="formData.type == 'method'" />
      <childrenOption v-if="formData.type == 'children'" :options="activeForm.children" />
      <!-- <a-select v-if="(activeForm.type == 'RADIO' || activeForm.type == 'CHECKBOX') && formData.field == 'options'"
         v-model="activeForm.props.pic"
         style="width: 100%; margin-bottom: 12px;"
         :options="[
           { label: '鏅€氭ā寮?, value: false },
           { label: '鍥剧墖妯″紡', value: true }
         ]"
       /> -->
      <options v-if="formData.type == 'options'" v-model:options="activeForm.props.options"
        :pic="activeForm.props.pic" />
      <a-input v-if="formData.field == 'title' && formData.type === 'input'" v-model="activeForm[formData.field]"
        :placeholder="formData.label"></a-input>
      <a-input v-if="formData.field == 'fold' && activeForm.props.fold" v-model="activeForm.props.foldContext"
        placeholder="请输入折叠后显示的内容"></a-input>
      <a-radio-group type="button" v-if="formData.field == 'isDecimal' && activeForm.props.isDecimal"
        v-model="activeForm.props.precision" :options="formData.options">
      </a-radio-group>
      <a-input v-if="formData.field !== 'title' && formData.type === 'input'" v-model="activeForm.props[formData.field]"
        :placeholder="formData.label"></a-input>
      <wangEditor v-if="formData.type === 'wangEditor'" :key="`${activeForm.id || 'form'}-${formData.field}`"
        v-model:contents="activeForm.props[formData.field]" />
      <a-input-number :max="formData.max ? formData.max : 100" :min="formData.min ? formData.min : 1"
        v-if="formData.type === 'numSwitch' && activeForm.props.showWordLimit" v-model="activeForm.props.maxLength"
        :placeholder="String(formData.label)" />
      <a-input-number v-if="formData.type === 'number'" :max="formData.max ? formData.max : 100"
        :min="formData.min ? formData.min : activeForm.type == 'MONEY' ? 0 : 1"
        v-model="activeForm.props[formData.field]"></a-input-number>
      <expression v-if="formData.type === 'defaultValue'" v-model:label="activeForm.props.expressionLabel"
        v-model:value="activeForm.props.expressionValue" :custom="true">
        <template #default>
          <div class="inputs">
            <component :is="formData.component" v-if="!activeForm.props.expressionValue"
              v-model="activeForm.props.defaultValue" allow-clear />
            <component :is="formData.component" v-else :readonly="true" @clear="clearHandler" allow-clear />
          </div>

        </template>
      </expression>
      <a-select allow-clear v-if="formData.type === 'defaultValues'" :multiple="activeForm.type == 'CHECKBOX'"
        allow-search :placeholder="formData.label" v-model="activeForm.props.defaultValue"
        :options="activeForm.props.options">
      </a-select>
      <a-select allow-clear v-if="formData.type === 'select'" :multiple="formData.multiple" allow-search
        v-model="activeForm.props[formData.field]" :options="formData.options">
      </a-select>
      <component :max-length="activeForm.props.showWordLimit ? activeForm.props.maxLength : 10000"
        v-model="activeForm.props[formData.field]" :show-word-limit="activeForm.props.showWordLimit"
        v-bind="activeForm.props" :placeholder="formData.label"
        v-if="formData.type === 'component' && formData.component !== 'aTrangePicker' && formData.component !== 'aTTimePicker' && formData.component !== 'atDatePicker' && !(activeForm.type === 'SELECT_MULTIPLE' && activeForm.props.dataSourceType === 2)"
        :is="formData.component" :formConfs="formConfs" :deptList="deptList" :comDes="activeForm" allow-search
        :formData="formData" />
      <component
        v-if="formData.type === 'component' && (formData.component === 'aTrangePicker' || formData.component === 'aTTimePicker' || formData.component === 'atDatePicker')"
        :is="formData.component" :formConfs="formConfs" :comDes="activeForm" :deptList="deptList" allow-search />
      <div class="numRange" v-if="formData.type === 'numberRange'">
        <div class="left">
          <a-input-number v-model="activeForm.props.min"></a-input-number>
        </div>
        <div class="center">至</div>
        <div class="left">
          <a-input-number v-model="activeForm.props.max"></a-input-number>
        </div>
      </div>
      <div class="form-item" style="margin: 18px 0 0" v-if="formData.field == 'dataSourceType' &&
        activeForm.props[formData.field] == 1
      ">
        <div class="form-item-title">
          <div class="left">选项</div>
          <div class="right">
            <div class="form-item-title-right" @click="addOption">
              <icon-plus-circle /> 添加选项
            </div>
          </div>
        </div>
        <div class="form-item-body">
          <options v-model:options="activeForm.props.options" :pic="activeForm.props.pic" />
        </div>
      </div>
      <div class="form-item" style="margin: 18px 0 0" v-if="formData.field == 'dataSourceType' &&
        activeForm.props[formData.field] == 2
      ">
        <div class="form-item-title">
          <div class="left">其他表单数据源</div>
        </div>
        <div class="form-item-body">
          <selectFormSource :activeForm="activeForm" :formConfs="formConfs" />
        </div>
      </div>
      <div v-if="formData.type === 'Rate'">
        <div class="top" v-for="(item, index) in activeForm.props.options" :key="index">
          <a-input-group>
            <a-input :style="{ width: '150px', marginRight: '10px' }"
              v-model="activeForm.props.options[index]"></a-input>
            <a-rate disabled :default-value="index + 1"> </a-rate>
          </a-input-group>
        </div>
      </div>
      <optionalRange v-if="formData.type === 'currentUserDept'" :formConfs="formConfs" :formData="formData"
        :deptList="deptList" :activeForm="activeForm" :options="formData.options" />
      <selectTables v-if="formData.type === 'formCode'" @setTableList="setTableList" :formConfs="formConfs"
        :formData="formData" :deptList="deptList" :activeForm="activeForm" />
      <!-- 按钮动作配置 -->
      <div class="btn-action-wrapper" v-if="formData.type === 'btnAction'">
        <a-input :model-value="`${btnActionProps.connectorName || '未选择连接器'} / ${btnActionProps.sceneName || '未选择动作'}`"
          readonly placeholder="请设置按钮动作" @click="showBtnActionModal" />
        <ButtonActionModal :visible="btnActionModalVisible" :btnAction="btnActionProps"
          @update:visible="btnActionModalVisible = $event" @save="handleActionSave" />
      </div>
      <div class="linkage-wrapper" v-if="formData.type === 'linkage'">
        <a-button v-show="linkageProps.enable" type="outline" long class="linkage-config-btn" @click="showLinkageModal">
          {{ linkageSummary }}
        </a-button>
        <linkageModal ref="linkageRef" :activeForm="activeForm" :formConfs="formConfs" @addData="onLinkageSave" />
      </div>
      <a-button type="primary" long v-if="formData.type === 'addCondition'" @click="showItem">{{ formData.title
      }}</a-button>
      <condition ref="conditionRef" @addData="addData" :category="category" v-if="formData.type === 'addCondition'"
        :formData="formData" :tableList="tableList" :drawingList="props.activeForm.props.TableList"
        :activeForm="activeForm" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, provide, watch, computed } from "vue";
import inputModal from "./inputModal.vue";
import condition from "./condition.vue";
import linkageModal from "./linkage.vue";
import selectTables from "./selectTables.vue";
import selectFormSource from "./selectFormSource.vue";
import { generate } from "@/utils/id";
import optionalRange from "./optionalRange.vue";
import { calculate } from "@/components/expression/formula";
import options from "./options.vue";
import { inputComponents } from "@/data/form";
import { nanoid } from 'nanoid';
import childrenOption from "./childrenOption.vue";
import ButtonActionModal from "./ButtonActionModal.vue";
const props = defineProps<{
  activeForm: any;
  formConfs: any;
  deptList: any;
  formData: any;
  tableList: any;
}>();
const conditionRef = ref()
const linkageRef = ref()
const TableList = ref([])
const category = ref(1)
const btnActionModalVisible = ref(false)
const setTableList = (val: any, cate: any) => {
  let fieldList = JSON.parse(JSON.stringify(val))
  let TableList = JSON.parse(JSON.stringify(cate))
  props.activeForm.props.fieldList = []
  setTimeout(() => {
    props.activeForm.props.fieldList = fieldList.map(v => {
      return JSON.parse(v)
    })
  })

  props.activeForm.props.TableList = TableList.map(v => {
    return JSON.parse(v.value)
  })
}
const ensureLinkageProps = () => {
  if (!props.activeForm.props.linkage) {
    props.activeForm.props.linkage = {
      enable: false,
      logicConditions: [],
      mode: 'and',
      sourceFormCode: '',
      relationTrigger: {
        fieldCode: '',
        sourceFieldCode: '',
      },
    }
  }
  if (props.activeForm.props.linkage.enable === undefined) {
    props.activeForm.props.linkage.enable = !!props.activeForm.props.linkage.sourceFormCode
  }
  return props.activeForm.props.linkage
}
const clearHandler = () => {
  props.activeForm.props.expressionValue = ''
  props.activeForm.props.expressionLabel = ''
}
const linkageProps = computed(() => ensureLinkageProps())
const isAttributeVisible = computed(() => {
  const isLegacyUrlPreviewText = props.formData?.field === 'previewText'
    && String(props.activeForm?.type ?? props.activeForm?.inputType ?? '').toUpperCase() === 'URL'
  const condition = props.formData?.showWhen
    ?? (isLegacyUrlPreviewText ? { field: 'previewEnabled', value: true } : undefined)
  if (!condition?.field) return true
  return props.activeForm?.props?.[condition.field] === condition.value
})

const linkageSummary = computed(() => {
  const linkage = linkageProps.value
  if (linkage.sourceFormCode && linkage.logicConditions?.length) {
    return `已配置 ${linkage.logicConditions.length} 条联动规则`
  }
  return '数据联动'
})

const showLinkageModal = () => {
  linkageRef.value?.showItem()
}

const onLinkageSave = (val: any) => {
  Object.assign(linkageProps.value, {
    enable: true,
    logicConditions: val.logicConditions,
    mode: val.mode,
    sourceFormCode: val.sourceFormCode,
    relationTrigger: val.relationTrigger,
  })
}

const addData = (val: any) => {
  props.activeForm.props.conditionList = val.logicConditions
  props.activeForm.props.conditionType = val.mode
}

watch(() => props.activeForm?.props,
  (formProps) => {
    if (!formProps?.expressionValue || formProps.expressionLabel) return
    if (formProps.label === '函数') {
      formProps.expressionLabel = '函数'
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => props.activeForm.props.expressionValue,
  async (newVal: string, oldVal) => {
    const expressionLabel = props.activeForm.props.expressionLabel
    const hasExpression = !!(newVal && (expressionLabel || props.activeForm.props.label === '函数'))
    if (props.formData.type === "defaultValue" && hasExpression) {
      if (newVal) {
        try {
          // props.activeForm.props.defaultValue = await calculate(newVal);
          // props.activeForm.props.value = await calculate(newVal);
        } catch (e: any) { }
      } else {
        // props.activeForm.props.defaultValue = "";
        // props.activeForm.props.value = ""
      }
    }
  },
  { immediate: true },
);

let title = "";
const setData = (val: any) => {
  title = "";
  inputComponents.map((v) => {
    if (v.list) {
      v.list.map((v1) => {
        getLabel(v.list, val);
      });
    }
  });
};

const getLabel = (lists: any, val: any) => {
  if (Array.isArray(lists)) {
    lists.map((v) => {
      if (v.type == val) {
        props.activeForm.typeName = v.title;
      }
      if (v.children) {
        getLabel(v.children, val);
      }
    });
  }
};

const DATA_SOURCE_CACHE_KEY = '_dataSourceSwitchCache'

const ensureDataSourceCache = (activeForm: any) => {
  if (!activeForm.props[DATA_SOURCE_CACHE_KEY]) {
    activeForm.props[DATA_SOURCE_CACHE_KEY] = { custom: null, otherForm: null }
  }
  return activeForm.props[DATA_SOURCE_CACHE_KEY]
}

const snapshotCustomProps = (formProps: any) => ({
  options: JSON.parse(JSON.stringify(formProps.options || [])),
  defaultValue: Array.isArray(formProps.defaultValue)
    ? [...formProps.defaultValue]
    : formProps.defaultValue,
})

const snapshotOtherFormProps = (formProps: any) => ({
  sourceFormCode: formProps.sourceFormCode || '',
  sourceAppId: formProps.sourceAppId || '',
  sourceFieldCode: formProps.sourceFieldCode || '',
  sortField: formProps.sortField || 'create_time',
  sortOrder: formProps.sortOrder || 'desc',
  conditionType: formProps.conditionType || 'and',
  conditionList: JSON.parse(JSON.stringify(formProps.conditionList || [])),
  sourceFieldList: JSON.parse(JSON.stringify(formProps.sourceFieldList || [])),
})

const resetOtherFormProps = (formProps: any) => {
  formProps.sourceFormCode = ''
  formProps.sourceAppId = ''
  formProps.sourceFieldCode = ''
  formProps.sortField = 'create_time'
  formProps.sortOrder = 'desc'
  formProps.conditionType = 'and'
  formProps.conditionList = []
  formProps.sourceFieldList = []
}

watch(
  () => props.activeForm.props.dataSourceType,
  (val, oldVal) => {
    if (props.formData.field !== 'dataSourceType') return
    if (oldVal === undefined || val === oldVal) return

    const formProps = props.activeForm.props
    const cache = ensureDataSourceCache(props.activeForm)
    const isMultiple = props.activeForm.type === 'SELECT_MULTIPLE'

    if (val === 2 && oldVal === 1) {
      cache.custom = snapshotCustomProps(formProps)
      if (cache.otherForm) {
        Object.assign(formProps, cache.otherForm)
      } else {
        resetOtherFormProps(formProps)
      }
    } else if (val === 1 && oldVal === 2) {
      cache.otherForm = snapshotOtherFormProps(formProps)
      if (cache.custom) {
        formProps.options = cache.custom.options
        formProps.defaultValue = cache.custom.defaultValue ?? (isMultiple ? [] : '')
      } else {
        formProps.options = []
        formProps.defaultValue = isMultiple ? [] : ''
      }
    }
  },
);
watch(
  () => props.activeForm.id,
  (newVal: string, oldVal) => {
    if (props.formData.type === "type") {
      props.activeForm.typeName = ''
      setData(props.activeForm[props.formData.field]);
    }


  },
  { immediate: true },
);
const changeSwitch = () => {
  if (props.formData.field == "isDecimal") {
    props.activeForm.props.precision = props.activeForm.props.isDecimal ? 1 : 0;
  }
};
const addOption = () => {
  props.activeForm.props.options.push({ label: "", value: nanoid(9) });
};
const showItem = () => {
  conditionRef.value.showItem()
}
const addCol = () => {
  props.activeForm.children.push({
    id: generate(),
    col: "",
    desc: "",
    title: "列",
    component: "qCol",
    type: "COL",
    props: {
      span: 12,
    },
    attribute: [
      {
        field: "span",
        label: "占位格数",
        type: "number",
        min: 1,
        max: 24,
      },
    ],
    children: [],
  });
};

// 显示按钮动作配置弹窗
const btnActionProps = computed(() => {
  if (!props.activeForm.props[props.formData.field]) {
    props.activeForm.props[props.formData.field] = {
      connectorId: "",
      connectorName: "",
      sceneId: "",
      sceneName: "",
      input: [],
      output: [],
      enableOutput: false,
    }
  }
  return props.activeForm.props[props.formData.field]
})

const showBtnActionModal = () => {
  btnActionModalVisible.value = true
}
const handleActionSave = (payload: any) => {
  props.activeForm.props.btnAction = {
    ...props.activeForm.props.btnAction,
    ...payload,
  }
  btnActionModalVisible.value = false
}
</script>
<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;


.form-item {
  margin-bottom: 18px;
}

.form-item-title {
  color: #949495;
  font-size: 12px;
  line-height: 32px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-item-title-right {
  cursor: pointer;
  color: textColor.$ThemeTextColor;
}

.numRange {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left {
    width: 135px;
  }
}

.top {
  display: flex;
}

.top+.top {
  margin-top: 10px;
}

/* 按钮动作配置区域 */
.btn-action-wrapper {
  .btn-action-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .label {
      color: #949495;
      font-size: 12px;
      line-height: 32px;
    }
  }

  :deep(.arco-input) {
    cursor: pointer;
  }
}

.linkage-wrapper {
  .linkage-config-btn {
    margin-top: 0;
  }
}

.inputs {
  width: 100%;
}
</style>
