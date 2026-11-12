<template>
    <div class="report-preview">
        <div class="report-designer-canvas-paper" :style="{ width: `${canvasSize}%` }">
        <div class="report-designer-canvas-inner">
            <GridLayout
                :layout="layout"
                :col-num="12"
                :row-height="100"
                :is-draggable="false"
                :is-resizable="false"
                :margin="[16, 16]"
                :vertical-compact="true"
                :use-css-transforms="false"
            >
                <template #item="{ item: gridItem }">
                    <div class="report-designer-widget report-designer-widget--preview grid-item-content">
                        <div class="report-designer-widget-header">
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
                        </div>

                        <div class="report-designer-widget-body component-body">
                            <template v-if="(gridItem as any).type === 'TABLE'">
                                <table_cup
                                    :key="(gridItem as any).i"
                                    :type="(gridItem as any).type"
                                    :ref="(el: any) => setTableRef(el, (gridItem as any).i)"
                                    :option="(gridItem as any).props"
                                    :name="(gridItem as any).name"
                                    :report-id="reportId"
                                    :height="(gridItem as any).h * 100"
                                    :id="(gridItem as any).id"
                                    hide-download
                                />
                            </template>

                            <template
                                v-if="(gridItem as any).classify === 'INDICATOR' || (gridItem as any).classify === 'CHART'"
                            >
                                <text_cup
                                    :option="(gridItem as any).props"
                                    :name="(gridItem as any).name"
                                    :type="(gridItem as any).type"
                                    :height="(gridItem as any).h * 100"
                                    :report-id="reportId"
                                    :cpt-x="0"
                                    :cpt-y="0"
                                    :id="(gridItem as any).id"
                                />
                            </template>

                            <template v-if="(gridItem as any).type === 'CONDITION'">
                                <select_cup
                                    :key="(gridItem as any).props?.filterRefreshKey"
                                    :option="(gridItem as any).props"
                                    :dept-list="deptList"
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
        </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GridLayout } from 'grid-layout-plus'
import table_cup from '@/components/basic/table_cup.vue'
import text_cup from '@/components/basic/text_cup.vue'
import select_cup from '@/components/basic/select_cup.vue'
import { cptOptions } from '@/data/designer.js'
import { findReportFilterTables } from '@/utils/reportFilterTargets'

const props = withDefaults(defineProps<{
    layout: any[]
    reportId: string | number
    deptList: any[]
    canvasSize?: number
}>(), {
    canvasSize: 100,
})

const tableRefs = ref<any>({})

const getAllComponents = () => {
    const components: any[] = []
    cptOptions.forEach((section: any) => {
        section.children.forEach((item: any) => {
            components.push(item)
        })
    })
    return components
}

const getComponentName = (type: string) => {
    const component = getAllComponents().find((c) => c.type === type)
    return component?.name || '未知组件'
}

const setTableRef = (el: any, componentId: string) => {
    if (el) {
        tableRefs.value[componentId] = el
    } else {
        delete tableRefs.value[componentId]
    }
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

const handleSelectChange = (params: any, _moduleConfigId: any, id: any) => {
    findReportFilterTables(props.layout || [], id).forEach(tableComp => {
        tableRefs.value[String(tableComp.i)]?.updateFilterCondition(params)
    })
}
</script>

<style lang="scss" scoped>
@use '@/styles/report-designer.scss';
</style>
