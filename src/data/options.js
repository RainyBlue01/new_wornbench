
const cptOptions = [
    {
        name: '基础报表', icon: '', opened: true,
        children: [
            {
                name: '数据表'
                option: {
                    classify: 'TABLE',
                    type: 'TABLE',
                    name: '数据表',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
                    },
                    data: {
                        tableName: "",
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
                            color: '#409EFF'
                        },
                        meterHeader: {
                            enable: false,
                            color: '#409EFF'
                        },
                        content: {
                            enable: false,
                            color: '#409EFF'
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
                name: '数据筛选', icon: 'icon_shaixuan', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
                option: {
                    classify: 'OTHER',
                    type: 'CONDITION',
                    name: '数据筛选',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
                    },
                    moduleConfigId: "",
                    filter: {
                        id: '',
                        label: '',
                        column: '',
                        type: '',
                    }
                }
            },
            {
                name: '指标数据', icon: 'icon_zhibiao', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
                option: {
                    classify: 'INDICATOR',
                    type: 'INDICATOR',
                    name: '指标数据',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
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
                name: '折线图', icon: 'chart-line', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
                option: {
                    classify: 'CHART',
                    type: 'FOLD_LINE',
                    name: '折线图',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
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
            }, {
                name: '柱状图', icon: 'icon_zhuzhuangtu', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
                option: {
                    classify: 'CHART',
                    type: 'COLUMN',
                    name: '柱状图',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
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
            }, {
                name: '条形图', icon: 'chart-histogram-one', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
                option: {
                    classify: 'CHART',
                    type: 'BAR',
                    name: '条形图',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
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
            //  {
            //     name: '散点图', icon: 'border', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
            //     option: {
            //         classify: 'CHART',
            //         type: 'SCATTER_POINT',
            //         name: '散点图',
            //         position: {
            //             x: 0,
            //             y: 0
            //         },
            //         size: {
            //             width: 400,
            //             height: 300
            //         },
            //         data: {
            //             tableName: "",
            //             selectFields: [
            //             ],
            //             conditionFields: [
            //             ],
            //             groupFields: [

            //             ]
            //         },
            //         style: {
            //             color: {
            //                 enable: false,
            //                 color: '#409EFF'
            //             },
            //             fontStyle: {
            //                 enable: false,
            //                 color: '#409EFF'
            //             },
            //         },
            //         fxFields: [
            //         ]
            //     }
            // }, 
            {
                name: '雷达图', icon: 'icon_leidatu', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
                option: {
                    classify: 'CHART',
                    type: 'RADAR',
                    name: '雷达图',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
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
            }, {
                name: '漏斗图', icon: 'icon_loudoutu', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
                option: {
                    classify: 'CHART',
                    type: 'FUNNEL',
                    name: '漏斗图',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
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
            },{
                name: '仪表盘', icon: 'icon_yibiaopan', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
                option: {
                    classify: 'CHART',
                    type: 'GAUGE',
                    name: '仪表盘',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
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
            }, {
                name: '饼图', icon: 'icon_bingtu', cptKey: '', cptOptionKey: 'cpt-dataV-border-option',
                option: {
                    classify: 'CHART',
                    type: 'PIE',
                    name: '饼图',
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 4,
                        height: 3
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
export default cptOptions
