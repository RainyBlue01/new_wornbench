// 进阶组件：NUMBER、MONEY
export default [
{
                component: 'qInputNumber',
                title: "数字",
                type: "NUMBER",
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
                    //数字精度
                    precision: 0,
                    // 是否清空
                    allowClear: true,
                    // 字数统计
                    showWordLimit: false,
                    // 占位符
                    placeholder: '数字',
                    // 最大长度
                    maxLength: 15,
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
                        min: 0,
                        max: 15,
                    },
                    {
                        field: 'precision',
                        label: '数字精度',
                        type: 'number',
                        min: 0,
                        max: 5,
                    },
                    {
                        field: 'defaultValue',
                        label: '默认值',
                        component: 'a-input-number',
                        type: 'defaultValue',
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
                component: 'qInputNumber',
                title: "金额",
                type: "MONEY",
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
                    //数字精度
                    precision: 0,
                    // 显示
                    visible: true,
                    // 是否清空
                    allowClear: true,
                    // 字数统计
                    showWordLimit: false,
                    // 占位符
                    placeholder: '金额',
                    // 最大长度
                    maxLength: 15,
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
                        min: 0,
                        max: 15,
                    },
                    {
                        field: 'precision',
                        label: '数字精度',
                        type: 'number',
                        min: 0,
                        max: 5,
                    },
                    {
                        field: 'defaultValue',
                        label: '默认值',
                        component: 'qInputNumber',
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
