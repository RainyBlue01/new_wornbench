<template>
    <div class="report-designer-page">
        <banner :active="1" :breadcrumb-current="reportBannerTitle" />

        <div class="report-designer-layout">
            <aside class="report-designer-sidebar-left">
                <div class="report-designer-component-scroll">
                    <div v-for="section in cptOptions" :key="section.name">
                        <div class="report-designer-component-group-title">{{ section.name }}</div>
                        <div
                            v-for="item in section.children"
                            :key="item.name + item.type"
                            class="report-designer-component-item"
                            unselectable="on"
                            :config="JSON.stringify(item)"
                            draggable="true"
                            @drag="drag"
                            @dragend="dragend"
                        >
                            <component :is="item.icon" size="18" />
                            <span>{{ item.name }}</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main class="report-designer-canvas-area">
                <div class="report-designer-canvas-paper" :style="{ width: `${canvasSize}%` }">
                    <div class="report-designer-canvas-inner canvas-area" ref="wrapper">
                        <GridLayout
                            ref="gridLayout"
                            v-model:layout="layout"
                            :col-num="GRID_COL_NUM"
                            :row-height="100"
                            :is-draggable="true"
                            :is-resizable="true"
                            :margin="[16, 16]"
                            :vertical-compact="true"
                            @layout-updated="onLayoutUpdated"
                        >
                            <template #item="{ item: gridItem }">
                                <div
                                    class="report-designer-widget grid-item-content" @click="handleComponentClick((gridItem as any).i)"
                                    :class="{ 'report-designer-widget--active': selectedComponentId === (gridItem as any).i }"
                                >
                                    <div
                                        class="report-designer-widget-header"
                                        
                                    >
                                        <div class="report-designer-widget-title">
                                            <span class="report-designer-widget-title-text">
                                                {{ (gridItem as any).label || (gridItem as any).name || getComponentName((gridItem as any).type) }}
                                            </span>
                                            <a-button
                                                v-if="(gridItem as any).type === 'TABLE' && (gridItem as any).props?.fun?.download"
                                                class="report-designer-widget-download"
                                                size="mini"
                                                :loading="isTableDownloading((gridItem as any).i)"
                                                @click.stop="handleTableDownload((gridItem as any).i)"
                                            >
                                                下载
                                            </a-button>
                                        </div>
                                        <transition name="fade">
                                            <div
                                                v-if="selectedComponentId === (gridItem as any).i"
                                                class="report-designer-widget-actions component-actions"
                                            >
                                                <button
                                                    type="button"
                                                    class="report-designer-widget-action-btn rename edit"
                                                    title="重命名"
                                                    @click.stop="handleRenameComponent((gridItem as any).i)"
                                                >
                                                    <icon-edit size="14" />
                                                </button>
                                                <button
                                                    type="button"
                                                    class="report-designer-widget-action-btn edit"
                                                    title="配置"
                                                    @click.stop="handleEditComponent((gridItem as any).id)"
                                                >
                                                    <icon-settings size="14" />
                                                </button>
                                                <button
                                                    type="button"
                                                    class="report-designer-widget-action-btn delete"
                                                    title="删除"
                                                    @click.stop="handleDeleteComponent((gridItem as any).i)"
                                                >
                                                    <icon-delete size="14" />
                                                </button>
                                            </div>
                                        </transition>
                                    </div>

                                    <div class="report-designer-widget-body component-body">
                                        <template v-if="(gridItem as any).type === 'TABLE'">
                                            <table_cup
                                                :key="(gridItem as any).i"
                                                :type="(gridItem as any).type"
                                                :ref="(el: any) => setTableRef(el, (gridItem as any).i)"
                                                :option="(gridItem as any).props"
                                                :name="(gridItem as any).name"
                                                :reportId="formConfig.reportId"
                                                :height="(gridItem as any).h * 100"
                                                :id="(gridItem as any).id"
                                                hide-download
                                            />
                                        </template>

                                        <template
                                            v-if="(gridItem as any).classify === 'INDICATOR' || (gridItem as any).classify === 'CHART'"
                                        >
                                            <text_cup
                                                :reportId="formConfig.reportId"
                                                :type="(gridItem as any).type"
                                                :option="(gridItem as any).props"
                                                :name="(gridItem as any).name"
                                                :height="(gridItem as any).h * 100"
                                                :cpt-x="0"
                                                :cpt-y="0"
                                                :id="(gridItem as any).id"
                                            />
                                        </template>

                                        <template v-if="(gridItem as any).type === 'CONDITION'">
                                            <select_cup
                                                :key="(gridItem as any).props?.filterRefreshKey"
                                                :deptList="deptList"
                                                :option="(gridItem as any).props"
                                                :name="(gridItem as any).name"
                                                :height="(gridItem as any).h * 100"
                                                :id="(gridItem as any).i"
                                                :cache-components="[]"
                                                @get-select-list="handleSelectChange"
                                            />
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </GridLayout>

                        <div v-if="layout.length === 0" class="report-designer-empty">
                            <emptyBox embedded desc="拖拽左侧组件到此处" />
                        </div>
                    </div>
                </div>
            </main>

            <aside class="report-designer-sidebar-right">
                <div class="report-designer-right-body">
                    <div class="report-designer-prop-group">
                        <label class="report-designer-prop-label">报表模式</label>
                        <a-select v-model="reportMode" :style="{ width: '100%' }">
                            <a-option value="simple">简单报表</a-option>
                            <a-option value="cockpit">驾驶舱</a-option>
                        </a-select>
                    </div>
                    <div class="report-designer-prop-group">
                        <label class="report-designer-prop-label">画布大小</label>
                        <div class="report-designer-canvas-size-value">{{ canvasSize }}%</div>
                        <input
                            v-model.number="canvasSize"
                            type="range"
                            class="report-designer-size-slider"
                            min="60"
                            max="100"
                            step="1"
                        />
                        <div class="report-designer-canvas-size-labels">
                            <span>60%</span>
                            <span>80%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>

        <div class="report-designer-bottom-bar form-designer-bottom-bar bottom-bar">
            <div class="form-designer-status-info status-info">
                <span>
                    <i class="fas fa-cubes" aria-hidden="true" />
                    已添加 <strong class="status-count">{{ layout.length }}</strong> 个组件
                </span>
                <span>
                    <i class="fas fa-clock" aria-hidden="true" />
                    上次保存：<strong class="status-save">{{ lastSaveLabel }}</strong>
                </span>
                <span>
                    <i class="fas fa-check-circle" aria-hidden="true" />
                    状态：<strong class="status-editing">编辑中</strong>
                </span>
            </div>
            <div class="form-designer-status-actions status-actions">
                <button type="button" class="btn-bar btn-bar--ghost" title="重做" @click="handleRedo">
                    <i class="fas fa-redo" aria-hidden="true" />重做
                </button>
                <button type="button" class="btn-bar btn-bar--ghost" @click="handleBottomSave">
                    <i class="fas fa-save" aria-hidden="true" />保存
                </button>
                <button type="button" class="btn-bar btn-bar--ghost" @click="openReportPreview">
                    <i class="fas fa-eye" aria-hidden="true" />预览
                </button>
                <button type="button" class="btn-bar btn-bar--primary" :disabled="publishLoading" @click="goPublishApp">
                    下一步：发布报表
                </button>
            </div>
        </div>

        <!-- 组件名称输入弹窗 -->
        <a-modal v-model:visible="nameModalVisible"
            :title="pendingComponent?.config.type === 'CONDITION' ? '配置数据筛选' : '设置组件名称'" @ok="confirmAddComponent"
            @cancel="cancelAddComponent" :mask-closable="false">
            <a-form :model="nameForm" layout="vertical">
                <a-form-item field="name" label="组件名称" :rules="[{ required: true, message: '请输入组件名称' }]">
                    <a-input v-model="nameForm.name" placeholder="请输入组件名称" allow-clear />
                </a-form-item>
                <template v-if="pendingComponent?.config.type === 'CONDITION'">
                    <a-form-item field="datasource" label="选择数据表" :rules="[{ required: true, message: '请选择数据表' }]">
                        <a-select v-model="nameForm.datasource" placeholder="请选择数据表"
                            @change="handleNameFormDatasourceChange" allow-clear>
                            <a-option v-for="item in datasourceOptions" :key="item.tableName" :label="item.comment"
                                :value="item.tableName" />
                        </a-select>
                    </a-form-item>
                    <a-form-item field="field" label="选择筛选字段" :rules="[{ required: true, message: '请选择筛选字段' }]">
                        <a-select v-model="nameForm.field" placeholder="请先选择数据表" :disabled="!nameForm.datasource"
                            allow-clear>
                            <a-option v-for="item in fieldOptions[nameForm.datasource]" :key="item.id"
                                :label="item.label" :value="item.id" />
                        </a-select>
                    </a-form-item>
                </template>
            </a-form>
        </a-modal>

        <!-- 重命名弹窗 -->
        <a-modal v-model:visible="renameModalVisible" title="重命名组件" @ok="confirmRename" @cancel="cancelRename"
            :mask-closable="false">
            <a-form :model="renameForm" layout="vertical">
                <a-form-item field="name" label="组件名称" :rules="[{ required: true, message: '请输入组件名称' }]">
                    <a-input v-model="renameForm.name" placeholder="请输入组件名称" allow-clear />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 数据筛选配置弹窗 -->
        <a-modal v-model:visible="selectConfigModalVisible" title="配置数据筛选" @ok="confirmSelectConfig"
            @cancel="cancelSelectConfig" :mask-closable="false" width="500px">
            <a-form :model="selectConfigForm" layout="vertical">
                <a-form-item field="datasource" label="选择数据表" :rules="[{ required: true, message: '请选择数据表' }]">
                    <a-select v-model="selectConfigForm.datasource" placeholder="请选择数据表"
                        @change="handleSelectConfigDatasourceChange" allow-clear>
                        <a-option v-for="item in datasourceOptions" :key="item.tableName" :label="item.comment"
                            :value="item.tableName" />
                    </a-select>
                </a-form-item>
                <a-form-item field="field" label="选择筛选字段" :rules="[{ required: true, message: '请选择筛选字段' }]">
                    <a-select v-model="selectConfigForm.field" placeholder="请先选择数据表"
                        :disabled="!selectConfigForm.datasource" allow-clear>
                        <a-option v-for="item in fieldOptions[selectConfigForm.datasource]" :key="item.id"
                            :label="item.label" :value="item.id" />
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 报表预览模态框 -->
        <a-modal
            v-model:visible="reportPreviewVisible"
            title="报表预览"
            title-align="start"
            width="90%"
            :footer="false"
            :mask-closable="true"
            class="report-preview-modal"
        >
            <div class="report-preview-container">
                <div class="report-preview-paper" :style="{ width: `${canvasSize}%`, maxWidth: '100%',margin: '0 auto' }">
                    <GridLayout
                        v-if="reportPreviewVisible && layout.length > 0"
                        :layout="layout"
                        :col-num="GRID_COL_NUM"
                        :row-height="100"
                        :is-draggable="false"
                        :is-resizable="false"
                        :margin="[16, 16]"
                        :vertical-compact="true"
                    >
                        <template #item="{ item: gridItem }">
                            <div class="report-designer-widget grid-item-content report-preview-widget">
                                <div class="report-designer-widget-header">
                                    <div class="report-designer-widget-title">
                                        <span class="report-designer-widget-title-text">
                                            {{ (gridItem as any).label || (gridItem as any).name || getComponentName((gridItem as any).type) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="report-designer-widget-body component-body">
                                    <template v-if="(gridItem as any).type === 'TABLE'">
                                        <table_cup
                                            :key="(gridItem as any).i + '-preview'"
                                            :ref="(el: any) => setPreviewTableRef(el, (gridItem as any).i)"
                                            :type="(gridItem as any).type"
                                            :option="(gridItem as any).props"
                                            :name="(gridItem as any).name"
                                            :reportId="formConfig.reportId"
                                            :height="(gridItem as any).h * 100"
                                            :id="(gridItem as any).id"
                                            hide-download
                                        />
                                    </template>
                                    <template
                                        v-if="(gridItem as any).classify === 'INDICATOR' || (gridItem as any).classify === 'CHART'"
                                    >
                                        <text_cup
                                            :key="(gridItem as any).i + '-preview-text'"
                                            :reportId="formConfig.reportId"
                                            :type="(gridItem as any).type"
                                            :option="(gridItem as any).props"
                                            :name="(gridItem as any).name"
                                            :height="(gridItem as any).h * 100"
                                            :cpt-x="0"
                                            :cpt-y="0"
                                            :id="(gridItem as any).id"
                                            chart-key="-preview"
                                        />
                                    </template>
                                    <template v-if="(gridItem as any).type === 'CONDITION'">
                                        <select_cup
                                            :key="(gridItem as any).props?.filterRefreshKey + '-preview'"
                                            :deptList="deptList"
                                            :option="(gridItem as any).props"
                                            :name="(gridItem as any).name"
                                            :height="(gridItem as any).h * 100"
                                            :id="(gridItem as any).i"
                                            :cache-components="[]"
                                            @get-select-list="handlePreviewSelectChange"
                                        />
                                    </template>
                                </div>
                            </div>
                        </template>
                    </GridLayout>
                    <div v-else class="report-preview-empty">
                        <emptyBox embedded desc="当前报表为空" />
                    </div>
                </div>
            </div>
        </a-modal>

        <!-- 保存确认弹窗 -->
        <a-modal
            v-model:visible="showSaveModal"
            title="提示"
            title-align="start"
            hide-footer
            class="save-confirm-modal"
            :mask-closable="true"
            :unmount-on-close="true"
        >
            <div class="modal-content">
                <div class="modal-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48">
                        <circle cx="12" cy="12" r="10" fill="rgba(var(--primary-6), 0.1)" />
                        <path
                            d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-4v2h2v-2h-2zm0-8v6h2V8h-2z"
                            fill="rgb(var(--primary-6))"
                        />
                    </svg>
                </div>
                <div class="modal-text">确定要保存报表设计吗？</div>
            </div>
            <template #footer>
                <div class="modal-footer">
                    <a-button class="btn-next" :disabled="saveLoading" @click="handleSaveModalCancel">
                        下一步
                    </a-button>
                    <a-button class="btn-save" type="primary" :loading="saveLoading" @click="handleSaveModalOk">
                        保存
                    </a-button>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { useDesignerPersistence } from "./composables/useDesignerPersistence"
import { useDesignerDatasource } from "./composables/useDesignerDatasource"
import { GRID_COL_NUM, GRID_ITEM_DRAG_ALLOW_FROM, GRID_ITEM_DRAG_IGNORE_FROM, findAvailableGridPosition, resolveLayoutCollisions } from "./utils/gridLayout"
import type { ComponentDefinition, LayoutItem } from './types'
import { ref, nextTick, onMounted, onBeforeUnmount, reactive, provide, computed, watch } from 'vue'
import { GridLayout } from 'grid-layout-plus'
import { nanoid } from 'nanoid';
import { getCreatorDes, getManagerAppDes, getVisitorDes } from '@/api/homePage/index'
import { getDeptTree } from '@/api/common/index'
import type { GridLayout as GridLayoutType } from 'grid-layout-plus'
import type { ECharts } from '@/utils/echarts'
import { useRouter, useRoute } from 'vue-router'
import { getFormById } from '@/utils/form'
import { findReportFilterTables } from '@/utils/reportFilterTargets'
import { getAppReturnRoute } from '@/views/application/composables/useAppFormNav'
import { Message, Modal } from '@arco-design/web-vue'
import banner from '@/components/banner/banner.vue'

import {
    IconEdit,
    IconDelete,
    IconSettings,
} from '@arco-design/web-vue/es/icon'
import { cptOptions, metricColors } from '@/data/designer.js'
import emptyBox from '@/components/emptyBox/emptyBox.vue'







const canvasSize = ref(100)
const reportMode = ref('simple')
const showSaveModal = ref(false)
const saveLoading = ref(false)
const publishLoading = ref(false)
const filterData = () => {

}
const deptList = ref<any[]>([])

provide("provideDesigner", { filterData });
// grid-layout-plus refs
const wrapper = ref<HTMLElement>()
const gridLayout = ref<InstanceType<typeof GridLayoutType>>()

// 鼠标位置跟踪
const mouseAt = { x: -1, y: -1 }
const router = useRouter()
const route = useRoute()
const formConfig = ref(getFormById(route.query.id))



const reportBannerTitle = computed(() => {
    const name = formConfig.value?.name || '报表'
    return `${name} / 设计报表`
})


const layout = ref<LayoutItem[]>([])
const tableRefs = ref<any>({})
const chartInstances = ref<Record<string, ECharts>>({})
let componentCounter = 0

// 选中的组件 ID
const selectedComponentId = ref<string | null>(null)

// 外部拖拽相关
const dropId = 'drop'
let dragItemConfig: ComponentDefinition | null = null

// 组件名称输入弹窗相关
const nameModalVisible = ref(false)
const nameForm = reactive({
    name: '',
    datasource: '',
    field: ''
})
let pendingComponent: { config: ComponentDefinition; x: number; y: number; w: number; h: number; dropId?: string } | null = null

// 重命名弹窗相关
const renameModalVisible = ref(false)
const renameForm = ref({ name: '' })
const renamingComponentId = ref<string | null>(null)

// 数据筛选配置弹窗相关
const selectConfigModalVisible = ref(false)
const selectConfigForm = reactive({
    datasource: '',
    field: ''
})
const configuringSelectId = ref<string | null>(null)




// 设置表格 ref
const setTableRef = (el: any, componentId: string) => {
    if (el) {
        tableRefs.value[componentId] = el
    } else {
        delete tableRefs.value[componentId]
    }
}

const previewTableRefs = ref<Record<string, any>>({})
const setPreviewTableRef = (el: any, componentId: string) => {
    if (el) previewTableRefs.value[componentId] = el
    else delete previewTableRefs.value[componentId]
}
const handlePreviewSelectChange = (params: any, _moduleConfigId: any, id: any) => {
    findReportFilterTables(layout.value, id).forEach(tableComp => {
        previewTableRefs.value[String(tableComp.i)]?.updateFilterCondition(params)
    })
}

const tableDownloadLoadingMap = ref<Record<string, boolean>>({})

const isTableDownloading = (componentId: string) => !!tableDownloadLoadingMap.value[componentId]

const handleTableDownload = async (componentId: string) => {
    const tableRef = tableRefs.value[componentId]
    if (!tableRef || typeof tableRef.download !== 'function') return

    tableDownloadLoadingMap.value[componentId] = true
    try {
        await tableRef.download()
    } finally {
        tableDownloadLoadingMap.value[componentId] = false
    }
}

// 同步鼠标位置
function syncMousePosition(event: MouseEvent) {
    mouseAt.x = event.clientX
    mouseAt.y = event.clientY
}
const dragLoading = ref(true)
onMounted(async () => {
    let activeNames = localStorage.getItem('activeName')
    if (activeNames == 'myCreate' || !activeNames) {
        try {
            const res = await getCreatorDes(route.query.id)
    if (res && res.reportId) {
                formConfig.value.reportId = res.reportId
            }
            if (res?.appName) {
                formConfig.value.name = res.appName
            }
        } catch (error) {
            console.error('获取应用详情失败:', error)
        }
    } else if (activeNames == 'myManage') {
        try {
            const res = await getManagerAppDes(route.query.id)
    if (res && res.reportId) {
                formConfig.value.reportId = res.reportId
            }
            if (res?.appName) {
                formConfig.value.name = res.appName
            }
        } catch (error) {
            console.error('获取应用详情失败:', error)
        }
    } else {
        try {
            const res = await getVisitorDes(route.query.id)
    if (res && res.reportId) {
                formConfig.value.reportId = res.reportId
            }
            if (res?.appName) {
                formConfig.value.name = res.appName
            }
        } catch (error) {
            console.error('获取应用详情失败:', error)
        }
    }
    document.addEventListener('dragover', syncMousePosition)
    document.addEventListener('click', handleClickOutside)
    // `formConfig` 或 `formList` 可能为空；确保 layout 始终是数组，避免模板里 `layout.length` 报错
    const loadedLayout = formConfig.value?.formList ?? []

    // 确保每个 layout item 的 i 属性唯一（grid-layout-plus 要求）
    const usedIds = new Set<string>()
    layout.value = loadedLayout.map((item: any) => {
        // 1. 处理 ID 唯一性，防止重复 ID 导致 grid 更新异常
        if (!item.i || usedIds.has(item.i)) {
            componentCounter++
            item.i = `component-${componentCounter}`
        }
        usedIds.add(item.i)
        // 更新 componentCounter 为当前最大值，避免后续添加时冲突
        const num = parseInt(item.i.replace('component-', ''), 10)
        if (!isNaN(num) && num > componentCounter) {
            componentCounter = num
        }

        // 2. 防御性处理：为缺失或无效的 x, y, w, h 提供默认值，防止 grid-layout 计算死循环导致页面卡死
        item.x = (typeof item.x === 'number' && !isNaN(item.x)) ? item.x : 0
        item.y = (typeof item.y === 'number' && !isNaN(item.y)) ? item.y : 0
        item.w = (typeof item.w === 'number' && !isNaN(item.w) && item.w > 0) ? item.w : 12
        item.h = (typeof item.h === 'number' && !isNaN(item.h) && item.h > 0) ? item.h : 1

        // 3. 确保 static 属性存在
        if (typeof item.static === 'undefined') {
            item.static = false
        }

        return item
    }) as any

    layout.value = resolveLayoutCollisions(layout.value)
    layout.value.forEach((item) => {
        if (item.props) {
            item.props.position = { x: item.x, y: item.y }
        }
    })

    if (formConfig.value.canvasSize) {
        canvasSize.value = Number(formConfig.value.canvasSize) || 100
    }
    if (formConfig.value.reportMode) {
        reportMode.value = formConfig.value.reportMode
    }

    setTimeout(() => {
        dragLoading.value = false
    })
    window.addEventListener('resize', handleChartResize)

    // 获取应用详情以更新 reportId


    await loadDatasourceList()
    const res = await getDeptTree()
    deptList.value = res || []
})



// nameForm 数据源变化处理（组件命名弹窗）
const handleNameFormDatasourceChange = async (tableName: string) => {
    nameForm.field = ''
    await handleDatasourceChange(tableName)
}

const handleChartResize = () => {
    Object.values(chartInstances.value).forEach(chart => chart.resize())
}

onBeforeUnmount(() => {
    document.removeEventListener('dragover', syncMousePosition)
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', handleChartResize)
})

// 拖拽中的临时项配置
const dragItem = { x: 0, y: 0, w: 4, h: 3, i: '' }

// 标记是否已经初始化完成（防止页面加载时触发保存）
const isInitialized = ref(false)
// 拖拽开始 - 从外部拖入
const drag = (e: DragEvent) => {
    dragLoading.value = true
    const target = e.currentTarget as HTMLElement
    const configStr = target.getAttribute('config')
    if (configStr) {
        dragItemConfig = JSON.parse(configStr)
        // 使用 props.size 中的 width 和 height
        dragItem.w = dragItemConfig.props.size.width
        dragItem.h = dragItemConfig.props.size.height
    }

    const parentRect = wrapper.value?.getBoundingClientRect()
    if (!parentRect || !gridLayout.value) return

    const mouseInGrid =
        mouseAt.x > parentRect.left &&
        mouseAt.x < parentRect.right &&
        mouseAt.y > parentRect.top &&
        mouseAt.y < parentRect.bottom

    if (mouseInGrid && !layout.value.find(item => item.i === dropId)) {
        layout.value.push({
            x: (layout.value.length * 2) % 12,
            y: layout.value.length + 12,
            w: dragItem.w,
            h: dragItem.h,
            i: dropId,
            id: '',
            type: dragItemConfig?.type || '',
            classify: dragItemConfig?.classify || '',
            minW: 2,
            minH: 2,
            dragAllowFrom: GRID_ITEM_DRAG_ALLOW_FROM,
            dragIgnoreFrom: GRID_ITEM_DRAG_IGNORE_FROM,
            resizeIgnoreFrom: 'a, button',
        })
    }

    const index = layout.value.findIndex(item => item.i === dropId)

    if (index !== -1) {
        const item = gridLayout.value.getItem(dropId)
        if (!item) return

        try {
            item.wrapper.style.display = 'none'
        } catch (e) { }

        Object.assign(item.state, {
            top: mouseAt.y - parentRect.top,
            left: mouseAt.x - parentRect.left
        })
        const newPos = item.calcXY(mouseAt.y - parentRect.top, mouseAt.x - parentRect.left)

        if (mouseInGrid) {
            gridLayout.value.dragEvent('dragstart', dropId, newPos.x, newPos.y, dragItem.h, dragItem.w)
            dragItem.i = String(index)
            dragItem.x = layout.value[index].x
            dragItem.y = layout.value[index].y
        } else {
            gridLayout.value.dragEvent('dragend', dropId, newPos.x, newPos.y, dragItem.h, dragItem.w)
            layout.value = layout.value.filter(item => item.i !== dropId)
        }
    }
}

// 拖拽结束
const dragend = (_e: DragEvent) => {
    const parentRect = wrapper.value?.getBoundingClientRect()
    if (!parentRect || !gridLayout.value) return

    const mouseInGrid =
        mouseAt.x > parentRect.left &&
        mouseAt.x < parentRect.right &&
        mouseAt.y > parentRect.top &&
        mouseAt.y < parentRect.bottom

    if (mouseInGrid && dragItemConfig) {
        gridLayout.value.dragEvent('dragend', dropId, dragItem.x, dragItem.y, dragItem.h, dragItem.w)
        // 注意：这里不再立即删除占位元素，而是等待用户确认新增后再删除
        // 保存配置和位置信息，等待用户输入名称
        pendingComponent = {
            config: dragItemConfig,
            x: dragItem.x,
            y: dragItem.y,
            w: dragItem.w,
            h: dragItem.h,
            dropId: dropId  // 保存 dropId 以便后续删除
        }

        // 打开名称输入弹窗
        nameForm.name = ''
        nameForm.datasource = ''
        nameForm.field = ''
        nameModalVisible.value = true
    } else {
        layout.value = layout.value.filter(item => item.i !== dropId)
    }

    dragItemConfig = null
}

// 确认添加组件
const confirmAddComponent = () => {
    if (!nameForm.name.trim()) {
        Message.warning('请输入组件名称')
        return
    }

    // 数据筛选需要额外验证
    if (pendingComponent?.config.type === 'CONDITION') {
        if (!nameForm.datasource) {
            Message.warning('请选择数据表')
            return
        }
        if (!nameForm.field) {
            Message.warning('请选择筛选字段')
            return
        }
    }

    if (!pendingComponent) return

    const { config, x, y, w, h } = pendingComponent

    // 添加新组件到布局
    componentCounter++

    const existingItems = layout.value.filter((item) => item.i !== pendingComponent?.dropId)
    const position = findAvailableGridPosition(existingItems, w, h, { x, y })

    const newItem: LayoutItem = {
        i: `component-${componentCounter}`,
        x: position.x,
        y: position.y,
        w,
        h,
        type: config.type,
        id: nanoid(10),
        classify: config.classify,
        icon: config.icon,
        color: config.type === 'INDICATOR' ? metricColors[(componentCounter - 1) % metricColors.length] : config.props.color,
        label: nameForm.name.trim(),
        name: nameForm.name,
        minW: config.type === 'TABLE' ? 6 : 2,
        minH: config.type === 'TABLE' ? 5 : 2,
        dragAllowFrom: GRID_ITEM_DRAG_ALLOW_FROM,
        dragIgnoreFrom: GRID_ITEM_DRAG_IGNORE_FROM,
        resizeIgnoreFrom: 'a, button',
        props: {
            ...config.props,
            size: { width: w, height: h },
            position: { x: position.x, y: position.y },
        },
    }
    if (pendingComponent?.config.type === 'CONDITION') {
        const datasource = datasourceOptions.value.find(d => d.tableName === nameForm.datasource)
        if (!datasource || !datasource.formId) {
            Message.warning('未找到对应的表单ID')
            return
        }
        newItem.props.formId = datasource.formId
        newItem.props.appId = nameForm.datasource
        newItem.props.filter = {}
        fieldOptions.value[nameForm.datasource].map(v => {
            if (v.id == nameForm.field) {
                newItem.props.filter = v
            }
        })
        // 初始化刷新键
        newItem.props.filterRefreshKey = Date.now()
    }
    layout.value.push(newItem)

    // 删除拖拽时的占位元素
    if (pendingComponent?.dropId) {
        layout.value = layout.value.filter(item => item.i !== pendingComponent.dropId)
    }

    // 初始化图表
    nextTick(() => {
        dragLoading.value = false
    })
    // Message.success(`已添加 ${nameForm.name}`)

    // 关闭弹窗并清理
    nameModalVisible.value = false

    pendingComponent = null
    nameForm.name = ''
    nameForm.datasource = ''
    nameForm.field = ''

    // 标记已初始化
    isInitialized.value = true

    // 触发保存接口
    handleSaveReport()


}


// 取消添加组件
const cancelAddComponent = () => {
    // 删除拖拽时的占位元素
    if (pendingComponent?.dropId) {
        layout.value = layout.value.filter(item => item.i !== pendingComponent.dropId)
    }

    nameModalVisible.value = false
    pendingComponent = null
    dragLoading.value = false
    nameForm.name = ''
    nameForm.datasource = ''
    nameForm.field = ''
}





// 从 cptOptions 中提取所有组件
const getAllComponents = () => {
    const components: any[] = []
    cptOptions.forEach(section => {
        section.children.forEach(item => {
            components.push(item)
        })
    })
    return components
}

// 获取组件名称
const getComponentName = (type: string) => {
    const allComponents = getAllComponents()
    const component = allComponents.find(c => c.type === type)
    return component?.name || '未知组件'
}

// 移除组件
const removeComponent = (id: string) => {
    Modal.confirm({
        title: "提示",
        simple: true,
        renderToBody: false,
        titleAlign: "start",
        content: '确定要删除该组件吗？',
        hideCancel: false,
        okText: "确认",
        onOk: () => {
            layout.value = layout.value.filter(item => item.i !== id)
            if (chartInstances.value[id]) {
                chartInstances.value[id].dispose()
                delete chartInstances.value[id]
            }

            Message.success('删除成功')
        }
    })
}

// 选中组件
const selectComponent = (id: string) => {
    selectedComponentId.value = id
}

const handleComponentClick = (id: string) => {
    selectComponent(id)
}

// 删除组件
const handleDeleteComponent = (id: string) => {
    removeComponent(String(id))
    selectedComponentId.value = null
}

// 点击外部取消选中
const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.grid-item-content')) {
        selectedComponentId.value = null
    }
}

