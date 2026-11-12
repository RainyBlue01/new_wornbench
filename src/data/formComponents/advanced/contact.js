// 进阶组件：PHONE、ID_CARD、EMAIL
export default [
{
                component: 'qInput',
                title: "电话",
                type: "PHONE",
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
                    // 字数统计
                    showWordLimit: false,
                    // 占位符
                    placeholder: '电话',
                    // 最大长度
                    maxLength: 20,
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
                        field: 'placeholder',
                        label: '提示',
                        type: 'input',
                    },
                    {
                        field: 'showWordLimit',
                        label: '字数限制',
                        type: 'numSwitch',
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
                component: 'qInput',
                title: "身份证号码",
                type: "ID_CARD",
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
                    // 字数统计
                    showWordLimit: false,
                    // 占位符
                    placeholder: '身份证号码',
                    // 最大长度
                    maxLength: 20,
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
                        field: 'placeholder',
                        label: '提示',
                        type: 'input',
                    },
                    {
                        field: 'showWordLimit',
                        label: '字数限制',
                        type: 'numSwitch',
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
                component: 'qInput',
                title: "邮箱",
                type: "EMAIL",
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
                    // 字数统计
                    showWordLimit: false,
                    // 占位符
                    placeholder: '邮箱',
                    // 最大长度
                    maxLength: 20,
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
                        field: 'placeholder',
                        label: '提示',
                        type: 'input',
                    },
                    {
                        field: 'showWordLimit',
                        label: '字数限制',
                        type: 'numSwitch',
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
            }
]
