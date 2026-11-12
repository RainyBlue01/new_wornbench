<template>
  <div class="app-body">
    <a-spin :loading="detailLoading" class="fill-content-spin">
      <div v-if="detailLoading" class="fill-content-placeholder"></div>
      <div v-else-if="formConfs.id && formConfs.formList" class="center-body">
        <a-form :model="fillForm" ref="refChangeForm" :rules="rules"
          :layout="formConfs.titleStyle !== 'hide' ? formConfs.titleStyle : 'vertical'" class="forms" v-bind="formConfs"
          :scroll-to-first-error="false">
          <div v-for="(item, index) in formConfs.formList" :key="index">
            <showItem :activeForm="{ id: '' }" :deptList="deptLists" v-if="!item.showItem" :newIndex="index"
              :showEdit="false" :list="formConfs.formList" :comDes="item" :formConfs="formConfs" />
          </div>
        </a-form>
      </div>
      <div v-else class="center-body">
        <div class="empty-box">
          <div class="img">
            <img src="../../assets/zanwuneirong@2x.png" alt="">
          </div>
          <div class="tit">
            暂无内容
          </div>
        </div>
      </div>

    </a-spin>
    <a-modal v-model:visible="templateModalVisible" title="选择模板" width="600px" @ok="handleTemplateConfirm"
      :confirm-loading="downloadLoading">
      <a-radio-group v-model="selectedTemplateId" direction="vertical" style="max-height: 400px; overflow-y: auto;">
        <a-radio :value="item.id" v-for="item in templateList" :key="item.id">
          {{ item.fileName }}
        </a-radio>
      </a-radio-group>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, watch, watchEffect, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute } from 'vue-router'

const emit = defineEmits<{
  'submit-success': []
  'reject-update': [payload: { show: boolean; reason: string }]
}>()
import showItem from '@/components/showItem/showItem.vue'
import { getDeptTree } from '@/api/common/index'
import { getPrint } from '@/api/application/index'
import { flowsToTree } from "@/utils/flowPath.ts";
import { setProps, getProps, setFormById, setRules, setForm, setUpDateData, submitFormData, setExpressionValue, setDefaultValue, setFieldControl, setFormLogics } from '@/utils/form'
import { applySelectFormOptions } from '@/utils/formSelectOptions'
import { applyFormLinkage } from '@/utils/formLinkage'
import { draftData, getDraftData } from '@/api/form/index'
import { getCreatorDes } from "@/api/homePage";
import { fillTaskData, getFillBatchTask, exportData } from "@/api/taskFillCenter";
import { fillObjectDataFix } from "@/api/taskFillManager";
import { blobDownload, openBlobForPrint } from '@/utils/export'
import { REAPPLY_FORM_DATA_STORAGE_KEY } from '@/utils/reapplyFlow'
const win = window as any

const props = defineProps({
  activeTask: {
    type: Object,
    default: () => ({})
  },
  taskState: {
    type: Number,
    default: 1
  }
})
const downloadData = ref<any>({})
const submitLoading = ref(false)
const draftLoading = ref(false)
const downloadLoading = ref(false)
const detailLoading = ref(false)
const deptLists = ref([])
const route = useRoute()
const refChangeForm = ref()
// 模板选择弹窗相关
const templateModalVisible = ref(false)
const selectedTemplateId = ref()
const templateList = ref([])
// 数据定义
const formConfs = ref({})
const fillForm = ref<any>({})
const rules = ref<any>({})

const isDataLoading = ref(false)
provide('isDataLoading', isDataLoading)

const appdes = ref({})
const title = ref('')

const fieldControl = ref([])

const appId = ref(null)

const currentObjectTask = ref({})
const resetContent = () => {
  formConfs.value = {}
  fillForm.value = {}
  rules.value = {}
  currentObjectTask.value = {}
  processConfigs.value = {}
  draftId.value = ''
}

const BtnRunning = computed(() => {
  return props.taskState === 1 && formConfs.value.subEnable && currentObjectTask.value.states == 0
})

const BtnFinish = computed(() => {
  return formConfs.value.subEnable && currentObjectTask.value.states == 1
})

// 是否重填
const IsReFill = computed(() => {
  return !!currentObjectTask.value.formData
})

const showRejectNotice = computed(() => {
  return (
    props.taskState === 1 &&
    currentObjectTask.value.validity === 0 &&
    IsReFill.value &&
    !!formConfs.value.subEnable
  )
})