// 编辑组件 - 根据类型跳转不同页面
const handleEditComponent = (id: string) => {
    const currentItem = layout.value.find(item => item.id === id)
    if (!currentItem) return
    if (currentItem.type === 'TABLE') {
        router.push({ path: '/report', query: { id: id, appId: route.query.id, from: route.query.from } })
    } else if (currentItem.type === 'CONDITION') {
        handleSelectConfig(currentItem.i)
    } else {
        router.push({ path: '/targets', query: { id: id, appId: route.query.id, type: currentItem.type, from: route.query.from } })
    }
}

// 打开重命名弹窗
const handleRenameComponent = (id: string) => {
    const currentItem = layout.value.find(item => item.i === id)
    if (!currentItem) return
    renamingComponentId.value = id
    renameForm.value.name = currentItem.label || getComponentName(currentItem.type)
    renameModalVisible.value = true
}

// 确认重命名
const confirmRename = () => {
    if (!renameForm.value.name || !renamingComponentId.value) return
    const currentItem = layout.value.find(item => item.i === renamingComponentId.value)
    if (currentItem) {
        currentItem.label = renameForm.value.name
        currentItem.name = renameForm.value.name
    }
    renameModalVisible.value = false
    renameForm.value.name = ''
    renamingComponentId.value = null
}

