import {
    IconApps,
    IconBarChart,
    IconFilter,
    IconComputer,
    IconDashboard,
} from '@arco-design/web-vue/es/icon'
import { ChartLine, ChartHistogramOne, ChartPie, RadarChart, Dashboard } from '@icon-park/vue-next'

const IconLineChart = ChartLine
const IconPieChart = ChartPie
const IconRadarChart = RadarChart
const IconIndicatorCard = Dashboard
const IconBarChartAlt = ChartHistogramOne

export const cptOptions = [
    {
        name: '基础报表', icon: '', opened: true,
        children: [
            {
                name: '数据表',
                "@class": "com.joyou.wornbench.report.impl.model.basic.TableReport",
                icon: IconApps,
                classify: 'TABLE',
                type: 'TABLE',
                props: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 6,
                        height: 5
                    },
                    data: {
                        formId: "",
                        selectFields: [
                        ],
                        conditionFields: [
                        ]
                    },
                    fun: {
                        checkBox: false,
                        showNum: false,
                        pageable: false,
                        download: false,
                        fixedHeader: false,
                        right: {
                            enable: false,
                            row: null
                        },
                        left: {
                            enable: false,
                            row: null
                        }
                    },
                    style: {
                        theme: {
                            enable: false,
                            color: '#366F36'
                        },
                        meterHeader: {
                            enable: false,
                            color: '#366F36'
                        },
                        content: {
                            enable: false,
                            color: '#366F36'
                        },
                        align: {
                            enable: false,
                            color: "left"
                        },
                        stripe: false
                    },
                    fxFields: [
                    ]
                }
            },
            {
                name: '数据筛选',
                "@class": "com.joyou.wornbench.report.impl.model.basic.ConditionReport",
                icon: IconFilter,
                classify: 'OTHER',
                type: 'CONDITION',
                props: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 2
                    },
                    formId: "",
                    filter: {
                        id: '',
                        label: '',
                        column: '',
                        type: '',
                    }
                }
            },
            {
                name: '指标卡片',
                icon: IconIndicatorCard,
                "@class": "com.joyou.wornbench.report.impl.model.basic.IndicatorReport",
                classify: 'INDICATOR',
                type: 'INDICATOR',
                props: {
                    color: '#165DFF',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 3,
                        height: 2
                    },
                    data: {
                        tableName: "",
                        selectFields: [
                        ],
                        conditionFields: [
                        ],
                        groupFields: [

                        ]
                    },
                    style: {
                        color: {
                            enable: false,
                            color: '#409EFF'
                        },
                        fontStyle: {
                            enable: false,
                            color: '#409EFF'
                        },
                    },
                    fxFields: [
                    ]
                }
            }
        ]
    },
    {
        name: '分析报表', icon: '', opened: true,
        children: [
            {
                name: '折线图',
                "@class": "com.joyou.wornbench.report.impl.model.chart.FoldLineReport",
                icon: IconLineChart,
                classify: 'CHART',
                type: 'FOLD_LINE',
                props: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 4
                    },
                    data: {
                        tableName: "",
                        selectFields: [
                        ],
                        conditionFields: [
                        ],
                        groupFields: [

                        ]
                    },
                    style: {
                        color: {
                            enable: false,
                            color: '#409EFF'
                        },
                        fontStyle: {
                            enable: false,
                            color: '#409EFF'
                        },
                    },
                    fxFields: [
                    ]
                }
            },
            {
                name: '柱状图',
                icon: IconBarChart,
                "@class": "com.joyou.wornbench.report.impl.model.chart.ColumnReport",
                classify: 'CHART',
                type: 'COLUMN',
                props: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 4
                    },
                    data: {
                        tableName: "",
                        selectFields: [
                        ],
                        conditionFields: [
                        ],
                        groupFields: [

                        ]
                    },
                    style: {
                        color: {
                            enable: false,
                            color: '#409EFF'
                        },
                        fontStyle: {
                            enable: false,
                            color: '#409EFF'
                        },
                    },
                    fxFields: [
                    ]
                }
            },
            {
                name: '条形图',
                "@class": "com.joyou.wornbench.report.impl.model.chart.BarReport",
                icon: IconBarChartAlt,
                classify: 'CHART',
                type: 'BAR',
                props: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 4
                    },
                    data: {
                        tableName: "",
                        selectFields: [
                        ],
                        conditionFields: [
                        ],
                        groupFields: [

                        ]
                    },
                    style: {
                        color: {
                            enable: false,
                            color: '#409EFF'
                        },
                        fontStyle: {
                            enable: false,
                            color: '#409EFF'
                        },
                    },
                    fxFields: [
                    ]
                }
            },
            {
                name: '雷达图',
                icon: IconRadarChart,
                "@class": "com.joyou.wornbench.report.impl.model.chart.RadarReport",
                classify: 'CHART',
                type: 'RADAR',
                props: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 4
                    },
                    data: {
                        tableName: "",
                        selectFields: [
                        ],
                        conditionFields: [
                        ],
                        groupFields: [

                        ]
                    },
                    style: {
                        color: {
                            enable: false,
                            color: '#409EFF'
                        },
                        fontStyle: {
                            enable: false,
                            color: '#409EFF'
                        },
                    },
                    fxFields: [
                    ]
                }
            },
            {
                name: '漏斗图',
                "@class": "com.joyou.wornbench.report.impl.model.chart.FunnelReport",
                icon: IconFilter,
                classify: 'CHART',
                type: 'FUNNEL',
                props: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 4
                    },
                    data: {
                        tableName: "",
                        selectFields: [
                        ],
                        conditionFields: [
                        ],
                        groupFields: [

                        ]
                    },
                    style: {
                        color: {
                            enable: false,
                            color: '#409EFF'
                        },
                        fontStyle: {
                            enable: false,
                            color: '#409EFF'
                        },
                    },
                    fxFields: [
                    ]
                }
            },
            {
                name: '仪表盘',
                icon: IconDashboard,
                classify: 'CHART',
                "@class": "com.joyou.wornbench.report.impl.model.chart.GaugeReport",
                type: 'GAUGE',
                props: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 4
                    },
                    data: {
                        tableName: "",
                        selectFields: [
                        ],
                        conditionFields: [
                        ],
                        groupFields: [

                        ]
                    },
                    style: {
                        color: {
                            enable: false,
                            color: '#409EFF'
                        },
                        fontStyle: {
                            enable: false,
                            color: '#409EFF'
                        },
                    },
                    fxFields: [
                    ]
                }
            },
            {
                name: '饼图',
                icon: IconPieChart,
                "@class": "com.joyou.wornbench.report.impl.model.chart.PieReport",
                classify: 'CHART',
                type: 'PIE',
                props: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 4
                    },
                    data: {
                        tableName: "",
                        selectFields: [
                        ],
                        conditionFields: [
                        ],
                        groupFields: [

                        ]
                    },
                    style: {
                        color: {
                            enable: false,
                            color: '#409EFF'
                        },
                        fontStyle: {
                            enable: false,
                            color: '#409EFF'
                        },
                    },
                    fxFields: [
                    ]
                }
            }
        ]
    }
]

