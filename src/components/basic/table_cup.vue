<template>
    <div class="table" :class="{ 'table--hide-download': hideDownload }">

        <div ref="tableWrapRef" class="div" v-if="tableColumns.length > 0">
            <!-- 固定表头模式 -->
            <a-table row-key="id" v-if="option.fun?.fixedHeader" :data="tableData" :columns="displayTableColumns"
                :pagination="false" :scroll="fixedTableScroll"
                column-resizable
                :row-class="setRowClass" :header-row-class="setHeaderClass" :loading="tableLoading"
                :stripe="option.style?.stripe" :row-selection="rowSelection"
                :bordered="{ wrapper: true, cell: true }" @row-click="handleRowClick"
                @column-resize="handleColumnResize" @selection-change="handleSelectionChange">

            </a-table>

            <!-- 非固定表头模式 -->
            <div v-else
                :style="'height:' + (option.fun?.pageable ? 'calc(100% - 43px)' : '100%') + ';overflow-y:auto'">
                <a-table row-key="id" :data="tableData" :columns="displayTableColumns" :pagination="false"
                    :scroll="normalTableScroll" column-resizable
                    :row-class="setRowClass" :header-row-class="setHeaderClass" :loading="tableLoading"
                    :stripe="option.style?.stripe" :row-selection="rowSelection" :bordered="{ wrapper: true, cell: true }"
                    @row-click="handleRowClick" class="person-table" @column-resize="handleColumnResize"
                    @selection-change="handleSelectionChange">

                </a-table>
            </div>


            <!-- 分页 -->
            <PersonPagination v-if="option.fun?.pageable" :total="page.total" :current="page.pageNum"
                :page-size="page.pageSize" @change="handleCurrentChange" @page-size-change="handleSizeChange" />
        </div>
        <div class="div" v-else>
            <emptyBox desc="暂无表格数据，请前往数据源设置界面进行设置" />
        </div>
        <!-- 详情查看组件 -->
        <Details ref="detailsRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, h, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import Details from '@/components/basic/details.vue'
import PersonPagination from '@/views/user/components/PersonPagination.vue'
import { mergeReportCondition } from '@/utils/reportConditions'
import { queryReportData, exportReportData } from '@/api/designer/index'
import { blobDownload } from '@/utils/export'
import { getWarningColor } from '@/utils/warningCondition'
import { isFileFieldType, parseFileFieldValue } from '@/utils/fileFieldValue'
import { openFilePreview } from '@/utils/filePreview'
import { getReportDetailDisplayValue } from '@/utils/reportDetailValue'
import { useResizableTableColumns } from '@/composables/useResizableTableColumns'

interface Props {
    option: any
    reportId: any
    name: any
    type: any
    height: number
    id: number | string
    hideDownload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    option: () => ({}),
    reportId: '',
    name: '',
    type: '',
    height: 200,
    id: 0,
    hideDownload: false
})

// 响应式数据
const tableData = ref<any[]>([])
const tableColumns = ref<any[]>([])
const tableWrapRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const conditionRequest = ref<any[]>([])
const selectData = ref<any[]>([])
const page = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
})
const tableLoading = ref(false)

// 多选框配置
const rowSelection = computed(() => {
    if (!props.option.fun?.checkBox) return undefined
    return { type: 'checkbox' as const, showCheckedAll: true, width: 40 }
})

const {
    displayColumns: displayTableColumns,
    scrollX: tableScrollX,
    handleColumnResize,
    resetColumnWidths,
} = useResizableTableColumns({
    columns: tableColumns,
    containerRef: tableWrapRef,
    selectionEnabled: () => Boolean(props.option.fun?.checkBox),
    selectionColumnWidth: 40,
})

const fixedTableScroll = computed(() => ({
    x: tableScrollX.value,
    y: props.option.fun?.pageable ? 'calc(100% - 48px)' : '100%',
}))

const normalTableScroll = computed(() => ({ x: tableScrollX.value }))

// 详情查看组件引用
const detailsRef = ref()
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