// 取消重命名
const cancelRename = () => {
    renameModalVisible.value = false
    renameForm.value.name = ''
    renamingComponentId.value = null
}

// 打开数据筛选配置弹窗
const handleSelectConfig = async (id: string) => {
    const currentItem = layout.value.find(item => item.i === id)
    if (!currentItem) return

    configuringSelectId.value = id
    const datasource = datasourceOptions.value.find(d => d.id === currentItem.props?.appId || d.tableName == currentItem.props?.appId)
    if (!datasource || !datasource.formId) {
        Message.warning('未找到对应的表单ID')
        return
    }
    // 回显已有数据
    selectConfigForm.datasource = datasource.tableName || currentItem.props?.appId || ''

    // 设置筛选字段回显
    const filter = currentItem.props?.filter || {}
    selectConfigForm.field = filter.column || filter.id || ''

    // 如果已有数据源，确保字段列表已加载
    if (selectConfigForm.datasource && !fieldOptions.value[selectConfigForm.datasource]) {
        await handleDatasourceChange(selectConfigForm.datasource)
    }

    selectConfigModalVisible.value = true
}

// 数据源变化时清空字段（用于筛选配置弹窗）
const handleSelectConfigDatasourceChange = () => {
    selectConfigForm.field = ''
}

// 确认数据筛选配置
const confirmSelectConfig = () => {
    if (!selectConfigForm.datasource) {
        Message.warning('请选择数据源')
        return
    }
    if (!selectConfigForm.field) {
        Message.warning('请选择筛选字段')
        return
    }

    const currentItem = layout.value.find(item => item.i === configuringSelectId.value)
    if (currentItem) {
        // 获取字段类型
        const fieldInfo = fieldOptions.value[selectConfigForm.datasource]?.find((f: any) => f.id === selectConfigForm.field)
        const datasource = datasourceOptions.value.find(d => d.tableName === selectConfigForm.datasource)
        console.log(datasource)
        if (!datasource || !datasource.formId) {
            Message.warning('未找到对应的表单ID')
            return
        }
        currentItem.props = {
            ...currentItem.props,
            appId: selectConfigForm.datasource,
            formId: datasource.formId,
            filter: {
                id: selectConfigForm.field,
                field: selectConfigForm.field,
                label: fieldInfo?.label || currentItem.label || '筛选字段',
                column: selectConfigForm.field,
                extra: fieldInfo.extra,
                props: fieldInfo.props,
                format: fieldInfo.props?.format,
                type: fieldInfo?.type || 'VARCHAR'
            },
            // 更新刷新键，强制重新渲染 select_cup 组件
            filterRefreshKey: Date.now()
        }
    }

    selectConfigModalVisible.value = false
    configuringSelectId.value = null
    Message.success('配置成功')
    persistReportToLocal()
}