const rejectReason = computed(() => {
  const task = currentObjectTask.value as Record<string, unknown>
  return (
    (task.backReason as string) ||
    (task.rejectReason as string) ||
    (task.reason as string) ||
    ''
  )
})

const emitRejectUpdate = () => {
  emit('reject-update', {
    show: showRejectNotice.value,
    reason: rejectReason.value,
  })
}
getDeptTree().then(res => {
  deptLists.value = res
})
const getAppDes = async () => {
  const res = await getCreatorDes(appId.value)
  appdes.value.showIcon = ''
  await new Promise((resolve) => setTimeout(resolve, 100))
  appdes.value = res
  appdes.value.showIcon = appdes.value.icon && appdes.value.icon != null ? (win.api.dowUrl + appdes.value.icon + '&token=' + localStorage.getItem('wornbench_token')) : '';
  appdes.value.id = appId.value
  if (props.activeTask.objectId) {
    await getCurrentObjectTask()
  }
}
const nodeConfig = ref()
const handDowload = (val: any) => {
  downloadLoading.value = true
  getPrint(props.activeTask.appId).then(res => {
    if (res.length == 0) {
      Message.error('暂无模版')
      downloadLoading.value = false
    } else if (res.length == 1) {
      let params = {
        batchId: props.activeTask.batchId,
        dataId: props.activeTask.dataId,
        fileType: res[0].fileType,
        fileId: res[0].fileId,
      }
      exportData(params, val).then(res1 => {
        blobDownload(res1, val == 1 ? formConfs.value.name + '.docx' : formConfs.value.name + '.pdf')
        downloadLoading.value = false
      }).catch(() => {
        downloadLoading.value = false
      })
    } else {
      templateList.value = res
      templateModalVisible.value = true
      selectedTemplateId.value = null
      isPrint.value = false
      downloadData.value = {
        batchId: props.activeTask.batchId,
        dataId: props.activeTask.dataId,
        fileType: '',
        fileId: '',
      }
      downloadLoading.value = false
    }
  }).catch(() => {
    downloadLoading.value = false
  })
}
const isPrint = ref(false)
const handPrint = (val: any) => {
  downloadLoading.value = true
  getPrint(props.activeTask.appId).then(res => {
    if (res.length == 0) {
      Message.error('暂无模版')
      downloadLoading.value = false
    } else if (res.length == 1) {
      let params = {
        batchId: props.activeTask.batchId,
        dataId: props.activeTask.dataId,
        fileType: res[0].fileType,
        fileId: res[0].fileId,
      }
      exportData(params, val).then(res1 => {
        openBlobForPrint(res1);
        downloadLoading.value = false
      }).catch(() => {
        downloadLoading.value = false
      })
    } else {
      templateList.value = res
      templateModalVisible.value = true
      selectedTemplateId.value = null
      isPrint.value = true
      downloadData.value = {
        val: val,
        batchId: props.activeTask.batchId,
        dataId: props.activeTask.dataId,
        fileType: '',
        fileId: '',
      }
      downloadLoading.value = false
    }
  }).catch(() => {
    downloadLoading.value = false
  })
}

// 处理模板选择确认
const handleTemplateConfirm = () => {
  if (!selectedTemplateId.value) {
    Message.warning('请选择一个模板')
    return
  }

  const selectedTemplate = templateList.value.find(item => item.id === selectedTemplateId.value)
  if (selectedTemplate) {
    downloadData.value.fileType = selectedTemplate.fileType
    downloadData.value.fileId = selectedTemplate.fileId
    downloadLoading.value = true
    templateModalVisible.value = false

    exportData(downloadData.value, downloadData.value.val).then(res => {
      if (isPrint.value) {
        openBlobForPrint(res);
      } else {
        blobDownload(res, downloadData.value.val == 1 ? formConfs.value.name + '.docx' : formConfs.value.name + '.pdf')
      }
      isPrint.value = false
      downloadLoading.value = false
    }).catch(() => {
      downloadLoading.value = false
      isPrint.value = false
    })
  }
}
const processConfigs = ref({})
const draftId = ref('')
const getCurrentObjectTask = async () => {
  const res = await getFillBatchTask(props.activeTask.objectId)
  currentObjectTask.value = res
  formConfs.value = res.designInfo.formConfig ? JSON.parse(res.designInfo.formConfig) : { id: '' }
  let processConfig = res.designInfo.processConfig ? JSON.parse(res.designInfo.processConfig) : {
    sequenceFlows: [],
    nodes: []
  }
  processConfigs.value = processConfig
  processConfig.nodes.map(v => {
    if (v.type == 'START') {
      fieldControl.value = v.fieldControl
      nodeConfig.value = v
    }
  })
  flowsToTree(processConfig, appId.value)
  formConfs.value.name = appdes.value.appName
  formConfs.value.category = appdes.value.category
  formConfs.value.id = appdes.value.formId
  formConfs.value.appId = res.designInfo.appId

  setForm(formConfs.value.formList)
  if (Array.isArray(formConfs.value.formList)) {
    setRules(formConfs.value.formList, rules.value)
  }
  setFormById(formConfs.value, res.designInfo.appId)

  await loadFillFormData()

  await nextTick()
  refChangeForm.value?.clearValidate()
  emitRejectUpdate()
}

