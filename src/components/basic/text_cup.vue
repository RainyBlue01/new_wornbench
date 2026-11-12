<template>
    <div class="table" ref="tableContainer">
    
        <div class="div" >
            <!-- 数据为空时的空状态 -->
            <div v-if="dataEmpty " class="empty-state-wrapper">
                <emptyBox embedded :desc="emptyText" />
            </div>

            <div class="indicator-container"
              v-if="reportConfig.type === 'INDICATOR' && displayFields.length > 0 && groupFields.length === 0 && !dataEmpty">
              <div class="indicator-value" :style="{ color: indicatorDisplayColor, fontSize: indicatorFontSize }">
                {{ indicatorValue }}{{ unit }}
              </div>
            </div>

            <!-- 指标卡（带维度明细） -->
            <div class="table-target"
              v-if="reportConfig.type === 'INDICATOR' && displayFields.length > 0 && groupFields.length === 1 && !dataEmpty">
              <div class="table-header">
                <div class="header-cell">{{ groupFields[0].showLabel || groupFields[0].label }}</div>
                <div class="header-cell">{{ displayFields[0].showLabel || displayFields[0].label }}</div>
              </div>
              <div class="table-body">
                <div class="table-row" v-for="(row, indexTable) in indicatorTableData" :key="indexTable">
                  <div class="table-cell">{{ row[groupFields[0].id] }}</div>
                  <div class="table-cell">
                    {{ getIndicatorValue(row) }}{{ unit }}
                  </div>
                </div>
              </div>
            </div>


            <div class="echart" v-if="reportConfig.type !== 'INDICATOR' && tableData !== '' && !dataEmpty">
                <div :id="chartDomId"></div>
            </div>
        </div>

    </div>
</template>
    
<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import echarts from '@/utils/echarts'
import field from '@/utils/field'
import { getDataForm } from '../../data/data_form'
import { queryReportData } from '@/api/designer/index'
import { getWarningColor } from '@/utils/warningCondition'
import emptyBox from '@/components/emptyBox/emptyBox.vue'

interface Props {
    option: any
    height: number
    name: any
    type:any
    cptX: number
    cptY: number
    id: number | string
    reportId?: string
    /** 图表 DOM 后缀，用于预览等场景避免与画布实例 id 冲突 */
    chartKey?: string
}

const props = withDefaults(defineProps<Props>(), {
    option: () => ({}),
    height: 200,
    name:'',
    type:'',
    cptX: 200,
    cptY: 200,
    id: 0,
    chartKey: '',
})

const chartDomId = computed(() => `echart-line${props.id}${props.chartKey}`)

const tableContainer = ref<HTMLElement | null>(null)
const tableData = ref<any>('')
const dataLoaded = ref(false)
const dataEmpty = ref(false)


// 指标相关数据
const indicatorValue = ref('0')
const indicatorRawValue = ref<any>('0')
const unit = ref('')
const indicatorTableData = ref<any[]>([])
const indicatorFontSize = ref('80px')

// 根据容器宽度计算字体大小
const calculateIndicatorFontSize = () => {
  if (tableContainer.value) {
    const container = tableContainer.value.querySelector('.indicator-container') as HTMLElement
    if (container) {
      const width = container.offsetWidth
      const height = container.offsetHeight
      const fontSize = Math.min(width / 2, height / 1.5, 200)
      indicatorFontSize.value = `${Math.max(fontSize, 80)}px`
    }
  }
}

// 监听窗口大小变化
const handleIndicatorResize = () => {
  calculateIndicatorFontSize()
}

// 从 option 中提取配置
const reportConfig = computed(() => ({
    type: props.type || 'INDICATOR'
}))

const displayFields = computed(() => props.option.data?.selectFields || [])
const groupFields = computed(() => props.option.data?.groupFields || [])