export const metricColors = ['#165DFF', '#00B42A', '#F7BA1E', '#F53F3F', '#722ED1', '#14C9C9']

// 组件类型到 @class 的映射关系（用于保存报表配置时添加后端所需的类名标识）
export const componentClassMap = {
    'TABLE': 'com.joyou.wornbench.report.impl.model.basic.TableReport',
    'CONDITION': 'com.joyou.wornbench.report.impl.model.basic.ConditionReport',
    'INDICATOR': 'com.joyou.wornbench.report.impl.model.basic.IndicatorReport',
    'FOLD_LINE': 'com.joyou.wornbench.report.impl.model.chart.FoldLineReport',
    'COLUMN': 'com.joyou.wornbench.report.impl.model.chart.ColumnReport',
    'BAR': 'com.joyou.wornbench.report.impl.model.chart.BarReport',
    'RADAR': 'com.joyou.wornbench.report.impl.model.chart.RadarReport',
    'FUNNEL': 'com.joyou.wornbench.report.impl.model.chart.FunnelReport',
    'GAUGE': 'com.joyou.wornbench.report.impl.model.chart.GaugeReport',
    'PIE': 'com.joyou.wornbench.report.impl.model.chart.PieReport'
}

/**
 * 为报表布局数据添加 @class 属性
 * @param {Array} layout - 报表布局数组
 * @returns {Array} 添加了 @class 属性的布局数组
 */
export function addClassToLayout(layout) {
    if (!Array.isArray(layout)) {
        return layout || []
    }

    return layout.map((item) => {
        const className = componentClassMap[item.type]
        if (className) {
            return {
                ...item,
                '@class': className
            }
        }
        return item
    })
}
