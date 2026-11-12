// 进阶组件：ADDRESS、URL、RATE
export default [
{
                component: 'qAreaSelect',
                title: "地址",
                type: "ADDRESS",
                props: {
                    //标题
                    label: "",
                    // 'mini | small | medium(默认) | large'
                    size: 'medium',
                    //描述
                    desc: "",
                    //是否显示时间
                    option: 'prov-city-dist',
                    // 字段名
                    field: '',
                    //是否必填
                    required: true,
                    //options
                    // 默认值
                    defaultValue: {
                        "prov": "",
                        "city": "",
                        "dist": "",
                        "det": ""
                    },
                    prov: '',
                    "city": "",
                    "dist": "",
                    District: [],
                    cityList: [],
                    // 表达式标签
                    expressionLabel: '',
                    // 标签
                    label: '',
                    // 禁用
                    disabled: false,
                    // 只读
                    readonly: false,
                    // 显示
                    visible: true,
                    //样式
                    style: 'width:100%',
                    // 日期格式
                    format: 'HH:mm:ss',
                    //值的格式
                    "value-format": 'HH:mm:ss',
                    // 是否清空
                    allowClear: true,
                    // 字数统计
                    showWordLimit: false,
                    // 占位符
                    placeholder: "时间",
                    // 最大长度
                    maxLength: 1,
                    value: {
                        "prov": "",
                        "city": "",
                        "dist": "",
                        "det": ""
                    }
                },
                attribute: [
                    {
                        field: 'type',
                        label: '组件类型',
                        type: 'type',
                    },
                    {
                        field: 'title',
                        label: '标题',
                        type: 'input',
                    },
                    {
                        field: 'desc',
                        label: '描述',
                        type: 'wangEditor',
                    },
                    {
                        field: 'option',
                        label: '地区精度',
                        options: [
                            { label: '省/市/区县/详细地址', value: 'prov-city-dist-det' },
                            { label: '省/市/区县', value: 'prov-city-dist' },
                            { label: '省/市', value: 'prov-city' },
                        ],
                        type: 'select',
                    },
                    {
                        field: 'required',
                        label: '必填验证',
                        type: 'switch',
                    },
                    {
                        field: 'defaultValue',
                        label: '默认值',
                        component: 'atAreaSelect',
                        type: 'component',
                    },
                    // {
                    //     field: 'props.linkage',
                    //     label: '数据联动',
                    //     type: 'linkage',
                    // }
                ],
                method: {
                    input: "",
                }
            },
{
                component: 'qInput',
                title: "URL",
                type: "URL",
                props: {
                    //标题
                    label: "",
                    // 'mini | small | medium(默认) | large'
                    size: 'medium',
                    //描述
                    desc: "",
                    // 字段名
                    field: '',
                    //是否必填
                    required: true,
                    // 是否显示 URL 预览入口
                    previewEnabled: false,
                    // URL 预览按钮文案
                    previewText: '预览',
                    // 默认值
                    defaultValue: '',
                    // 表达式标签
                    expressionLabel: '',
                    // 标签
                    label: '',
                    // 禁用
                    disabled: false,
                    // 只读
                    readonly: false,
                    // 显示
                    visible: true,
                    // 隐藏
                    // 是否清空
                    allowClear: true,
                    // 占位符
                    placeholder: 'URL',
                    linkage: {
                        enable: false,
                        logicConditions: [],
                        mode: 'and',
                        sourceFormCode: '',
                        relationTrigger: {
                            fieldCode: '',
                            sourceFieldCode: '',
                        }
                    }
                },
                attribute: [
                    {
                        field: 'type',
                        label: '组件类型',
                        type: 'type',
                    },
                    {
                        field: 'title',
                        label: '标题',
                        type: 'input',
                    },
                    {
                        field: 'desc',
                        label: '描述',
                        type: 'wangEditor',
                    },
                    {
                        field: 'required',
                        label: '必填验证',
                        type: 'switch',
                    },
                    {
                        field: 'previewEnabled',
                        label: '开启预览',
                        type: 'switch',
                    },
                    {
                        field: 'previewText',
                        label: '预览按钮文案',
                        type: 'input',
                        hideLabel: true,
                        showWhen: {
                            field: 'previewEnabled',
                            value: true,
                        },
                    },
                    {
                        field: 'placeholder',
                        label: '提示',
                        type: 'input',
                    },
                    {
                        field: 'defaultValue',
                        label: '默认值',
                        type: 'input',
                    },
                    {
                        field: 'props.linkage',
                        label: '数据联动',
                        type: 'linkage',
                    }
                ],
                method: {
                    input: "",
                }
            },
{
                component: 'qRate',
                title: "评分",
                type: "RATE",
                props: {
                    //标题
                    label: "",
                    // 'mini | small | medium(默认) | large'
                    size: 'medium',
                    //描述
                    desc: "",
                    //半选
                    "allow-half": false,
                    // 字段名
                    field: '',
                    //是否必填
                    required: true,
                    // 默认值
                    defaultValue: '',
                    // 允许小数
                    isDecimal: false,
                    //数字精度
                    precision: 0,
                    // 标签
                    label: '',
                    //最大值
                    max: 100,
                    //最小值
                    min: 1,
                    // 禁用
                    disabled: false,
                    // 只读
                    readonly: false,
                    // 显示
                    visible: true,
                    // 是否清空
                    allowClear: true,
                    //options
                    options: ['糟糕', '不好', '一般', '好', '优秀'],
                    // 占位符
                    placeholder: '评分',
                },
                attribute: [
                    {
                        field: 'type',
                        label: '组件类型',
                        type: 'type',
                    },
                    {
                        field: 'title',
                        label: '标题',
                        type: 'input',
                    },
                    {
                        field: 'desc',
                        label: '描述',
                        type: 'wangEditor',
                    },
                    {
                        field: 'allow-half',
                        label: '半选',
                        type: 'switch',
                    },
                    {
                        field: 'required',
                        label: '必填验证',
                        type: 'switch',
                    },
                    {
                        field: 'options',
                        label: '分级名称',
                        type: 'Rate',
                    },
                    {
                        field: 'defaultValue',
                        label: '默认值',
                        component: 'qRate',
                        type: 'component',
                    },
                    {
                        field: 'props.linkage',
                        label: '数据联动',
                        type: 'linkage',
                    }
                ],
                method: {
                    input: "",
                }
            }
]