const emptyText = computed(() => {
    const chartTypeMap: Record<string, string> = {
        INDICATOR: '指标',
        BAR: '柱状图',
        FOLD_LINE: '折线图',
        COLUMN: '柱状图',
        PIE: '饼图',
        RADAR: '雷达图',
        FUNNEL: '漏斗图',
        GAUGE: '仪表盘',
    }
    const typeLabel = chartTypeMap[props.type] || '图表'
    return `暂无${typeLabel}数据，请前往数据源设置界面进行设置`
})

let chartInstance: echarts.ECharts | null = null
const handleResize = () => {
    chartInstance?.resize()
}

// 计算指标显示颜色
const indicatorDisplayColor = computed(() => {
    const first = displayFields.value?.[0]
    const defaultColor = '#409EFF'
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

const initLineChart = (data: any) => {
    const el = document.getElementById(chartDomId.value)
    if (!el) return

    if (chartInstance) chartInstance.dispose()
    chartInstance = echarts.init(el)

    let option: any = {}

    const baseTooltip = {
        confine: true,
        appendToBody: true,
        extraCssText: 'max-width: 360px; white-space: normal;',
    }

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

        const seriesOrName = params?.seriesName || params?.name
        const fieldConfig = getFieldConfig(seriesOrName)
        const label =
            (displayFields.value || []).length === 1 ? displayFields.value?.[0]?.showLabel : params?.seriesName || params?.name
        return buildLine(params.color, label, params.value, fieldConfig)
    }

    const unitText = displayFields.value?.[0]?.format?.number?.unit || ''
    const grid = { left: 12, right: 12, top: 40, bottom: 12, containLabel: true }
    const legend = {
        top: 8,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { fontSize: 12, color: '#4E5969' },
    }

    if (props.type === 'BAR') {
        option = {
            tooltip: { ...baseTooltip, trigger: 'axis', formatter: tooltipFormatter },
            grid,
            legend,
            xAxis: { type: 'value', axisLabel: { formatter: '{value} ' + unitText } },
            yAxis: {
                type: 'category',
                data: data.column,
                axisLabel: {
                    formatter: function (value: string) {
                        if (value.length > 8) return `${value.slice(0, 8)}...`
                        return value
                    },
                },
            },
            series: (data.dataList || []).map((item: any) => ({
                type: 'bar',
                name: item.name,
                data: (item.data || []).map((d: any) => d?.rawValue ?? d),
                barMaxWidth: 32,
                itemStyle: { borderRadius: [4, 4, 0, 0] },
            })),
        }
    } else if (props.type === 'FOLD_LINE' || props.type === 'COLUMN') {
        const series = (data.dataList || []).map((v: any) => {
            const a: any[] = []
            ;(v.data || []).forEach((v1: any) => {
                if (v1 && typeof v1 === 'object' && 'rawValue' in v1) {
                    a.push({ value: v1.rawValue, itemStyle: { color: v1.color } })
                } else {
                    a.push({ value: v1, itemStyle: { color: v1?.color } })
                }
            })
            const isLine = props.type === 'FOLD_LINE'
            return {
                name: v.name,
                type: isLine ? 'line' : 'bar',
                data: a,
                smooth: isLine,
                symbol: isLine ? 'circle' : 'none',
                symbolSize: isLine ? 6 : 0,
                lineStyle: isLine ? { width: 2 } : undefined,
                areaStyle: isLine ? { opacity: 0.08 } : undefined,
                barMaxWidth: isLine ? undefined : 32,
                itemStyle: !isLine ? { borderRadius: [4, 4, 0, 0] } : undefined,
            }
        })

        option = {
            tooltip: { ...baseTooltip, trigger: 'axis', formatter: tooltipFormatter },
            grid,
            legend,
            xAxis: {
                type: 'category',
                data: data.column,
                axisTick: { alignWithLabel: true },
                axisLabel: {
                    formatter: function (value: string) {
                        if (value.length > 8) return `${value.slice(0, 8)}...`
                        return value
                    },
                },
            },
            yAxis: { type: 'value', axisLabel: { formatter: '{value} ' + unitText } },
            series,
        }
    } else if (props.type === 'PIE') {
        option = {
            tooltip: { ...baseTooltip, trigger: 'item', formatter: tooltipFormatter },
            legend: { ...legend, top: 8 },
            series: [
                {
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
                    emphasis: { scale: true, scaleSize: 8 },
                },
            ],
        }
    } else if (props.type === 'RADAR') {
        const radarIndicator =
            Array.isArray(data?.column) && data.column.length > 0
                ? data.column.map((name: string) => ({ name }))
                : (data?.dataList?.[0]?.data || []).map((d: any) => ({ name: d?.name }))

        option = {
            tooltip: { ...baseTooltip, trigger: 'item', formatter: tooltipFormatter },
            legend: { ...legend, top: 8 },
            radar: {
                indicator: radarIndicator,
                radius: '62%',
                center: ['50%', '58%'],
                shape: 'polygon',
                axisName: { color: '#4E5969', fontSize: 12 },
                splitLine: { lineStyle: { color: ['#E5E6EB'] } },
                splitArea: { areaStyle: { color: ['rgba(255,255,255,0)', 'rgba(244,246,248,0.6)'] } },
                axisLine: { lineStyle: { color: '#E5E6EB' } },
            },
            series: (data.dataList || []).map((item: any) => ({
                type: 'radar',
                name: item.name,
                data: [
                    {
                        value: (item?.data || []).map((d: any) => {
                            if (d && typeof d === 'object') {
                                if ('rawValue' in d) return (d as any).rawValue ?? 0
                                if ('value' in d) return (d as any).value?.rawValue ?? (d as any).value ?? 0
                            }
                            return d ?? 0
                        }),
                    },
                ],
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2 },
                areaStyle: { opacity: 0.08 },
            })),
        }
    } else if (props.type === 'FUNNEL') {
        option = {
            tooltip: { ...baseTooltip, trigger: 'item', formatter: tooltipFormatter },
            legend: { ...legend, top: 8 },
            series: [
                {
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
                    })),
                },
            ],
        }
    } else if (props.type === 'GAUGE') {
        const gaugeData = data?.dataList?.[0]?.data
        const gaugeRawValue =
            gaugeData && typeof gaugeData === 'object'
                ? gaugeData.rawValue ?? gaugeData.value?.rawValue ?? gaugeData.value
                : gaugeData
        const gaugeFormatValue = gaugeData && typeof gaugeData === 'object' ? gaugeData.formatValue ?? '' : ''
        const gaugeName = displayFields.value?.[0]?.showLabel || ''
        option = {
            tooltip: { ...baseTooltip, trigger: 'item', formatter: tooltipFormatter },
            series: [
                {
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
                        formatter: (v: any) => `${gaugeFormatValue || v}${unitText}`,
                    },
                    data: [
                        {
                            value: gaugeRawValue ?? 0,
                            name: gaugeName,
                        },
                    ],
                },
            ],
        }
    } else {
        // 默认兜底：当后端返回不匹配时不渲染图表
        option = {}
    }

    chartInstance.setOption(option)
    nextTick(() => {
        chartInstance?.resize()
    })
}

