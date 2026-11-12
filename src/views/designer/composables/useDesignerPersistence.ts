import { ref, computed } from "vue"
import { getCreatorDes, getManagerAppDes, getVisitorDes } from "@/api/homePage/index"
import { saveReportDesign } from "@/api/designer/index"
import { setFormById } from "@/utils/form"
import { Message, Modal } from "@arco-design/web-vue"
import { addClassToLayout } from "@/data/designer.js"
import { onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { LayoutItem } from '../types'

export function useDesignerPersistence({ route, layout, formConfig, canvasSize, reportMode, dragLoading }: {
  route: RouteLocationNormalizedLoaded
  layout: Ref<LayoutItem[]>
  formConfig: Ref<any>
  canvasSize: Ref<number>
  reportMode: Ref<string>
  dragLoading: Ref<boolean>
}) {

const lastSaveLabel = ref('未保存')

// 重做/预览 状态管理（参考 form/designer.vue）
const lastSavedLayoutSnapshot = ref<any[]>([])
const lastSavedFormConfigSnapshot = ref<any>(null)
const hasSavedInSession = ref(false)

const initialHadReportData = !!(formConfig.value?.formList && formConfig.value.formList.length > 0)
const isNewReport = computed(() => !initialHadReportData && !hasSavedInSession.value)

// 保存报表
const persistReportToLocal = () => {
    const appId = route.query.id
    if (!appId) return

    formConfig.value.formList = layout.value
    formConfig.value.canvasSize = canvasSize.value
    formConfig.value.reportMode = reportMode.value
    setFormById(formConfig.value, appId)
}

let persistLocalTimer: ReturnType<typeof setTimeout> | null = null
const persistReportToLocalDebounced = () => {
    if (dragLoading.value) return
    if (persistLocalTimer) clearTimeout(persistLocalTimer)
    persistLocalTimer = setTimeout(() => {
        persistReportToLocal()
        persistLocalTimer = null
    }, 300)
}

const handleSaveReport = async () => {
    try {
        const appId = route.query.id
        if (!appId) {
            Message.warning('缺少应用ID')
            throw new Error('missing app id')
        }

        // 使用工具函数为 layout.value 中的每个组件添加 @class 属性
        const formListWithClass = addClassToLayout(layout.value)
        // 准备保存数据
        const saveData: any = {
            reportConfig:
            {
                name: formConfig.value.name,
                category: formConfig.value.category,
                canvasSize: canvasSize.value,
                reportMode: reportMode.value,
                formList: formListWithClass
            }
        }
        saveData.reportConfig = JSON.stringify(saveData.reportConfig)
        await saveReportDesign(saveData, appId)
        // 刷新本地 reportId —— 重新请求应用详情接口
        const activeName = localStorage.getItem('activeName')
        let appRes: any = null
        if (activeName === 'myCreate' || !activeName) {
            appRes = await getCreatorDes(appId)
        } else if (activeName === 'myManage') {
            appRes = await getManagerAppDes(appId)
        } else {
            appRes = await getVisitorDes(appId)
        }
        if (appRes?.reportId) {
            formConfig.value.reportId = appRes.reportId
        }
        persistReportToLocal()
        lastSaveLabel.value = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
        })
        // 保存成功后更新快照（供重做使用）
        updateSavedSnapshot()
    } catch (error) {
        Message.error('保存失败')
        throw error
    }
}

// 更新保存快照（供重做使用）
const updateSavedSnapshot = () => {
    lastSavedLayoutSnapshot.value = JSON.parse(JSON.stringify(layout.value))
    lastSavedFormConfigSnapshot.value = JSON.parse(JSON.stringify({
        name: formConfig.value?.name,
        category: formConfig.value?.category,
        canvasSize: canvasSize.value,
        reportMode: reportMode.value,
    }))
    hasSavedInSession.value = true
}

// 应用快照
const applyLayoutSnapshot = (layoutSnap: any[], formConfigSnap: any) => {
    layout.value = JSON.parse(JSON.stringify(layoutSnap || []))
    if (formConfigSnap) {
        if (formConfig.value) {
            formConfig.value.name = formConfigSnap.name || formConfig.value.name
            formConfig.value.category = formConfigSnap.category || formConfig.value.category
        }
        canvasSize.value = formConfigSnap.canvasSize || canvasSize.value || 100
        reportMode.value = formConfigSnap.reportMode || reportMode.value || 'simple'
    }
}

// 重做（恢复到上次保存状态）
const handleRedo = () => {
    if (isNewReport.value) {
        if (!layout.value?.length) {
            Message.info('报表已是空白状态')
            return
        }
        Modal.confirm({
            title: '确认清空',
            titleAlign: 'start',
            content: '确定要清空当前报表设计吗？清空后所有已添加的组件将被移除。',
            okText: '确定清空',
            cancelText: '取消',
            onOk: () => {
                layout.value = []
                Message.success('报表已清空')
            },
        })
        return
    }

    Modal.confirm({
        title: '确认重做',
        titleAlign: 'start',
        content: '确定要恢复至上次保存的状态？重做后新添加的组件将被移除。',
        okText: '确定重做',
        cancelText: '取消',
        onOk: () => {
            applyLayoutSnapshot(lastSavedLayoutSnapshot.value, lastSavedFormConfigSnapshot.value)
            Message.success('重做成功')
        },
    })
}
  onBeforeUnmount(() => {
    if (persistLocalTimer) {
      clearTimeout(persistLocalTimer)
      persistLocalTimer = null
    }
  })
  return { lastSaveLabel, persistReportToLocal, persistReportToLocalDebounced, handleSaveReport, handleRedo }
}