const walkHasType = (list: any[], types: string[]): boolean => {
  if (!Array.isArray(list)) return false
  for (const item of list) {
    if (types.includes(item.type)) return true
    if (item.children && walkHasType(item.children, types)) return true
    if (item.list) {
      for (const row of item.list) {
        if (walkHasType(row, types)) return true
      }
    }
  }
  return false
}

const NON_TRIGGER_FIELD_TYPES = ['ROW', 'COL', 'TITLE', 'SPLIT_LINE', 'HR', 'EDITORS', 'BUTTON_CONNECTOR']

const syncFieldsViaFilterData = (list: any[]) => {
  if (!Array.isArray(list)) return
  list.forEach((field) => {
    if (field.showItem) return
    if (Array.isArray(field.children) && field.type !== 'SUBFORM') {
      syncFieldsViaFilterData(field.children)
    }
    if (Array.isArray(field.list)) {
      field.list.forEach((row: any[]) => syncFieldsViaFilterData(row))
    }
    if (!field.id || !field.props || NON_TRIGGER_FIELD_TYPES.includes(field.type)) return
    filterData({
      type: field.type,
      id: field.id,
      title: field.title,
      props: { value: field.props.value },
      list: field.list,
    })
  })
}

const getLinkageFormId = () => String(formConfs.value.id || appdes.value.formId || '')
const getLinkageAppId = () => String(formConfs.value.appId || appId.value || appdes.value.id || '')

const loadFormDataViaFilter = async (formData: Record<string, any>) => {
  isDataLoading.value = true
  try {
    await setUpDateData(formData, formConfs.value.formList, fillForm.value, false, appdes.value.formId)
    const needAsyncWait = walkHasType(formConfs.value.formList, ['SUBFORM', 'RELATION_DATA', 'ROW', 'COL'])
    if (needAsyncWait) {
      await new Promise((resolve) => setTimeout(resolve, 1100))
    }
    syncFieldsViaFilterData(formConfs.value.formList)
    await applySelectFormOptions(
      formConfs.value.formList,
      fillForm.value,
      getLinkageFormId(),
    )
    await applyFormLinkage(
      formConfs.value.formList,
      fillForm.value,
      getLinkageFormId(),
      undefined,
      false,
      getLinkageAppId(),
    )
    filterData(undefined)
  } finally {
    isDataLoading.value = false
  }
}

const loadDefaultViaFilter = async () => {
  isDataLoading.value = true
  try {
    setDefaultValue(formConfs.value.formList, {})
    await new Promise((resolve) => setTimeout(resolve, 200))
    syncFieldsViaFilterData(formConfs.value.formList)
    await applySelectFormOptions(
      formConfs.value.formList,
      fillForm.value,
      getLinkageFormId(),
    )
    await applyFormLinkage(
      formConfs.value.formList,
      fillForm.value,
      getLinkageFormId(),
      undefined,
      false,
      getLinkageAppId(),
    )
    filterData(undefined)
  } finally {
    isDataLoading.value = false
  }
}