const getList = async () => {
    tableData.value = ''
    const tableItem = props.option
    
    if (tableItem.data && tableItem.data.formId && props.option.data?.selectFields?.length > 0) {
        // 构建请求配置
        const config = {
            data: {
                formId: tableItem.data.formId,
                groupFields: tableItem.data.groupFields || [],
                selectFields: tableItem.data.selectFields || [],
                conditionFields: tableItem.data.conditionFields || [],
            },
            style: tableItem.style || {},
            type: tableItem.type,
            fxFields: tableItem.fxFields || [],
        }

        const params = {
            componentId: props.id,
                 componentType: props.type,
            reportId: props.reportId || '',
            componentConfig: JSON.stringify(config),
        }

        try {
            const res: any = await queryReportData(params)
            if (props.type === 'INDICATOR') {
                const firstField = props.option.data.selectFields[0]
                const resultKey = `${firstField.function.toLowerCase()}(${firstField.id})`

                if (props.option.data.groupFields.length === 0) {
                    // 无维度：单个指标值
                    const resultData = res?.[0]?.[resultKey]
                    if (resultData && typeof resultData === 'object' && 'formatValue' in resultData) {
                        indicatorValue.value = resultData.formatValue?.toString() || '0'
                        indicatorRawValue.value = resultData.rawValue ?? resultData.formatValue ?? '0'
                    } else {
                        indicatorValue.value = resultData?.toString() || '0'
                        indicatorRawValue.value = resultData ?? '0'
                    }
                    unit.value = firstField?.format?.number?.unit || ''
                    indicatorTableData.value = []
                    // 无数据判断：响应为空数组或 undefined
                    dataEmpty.value = !res || (Array.isArray(res) && res.length === 0)
                } else if (props.option.data.groupFields.length === 1) {
                    // 有一个维度：表格形式
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
                    unit.value = firstField?.format?.number?.unit || ''
                    indicatorValue.value = '0'
                    dataEmpty.value = rows.length === 0
                }
                dataLoaded.value = true
            } else {
                // 图表类型
                tableData.value = res
                // 无数据判断：响应中无有效图表数据
                const hasChartData = res?.dataList?.some((item: any) =>
                    Array.isArray(item.data) && item.data.length > 0
                ) || res?.column?.length > 0
                dataEmpty.value = !hasChartData
                dataLoaded.value = true
                if (!dataEmpty.value) {
                    setTimeout(() => {
                        initLineChart(res)
                    }, 200)
                }
            }
        } catch (error) {
            console.error('加载数据失败:', error)
            dataLoaded.value = true
            dataEmpty.value = true
        }
    }else{
        dataEmpty.value = true
    }
}