// 构建表格列定义
const buildTableColumns = () => {
    const selectFields = props.option.data?.selectFields || []
    const globalAlign = props.option.style?.align
    const headerCfg = props.option.style?.meterHeader
    const contentCfg = props.option.style?.content
    const leftCfg = props.option.fun?.left
    const rightCfg = props.option.fun?.right

    // 过滤掉仅详情显示的字段（tag === true）
    const visibleFields = selectFields.filter((field: any) => !field.tag)
    const total = visibleFields.length

    const dataColumns = visibleFields.map((field: any, idx: number) => {
        const col: any = {
            ...overflowColumnProps,
            title: field.showLabel,
            dataIndex: field.column,
            width: field.width || 200,
            align: field.align ? field.align : globalAlign?.enable ? globalAlign.align : 'left',
            render: ({ record }: any) => {
                const fieldData = field.code ? record[field.code] : record[field.column]
                // 适配新数据格式：{ rawValue: '...', formatValue: '...' }
                let val = fieldData?.formatValue !== undefined ? fieldData.formatValue : fieldData

                // 处理选项字段映射
                if (field.column == 'instance_state' || field.column == 'input_source' || field.column == 'delete_state') {
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

        if (headerCfg?.enable && headerCfg.color) {
            col.headerCellStyle = { color: headerCfg.color }
        }

        if (contentCfg?.enable && contentCfg.color) {
            col.bodyCellStyle = { color: contentCfg.color }
        }

        if (leftCfg?.enable && idx < leftCfg.row) {
            col.fixed = 'left'
        }

        if (rightCfg?.enable && idx >= total - rightCfg.row) {
            col.fixed = 'right'
        }

        // 处理关联查询和子表单的分组表头
        if ((field.type === 'RELATION_DATA' || field.type === 'SUBFORM') && field.extra?.children && field.extra.children.length > 0) {
            col.children = field.extra.children.map((child: any) => {
                const childCol: any = {
                    ...overflowColumnProps,
                    title: child.title || child.label,
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



    // 添加序号列
    if (props.option.fun?.showNum) {
        const indexCol: any = {
            title: '序号',
            width: 65,
            align: 'center',
            render: ({ rowIndex }: any) => `${rowIndex + 1}`,
        }

        if (headerCfg?.enable && headerCfg.color) {
            indexCol.headerCellStyle = { color: headerCfg.color }
        }

        if (contentCfg?.enable && contentCfg.color) {
            indexCol.bodyCellStyle = { color: contentCfg.color }
        }

        if (leftCfg?.enable) {
            indexCol.fixed = 'left'
        }
        columns.push(indexCol)
    }

    columns.push(...dataColumns)
    console.log(columns)
    tableColumns.value = columns
}

// 格式化单元格值
const formatCellValue = (record: any, field: any) => {
    const columnName = field.column
    if (!record[columnName]) return ''

    // 特殊字段处理
    if (columnName === 'source') {
        return record[columnName].formatValue == 0 ? '填报' : '导入'
    }
    if (columnName === 'delete_status') {
        return record[columnName].formatValue == 0 ? '正常' : '已删除'
    }
    if (columnName === 'now_status') {
        return record[columnName].formatValue == 0 ? '已完成' : '运行中'
    }

    return record[columnName]?.formatValue || ''
}

// 设置行样式
const setRowClass = () => {
    if (props.option.style?.content?.enable) {
        return { color: props.option.style?.content?.color }
    }
    return {}
}

// 设置表头样式
const setHeaderClass = () => {
    if (props.option.style?.meterHeader?.enable) {
        return { color: props.option.style?.meterHeader?.color }
    }
    return {}
}

// 获取单元格预警样式
const getCellWarningStyle = (record: any, field: any) => {
    const rawVal = record[field.column]?.rawValue ?? record[field.column]?.formatValue ?? record[field.column]
    const color = getWarningColor(rawVal, field.warningPlans)
    return color ? { color } : {}
}

// 行点击事件 - 显示详情
const handleRowClick = (record: any) => {
    // 构建 topList：需要显示的字段列表
    const selectFields = props.option.data?.selectFields || []
    const topList = selectFields.map((field: any) => ({
        label: field.showLabel,
        column: field.column,
        type: field.type,
        extra: field.extra,
        nodeInfo: field.nodeInfo || false
    }))

    // 构建 datas：字段值映射
    const datas: any = {}
    selectFields.forEach((field: any) => {
        const val = field.code ? record[field.code] : record[field.column]
        datas[field.column] = {
            formatValue: getReportDetailDisplayValue(val)
        }
    })

    // 调用 Details 组件显示
    detailsRef.value?.showItem(topList, datas)
}

// 选择变化
const handleSelectionChange = (selectedRows: any[]) => {
    selectData.value = selectedRows
}

const handleCurrentChange = (pageNum: number) => {
    page.pageNum = pageNum
    getList()
}

// 每页数量变化
const handleSizeChange = (pageSize: number) => {
    page.pageSize = pageSize
    page.pageNum = 1
    getList()
}

// 下载 Excel
const download = async () => {
    // Message.success('下载中，请勿重复点击')
    loading.value = true

    try {
        // 构建筛选条件
        const conditions = JSON.parse(JSON.stringify(conditionRequest.value))

        // 如果有选中数据，只导出选中的数据
        if (selectData.value.length > 0) {
            const conditionFields = {
                column: 'id',
                id: 'id',
                field: 'id',
                type: 'INPUT',
                symbol: 'IN',
                value: []
            }
            selectData.value.forEach(v => {
                conditionFields.value.push(v.rawValue)
            })
            conditions.push(conditionFields)
        }

        const params = {
            conditions: conditions,
            componentId: props.id,
            componentType: props.type,
            reportId: props.reportId || '',
        }

        const res: any = await exportReportData(params)
        Message.success('请前往任务中心下载任务')
        // 使用 blobDownload 工具函数下载
        // blobDownload(res, `${props.name || '报表数据'}.xlsx`)
        loading.value = false
    } catch (error) {
        console.error('下载失败:', error)
        loading.value = false
    }
}

// 获取数据列表
let latestListRequestId = 0
const getList = async () => {
    const requestId = ++latestListRequestId
    const selectFields = props.option.data?.selectFields || []
    if (selectFields.length === 0) {
        tableData.value = []
        page.total = 0
        tableLoading.value = false
        return
    }
    // 构建请求配置
    const config = {
        data: {
            formId: props.option.data?.formId,
            selectFields: selectFields,
            conditionFields: props.option.data?.conditionFields || [],
        },
        fun: props.option.fun || {},
        style: props.option.style || {},
        fxFields: props.option.fxFields || [],
    }
    const params: any = {
        componentId: props.id,
        componentType: props.type,
        reportId: props.reportId || '',
        conditions: conditionRequest.value.length > 0 ? conditionRequest.value : [],
        componentConfig: JSON.stringify(config),
    }

    // 如果开启分页，添加分页参数
    if (props.option.fun?.pageable) {
        params.size = page.pageSize
        params.current = page.pageNum
    }

    tableLoading.value = true
    try {
        const res: any = await queryReportData(params)
        if (requestId !== latestListRequestId) return

        if (props.option.fun?.pageable) {
            page.total = res.total ?? 0
            tableData.value = res.records || []
        } else {
            page.total = res.total ?? 0
            tableData.value = res || []
        }
    } catch (error) {
        if (requestId !== latestListRequestId) return
        console.error('加载表格数据失败:', error)
        tableData.value = []
        page.total = 0
    } finally {
        if (requestId === latestListRequestId) {
            tableLoading.value = false
        }
    }
}

// 公开方法：更新筛选条件
const updateFilterCondition = (params: any) => {
    updateConditionFields(mergeReportCondition(
        conditionRequest.value,
        params,
        props.option.data?.selectFields || [],
    ))
}

const updateConditionFields = (conditions: any[]) => {

    conditionRequest.value = conditions
    // 重置页码并重新加载数据
    page.pageNum = 1
    getList()
}



// 生命周期
onMounted(() => {
    buildTableColumns()
    getList()
})

// 监听配置变化，重新构建列定义
watch(
    () => [props.option.style, props.option.fun],
    () => {
        buildTableColumns()
    },
    { deep: true }
)

watch(
    () => [
        props.reportId,
        props.id,
        props.type,
        props.option.data?.selectFields,
    ],
    () => {
        resetColumnWidths()
        buildTableColumns()
    },
    { deep: true }
)

// 暴露方法给父组件
defineExpose({
    getList,
    handleSelectionChange,
    updateConditionFields,
    updateFilterCondition,
    download
})
</script>

<style scoped lang="scss">
@use '@/styles/table_noborder.scss' as table;

.table {
    overflow-y: hidden;
    height: 100%;

    // 固定列需要不透明底色，避免横向滚动的普通列透出；斑马纹仍由 Arco 的伪元素绘制。
    :deep(.arco-table-td.arco-table-col-fixed-left),
    :deep(.arco-table-td.arco-table-col-fixed-right) {
        background-color: var(--color-bg-2, #fff);
    }

    :deep(.arco-table-border .arco-table-container) {
        border-top: 1px solid var(--color-neutral-3);
        border-left: 1px solid var(--color-neutral-3);
    }

    :deep(.arco-table-border-cell .arco-table-th),
    :deep(.arco-table-border-cell .arco-table-td:not(.arco-table-tr-expand)) {
        border-right: 1px solid var(--color-neutral-3) !important;
    }

    :deep(.arco-table-border-cell .arco-table-th-resizing),
    :deep(.arco-table-border-cell .arco-table-td-resizing:not(.arco-table-tr-expand)) {
        border-right-color: rgb(var(--primary-6)) !important;
    }

    :deep(.arco-table-border .arco-table-body .arco-table-tr:last-of-type .arco-table-td) {
        border-bottom: 1px solid var(--color-neutral-3) !important;
    }

    &--hide-download {
        height: 100%;

        .div {
            height: 100%;
        }
    }

    .title {
        font-size: 20px;
        color: #191919;
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .dowload {
            position: relative;
            z-index: 1999;
        }
    }

    .div {
        // overflow-y: auto;
        position: relative;
        height: 100%;
        z-index: 1999;
    }

    .span {
        cursor: pointer;
        color: #165DFF;

        &:hover {
            text-decoration: underline;
        }
    }
}

::v-deep {
    .item+.item {
        border-top: 1px solid #EBEEF5;
    }

    .item {
        height: 32px;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;

        img {
            height: 32px;
        }
    }
}



.table-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;

    .table-empty-icon {
        font-size: 40px;
        margin-bottom: 12px;
        opacity: 0.6;
    }

    .table-empty-text {
        font-size: 14px;
        color: #86909C;
        margin: 0 0 4px;
    }

    .table-empty-hint {
        font-size: 12px;
        color: #C9CDD4;
        margin: 0;
    }
}
</style>
