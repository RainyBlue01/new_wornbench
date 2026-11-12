// 进阶组件：DATE、DATE_INTERVAL、TIME、TIME_INTERVAL
export default [
{
                component: 'qDatePicker',
                title: "日期",
                type: "DATE",
                props: {
                    //标题
                    label: "",
                    // 'mini | small | medium(默认) | large'
                    size: 'medium',
                    //描述
                    desc: "",
                    //是否显示时间
                    "show-time": true,
                    // 字段名
                    field: '',
                    //是否必填
                    required: true,
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
                    //样式
                    style: 'width:100%',
                    // 日期格式
                    format: 'YYYY-MM-DD HH:mm:ss',
                    //值的格式
                    "value-format": 'YYYY-MM-DD HH:mm:ss',
                    // 是否清空
                    allowClear: true,
                    // 字数统计
                    showWordLimit: false,
                    // 占位符
                    placeholder: '请输入',
                    // 最大长度
                    maxLength: 1,
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
                        field: 'format',
                        label: '时间格式',
                        options: [
                            { label: '年', value: 'YYYY' },
                            { label: '月-日', value: 'MM-DD' },
                            { label: '年-月', value: 'YYYY-MM' },
                            { label: '年-月-日', value: 'YYYY-MM-DD' },
                            { label: '年-月-日 时:分', value: 'YYYY-MM-DD HH:mm' },
                            { label: '年-月-日 时:分:秒', value: 'YYYY-MM-DD HH:mm:ss' },
                            { label: '月.日', value: 'MM.DD' },
                            { label: '年.月', value: 'YYYY.MM' },
                            { label: '年.月.日', value: 'YYYY.MM.DD' },
                            { label: '年.月.日 时:分', value: 'YYYY.MM.DD HH:mm' },
                            { label: '年.月.日 时:分:秒', value: 'YYYY.MM.DD HH:mm:ss' },
                        ],
                        type: 'select',
                    },
                    {
                        field: 'required',
                        label: '必填验证',
                        type: 'switch',
                    },
                    {
                        field: 'placeholder',
                        label: '提示',
                        type: 'input',
                    },

                    {
                        field: 'defaultValue',
                        label: '默认值',
                        component: 'atDatePicker',
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
            },
{
                component: 'qRangePicker',
                title: "日期范围",
                type: "DATE_INTERVAL",
                props: {
                    //标题
                    label: "",
                    // 'mini | small | medium(默认) | large'
                    size: 'medium',
                    //描述
                    desc: "",
                    //是否显示时间
                    "show-time": true,
                    // 字段名
                    field: '',
                    //是否必填
                    required: true,
                    // 默认值
                    defaultValue: {
                        "start": "",
                        "end": ""
                    },
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
                    format: 'YYYY-MM-DD HH:mm:ss',
                    //值的格式
                    "value-format": 'YYYY-MM-DD HH:mm:ss',
                    // 是否清空
                    allowClear: true,
                    // 字数统计
                    showWordLimit: false,
                    // 占位符
                    placeholder: ['开始日期', '结束日期'],
                    // 最大长度
                    maxLength: 1,
                    //绑定值
                    value: {
                        "start": "",
                        "end": ""
                    },
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
                        field: 'format',
                        label: '时间格式',
                        options: [
                            { label: '年', value: 'YYYY' },
                            { label: '月-日', value: 'MM-DD' },
                            { label: '年-月', value: 'YYYY-MM' },
                            { label: '年-月-日', value: 'YYYY-MM-DD' },
                            { label: '年-月-日 时:分', value: 'YYYY-MM-DD HH:mm' },
                            { label: '年-月-日 时:分:秒', value: 'YYYY-MM-DD HH:mm:ss' },
                            { label: '月.日', value: 'MM.DD' },
                            { label: '年.月', value: 'YYYY.MM' },
                            { label: '年.月.日', value: 'YYYY.MM.DD' },
                            { label: '年.月.日 时:分', value: 'YYYY.MM.DD HH:mm' },
                            { label: '年.月.日 时:分:秒', value: 'YYYY.MM.DD HH:mm:ss' },
                        ],
                        type: 'select',
                    },
                    {
                        field: 'defaultValue',
                        label: '默认值',
                        component: 'aTrangePicker',
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
                component: 'qTimePicker',
                title: "时间",
                type: "TIME",
                props: {
                    //标题
                    label: "",
                    // 'mini | small | medium(默认) | large'
                    size: 'medium',
                    //描述
                    desc: "",
                    //是否显示时间
                    "show-time": true,
                    // 字段名
                    field: '',
                    //是否必填
                    required: true,
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
                        field: 'format',
                        label: '时间格式',
                        options: [
                            { label: '时:分:秒', value: 'HH:mm:ss' },
                            { label: '时:分', value: 'HH:mm' },
                            { label: '分:秒', value: 'mm:ss' },
                            { label: '时', value: 'HH' },
                            { label: '分', value: 'mm' },
                            { label: '秒', value: 'ss' },
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
                        component: 'aTTimePicker',
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
            },
{
                component: 'qTimePicker',
                title: "时间范围",
                type: "TIME_INTERVAL",
                props: {
                    //标题
                    label: "",
                    // 'mini | small | medium(默认) | large'
                    size: 'medium',
                    //类型
                    type: "time-range",
                    //描述
                    desc: "",
                    //是否显示时间
                    "show-time": true,
                    // 字段名
                    field: '',
                    //是否必填
                    required: true,
                    // 默认值
                    defaultValue: {
                    },
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
                    // 默认值
                    value: {
                        "start": "",
                        "end": ""
                    },
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
                        field: 'format',
                        label: '时间格式',
                        options: [
                            { label: '时:分:秒', value: 'HH:mm:ss' },
                            { label: '时:分', value: 'HH:mm' },
                            { label: '分:秒', value: 'mm:ss' },
                            { label: '时', value: 'HH' },
                            { label: '分', value: 'mm' },
                            { label: '秒', value: 'ss' },
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
                        component: 'aTTimePicker',
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
            }
]