onMounted(() => {
    getList()
    window.addEventListener('resize', handleResize)
    
    // 初始化并监听指标卡片尺寸变化
    nextTick(() => {
      calculateIndicatorFontSize()
      window.addEventListener('resize', handleIndicatorResize)
    })
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('resize', handleIndicatorResize)
    if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
    }
})
</script>
    
<style lang="scss" scoped>
.table {
    height: 100% ;
    .title {
        font-size: 20px;
        color: #191919;
        margin-bottom: 16px;
        line-height: 32px;
    }

    .div {
        position: relative;
        z-index: 1999;
        height:100%;
    }

    .pagination {
        margin-top: 10px;
        text-align: right;
    }

    .table-num {
        display: flex;
        overflow: auto;
        align-items: center;
    }

    .num {
        text-align: center;
        font-size: 90px;
        font-weight: 700;
    }
}

.indicator-container {
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    // padding: 20px;
    height: 100%;
    text-align: center;
    overflow: hidden;

    .indicator-value {
        font-weight: 700;
        line-height: 1.2;
        transition: font-size 0.2s ease;
    }
}

.table-target {
    background-color: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;

    .table-header {
        display: flex;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;

        .header-cell {
            flex: 1;
            padding: 12px 16px;
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            text-align: left;
            white-space: nowrap;
        }
    }

    .table-body {
        .table-row {
            display: flex;
            border-bottom: 1px solid #f1f5f9;
            transition: background-color 0.2s;

            &:last-child {
                border-bottom: none;
            }

            &:hover {
                background: #f8fafc;
            }

            .table-cell {
                flex: 1;
                padding: 12px 16px;
                font-size: 13px;
                color: #334155;
                text-align: left;
                word-break: break-word;
            }
        }
    }
}

.echart {
    background-color: #fff;
    width: 100%;
    height: 100%;

    div {
        width: 100%;
        height: 100%;
    }
}

.empty-state-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 8px;
}


</style>
    