// 取消数据筛选配置
const cancelSelectConfig = () => {
    selectConfigModalVisible.value = false
    configuringSelectId.value = null
    selectConfigForm.datasource = ''
    selectConfigForm.field = ''
}




const handleBottomSave = () => {
    showSaveModal.value = true
}

const handleSaveModalOk = async () => {
    saveLoading.value = true
    try {
        await handleSaveReport()
        showSaveModal.value = false
        Message.success('保存成功')
        router.push(getAppReturnRoute(route))
    } catch {
        // handleSaveReport 已处理错误提示
    } finally {
        saveLoading.value = false
    }
}

const handleSaveModalCancel = () => {
    showSaveModal.value = false
    goPublishApp()
}




// 预览报表（打开预览模态框）
const reportPreviewVisible = ref(false)
const openReportPreview = () => {
    if (!layout.value?.length) {
        Message.info('当前报表为空，无法预览')
        return
    }
    reportPreviewVisible.value = true

    // 模态框打开后延迟触发 resize，确保 echarts 容器已有尺寸并重新渲染图表
    nextTick(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
        }, 350)
    })
}

// 监听预览模态框打开，进一步确保图表正确渲染
watch(reportPreviewVisible, (visible) => {
    if (visible) {
        nextTick(() => {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'))
            }, 400)
        })
    }
})