const loadFillFormData = async () => {
  const reapplyData = sessionStorage.getItem(REAPPLY_FORM_DATA_STORAGE_KEY)
  if (reapplyData) {
    try {
      await loadFormDataViaFilter(JSON.parse(reapplyData))
      return
    } finally {
      sessionStorage.removeItem(REAPPLY_FORM_DATA_STORAGE_KEY)
    }
  }

  if (IsReFill.value) {
    await loadFormDataViaFilter(currentObjectTask.value.formData)
    return
  }

  const res1 = await getDraftData(formConfs.value.appId)
  if (res1.id) {
    draftId.value = res1.id
    await loadFormDataViaFilter(JSON.parse(res1.formData))
    return
  }

  draftId.value = ''
  await loadDefaultViaFilter()
}



const getPropsItem = (id: string, propsItem: any) => {
  return getProps(id, formConfs.value.formList, propsItem)
}
const setPropsItem = (id: string, propsItem: any, data: any) => {
  setProps(id, formConfs.value.formList, propsItem, data)
}
const setRulesItem = (data: any) => {
  setRules(data, rules.value)
}

const getFieldComponentType = (field: any) => field?.type || field?.componentType || field?.inputType || ''

const getFieldValue = (field: any) => {
  if (field?.props && Object.prototype.hasOwnProperty.call(field.props, 'value')) {
    return field.props.value
  }
  if (Object.prototype.hasOwnProperty.call(field || {}, 'value')) {
    return field.value
  }
  if (Object.prototype.hasOwnProperty.call(field || {}, 'default')) {
    return field.default
  }
  return undefined
}

const isEmptyValueByComponentType = (type: string, fieldValue: any) => {
  if (fieldValue === null || fieldValue === undefined || fieldValue === '') return true
  if (Array.isArray(fieldValue)) return fieldValue.length === 0

  if (typeof fieldValue === 'object') {
    if (type === 'ADDRESS' || type === 'LOCATION') {
      return !fieldValue.prov && !fieldValue.city && !fieldValue.dist && !fieldValue.det && !fieldValue.address
    }

    if (type === 'DATE_INTERVAL' || type === 'TIME_INTERVAL') {
      return !fieldValue.start && !fieldValue.end && !fieldValue[0] && !fieldValue[1]
    }

    if (type === 'USER' || type === 'DEPT' || type === 'USER_MULTIPLE' || type === 'DEPT_MULTIPLE') {
      return !fieldValue.id && !fieldValue.value && !fieldValue.name && !fieldValue.label && !fieldValue.userId && !fieldValue.deptId
    }

    return Object.keys(fieldValue).length === 0
  }

  return false
}

const shouldClearFieldValidate = (field: any) => {
  const fieldValue = getFieldValue(field)
  const componentType = getFieldComponentType(field)
  return !isEmptyValueByComponentType(componentType, fieldValue)
}
const filterData = (value: {
  list?: any[];
  title?: string
  type: string; id: string | number; props: { value: any; };
} | undefined) => {
  if (value) {
    fillForm.value[value.id] = value.props.value
    setFormById(formConfs.value, appId.value)
    setExpressionValue(
      formConfs.value.formList,
      fillForm.value,
      value,
      formConfs.value.id,
      false,
      !isDataLoading.value,
      getLinkageAppId(),
    )
    nextTick(() => {
      if (value.list) {
        value.list.forEach((item: any) => {
          item.forEach((item2: any) => {
            if (shouldClearFieldValidate(item2)) {
              refChangeForm.value?.clearValidate?.(item2.id as string)
            }
          })
        })
      } else {
        refChangeForm.value?.clearValidate?.(value.id as string)
      }
    })
    if (value.type == "USER_MULTIPLE" || value.type == "DEPT_MULTIPLE" || value.type == "USER" || value.type == "DEPT") {
      let id = String(value.id).split('.')
      if (id.length > 1) {
        rules.value[value.id] = value.props.value ? [] : [
          { type: "object", required: true, message: value.title + "不能为空" },
        ]
        refChangeForm.value?.clearValidate?.()
      } else {
        refChangeForm.value?.validateField?.(value.id)
      }

    }
  }
  setFieldControl(formConfs.value.formList, fieldControl.value, false)
  setFormLogics(formConfs.value.formList, formConfs.value.formLogics)
}