const goPublishApp = async () => {
    publishLoading.value = true
    try {
        await handleSaveReport()
        router.push({
            path: '/publishApp',
            query: {
                id: route.query.id,
                type: route.query.type,
                ...(route.query.from ? { from: route.query.from } : {}),
            },
        })
    } catch {
        // 保存失败时不跳转
    } finally {
        publishLoading.value = false
    }
}

// 布局更新事件 - 拖拽或调整大小后触发
let layoutResizeRaf = 0
const onLayoutUpdated = (newLayout: LayoutItem[]) => {
    // 同步更新每个组件的 props.position 和 props.size
    newLayout.forEach(item => {
        if (item.props) {
            item.props.position = { x: item.x, y: item.y }
            item.props.size = { width: item.w, height: item.h }
        }
    })

    // 调整所有图表大小
    nextTick(() => {
        Object.values(chartInstances.value).forEach(chart => {
            chart.resize()
        })

        // 画布内图表组件（如 text_cup）自持有实例，不在 chartInstances 中；
        // 统一触发一次全局 resize，让子组件执行自身 resize。
        if (layoutResizeRaf) cancelAnimationFrame(layoutResizeRaf)
        layoutResizeRaf = requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'))
        })
    })

    if (!dragLoading.value) {
        persistReportToLocalDebounced()
    }
}


const { datasourceOptions, fieldOptions, handleSelectChange, loadDatasourceList, handleDatasourceChange } = useDesignerDatasource({ layout, tableRefs })
const { lastSaveLabel, persistReportToLocal, persistReportToLocalDebounced, handleSaveReport, handleRedo } = useDesignerPersistence({ route, layout, formConfig, canvasSize, reportMode, dragLoading })
</script>

<style scoped lang="scss">
@use '@/styles/report-designer.scss';
@use '@/styles/form-designer.scss';

.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>

<style lang="scss">
.save-confirm-modal {
    .arco-modal-body {
        padding: 32px 24px 24px;
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .modal-icon {
            margin-bottom: 16px;

            svg {
                filter: drop-shadow(0 4px 8px rgba(var(--primary-6), 0.2));
            }
        }

        .modal-text {
            font-size: 16px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.85);
            line-height: 1.5;
        }
    }

    .modal-footer {
        display: flex;
        justify-content: center;
        gap: 12px;
        padding-top: 8px;

        .btn-next,
        .btn-save {
            padding: 10px 28px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
        }

        .btn-next {
            background: #f5f5f5;
            border: 1px solid #e8e8e8;
            color: rgba(0, 0, 0, 0.65);

            &:hover {
                background: rgb(var(--primary-1));
                border-color: rgb(var(--primary-3));
                color: rgb(var(--primary-6));
            }
        }

        .btn-save {
            background: linear-gradient(135deg, rgb(var(--primary-6)) 0%, rgb(var(--primary-5)) 100%);
            border: none;
        }
    }
}
</style>