const submitForm = (val: any) => {
  if (val) {
    // 存草稿
    if (submitLoading.value) {
      Message.warning('正在提交表单，请稍后再试')
      return
    }

    draftLoading.value = true
    let params = {
      formData: fillForm.value,
    }
    submitFormData(params, formConfs.value.formList)
    params.formData = JSON.stringify(params.formData)
    draftData(params, formConfs.value.appId).then(() => {
      Message.success("保存草稿成功");
      formConfs.value = {}
      fillForm.value = {}
      getCurrentObjectTask()
      draftLoading.value = false
    }).catch(() => {
      draftLoading.value = false
    })
  } else {
    // 提交表单
    if (draftLoading.value) {
      Message.warning('正在保存草稿，请稍后再试')
      return
    }

    submitLoading.value = true
    refChangeForm.value.validate((error: any) => {
      if (!error) {
        let params = {
          appId: appId.value,
          batchId: props.activeTask.batchId,
          reFill: IsReFill.value,
          formData: fillForm.value,
        }
        submitFormData(params, formConfs.value.formList)

        if (draftId.value) {
          params.draftId = draftId.value
        }

        fillTaskData(params).then(res => {
          Message.success("提交成功");
          formConfs.value = {}
          fillForm.value = {}
          getCurrentObjectTask()
          submitLoading.value = false
          // 通知父组件刷新 activeTask
          emit('submit-success')
        }).catch(() => {
          submitLoading.value = false
        })


      } else {
        submitLoading.value = false
      }
    });
  }
}

const handleObjectRefill = () => {
  if (submitLoading.value || draftLoading.value) {
    Message.warning('正在进行其他操作，请稍后再试')
    return
  }

  submitLoading.value = true
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      let params = {
        appId: appId.value,
        objectId: props.activeTask.objectId,
        formId: props.activeTask.formId,
        formData: fillForm.value,
      }
      submitFormData(params, formConfs.value.formList)
      fillObjectDataFix(params).then(res => {
        Message.success("提交成功");
        formConfs.value = {}
        fillForm.value = {}
        getCurrentObjectTask()
        submitLoading.value = false
        // 通知父组件刷新 activeTask
        emit('submit-success')
      }).catch(() => {
        submitLoading.value = false
      })
    } else {
      submitLoading.value = false
    }
  });
}

// 监听 activeTask
watch(() => props.activeTask, async (newValue) => {
  resetContent()
  if (!newValue?.appId || !newValue?.objectId) return
  detailLoading.value = true
  try {

    appId.value = newValue.appId
    localStorage.setItem('taskFillCenterAppId', newValue.appId)
    await getAppDes()
  } finally {
    detailLoading.value = false
  }
}, { deep: true, immediate: true })

watchEffect(() => {
  // 审核中
  formConfs.value.disabled = currentObjectTask.value.validity == 2;
})
const getNodeData = () => {
  return processConfigs.value
}
defineExpose({
  getNodeData,
  submitForm,
  get showRejectNotice() {
    return showRejectNotice.value
  },
  get rejectReason() {
    return rejectReason.value
  },
  currentObjectTask,
  get BtnFinish() {
    return BtnFinish.value
  },
  downloadLoading,
  submitLoading,
  draftLoading,
  handleObjectRefill,
  handPrint,
  handDowload,
  formConfs,
})
provide("provideDesigner", { setPropsItem, getPropsItem, filterData, setRulesItem });
provide('formModel', fillForm);

</script>

<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.app-body {
  display: flex;
  padding: 0;
  flex: 1;
}

:deep(.forms) {
  .box {
    border-bottom: 0;
    padding: 12px 24px;
  }

  padding: 12px 0;
}

.fill-content-spin {
  width: 100%;
  flex: 1;

  :deep(.arco-spin-children) {
    min-height: 100%;
  }
}

.fill-content-placeholder {
  min-height: 200px;
}

.center-body {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;

  .forms {

    &:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }
  }

  .bottom-bar-finished {
    padding: 16px 0 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;

    :deep(.arco-btn) {
      padding: 10px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      line-height: 1;
      height: auto;
    }

    :deep(.arco-btn-primary) {
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
      }

      &:active {
        transform: translateY(0) scale(0.96);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      }
    }

    :deep(.arco-btn-outline) {
      background: transparent;
      color: #64748b;
      border: 1px solid #e2e8f0;

      &:hover {
        background: #f1f5f9;
        color: #334155;
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0) scale(0.98);
      }
    }
  }
}

.empty-box {
  width: 90%;
  background-color: #fff;
  display: flex;
  margin: 20px auto;
  padding: 20px 0;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .img {
    img {
      width: 148px;
    }
  }

  .tit {
    font-size: 16px;
    color: #999;
  }
}
</style>
