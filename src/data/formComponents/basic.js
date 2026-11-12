// 基础组件的默认值与属性面板定义。
export default {
        title: '基础组件',
        list: [
            {
                component: 'qInput',
                title: "单行文本",
                type: "INPUT",
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
                    placeholder: '单行文本',
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
                attribute: [{
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
                    max: 100,
                },
                {
                    field: 'defaultValue',
                    label: '默认值',
                    component: 'a-input',
                    type: 'defaultValue',
                },
                {
                    field: 'method',
                    label: '插入函数',
                    type: 'method',
                },
                {
                    field: 'props.linkage',
                    label: '数据联动',
                    type: 'linkage',
                }
                ],
                method: {
                    input: "const item = provideState.getPropsItem(props.comDes.id, 'defaultValue');console.log(item)",
                }
            },
            {
                defaultValue: "",
                component: 'qTextarea',
                title: "多行文本",
                type: "TEXTAREA",
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
                    // 是否清空
                    allowClear: true,
                    // 字数统计
                    showWordLimit: false,
                    // 占位符
                    placeholder: '多行文本',
                    // 最大长度
                    maxLength: 100,
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
                        max: 1000,
                    },
                    {
                        field: 'defaultValue',
                        label: '默认值',
                        component: 'a-textarea',
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
                defaultValue: "",
                component: 'qRadio',
                title: "单选框组",
                type: "RADIO",
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
                    //类型
                    type: 'radio',
                    // 默认值
                    defaultValue: '',
                    //类型
                    pic: false,
                    // 禁用
                    disabled: false,
                    //方向
                    direction: 'horizontal',
                    //选项
                    options: [],
                    // 只读
                    readonly: false,
                    // 显示
                    visible: true,
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
                        field: 'defaultValue',
                        label: '默认值',
                        type: 'defaultValues',
                    },
                    {
                        field: 'pic',
                        label: '类型',
                        type: 'radio',
                        options: [{ label: '文字', value: false }, { label: '图片', value: true }]
                    },
                    {
                        field: 'options',
                        label: '选项',
                        type: 'options',
                    },
                    {
                        field: 'direction',
                        label: '排列方式',
                        type: 'radio',
                        options: [{ label: '横向', value: 'horizontal' }, { label: '竖向', value: 'vertical' }]
                    },
                ],
                method: {
                    input: "",
                }
            },
            {
                defaultValue: "",
                component: 'qCheckbox',
                title: "多选框组",
                type: "CHECKBOX",
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
                    //类型
                    type: 'radio',
                    // 默认值
                    defaultValue: [],
                    //类型
                    pic: false,
                    // 禁用
                    disabled: false,
                    //方向
                    direction: 'horizontal',
                    //选项
                    options: [],
                    // 只读
                    readonly: false,
                    // 显示
                    visible: true,
                    value: []
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
                        field: 'defaultValue',
                        label: '默认值',
                        type: 'defaultValues',
                    },
                    {
                        field: 'pic',
                        label: '类型',
                        type: 'radio',
                        options: [{ label: '文字', value: false }, { label: '图片', value: true }]
                    },
                    {
                        field: 'options',
                        label: '选项',
                        type: 'options',
                    },
                    {
                        field: 'direction',
                        label: '排列方式',
                        type: 'radio',
                        options: [{ label: '横向', value: 'horizontal' }, { label: '竖向', value: 'vertical' }]
                    },
                ],
                method: {
                    input: "",
                }
            },
            {
                component: 'qSwitch',
                title: "开关",
                type: "SWITCH",
                props: {
                    //标题
                    label: "",
                    // 'mini | small | medium(默认) | large'
                    size: 'medium',
                    //描述
                    desc: "",
                    //开关的值
                    'checked-value': true,
                    'unchecked-value': false,
                    // 字段名
                    field: '',
                    //是否必填
                    required: false,
                    // 默认值
                    defaultValue: 0,
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
                    placeholder: '请输入',
                    // 最大长度
                    maxLength: 20,
                    value: 0,
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
                        field: 'defaultValue',
                        label: '默认值',
                        component: 'a-switch',
                        type: 'component',
                    },
                    {
                        field: 'on',
                        label: '打开状态的文字',
                        type: 'input',
                    },
                    {
                        field: 'off',
                        label: '关闭状态的文字',
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
                defaultValue: "",
                component: 'qSelect',
                title: "下拉选择",
                type: "SELECT",
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
                    //数据源
                    dataSourceType: 1,
                    // 禁用
                    disabled: false,
                    //数据源表单
                    sourceFormCode: '',
                    //数据源应用
                    sourceAppId: '',
                    //数据源表单字段
                    sourceFieldCode: '',
                    //排序字段
                    sortField: 'create_time',
                    //排序方式 asc/desc
                    sortOrder: 'desc',
                    //过滤逻辑 and/or
                    conditionType: 'and',
                    //过滤条件
                    conditionList: [],
                    //关联表字段元数据
                    sourceFieldList: [],
                    //选项
                    options: [],
                    placeholder: '下拉选择',
                    // 只读
                    readonly: false,
                    // 显示
                    visible: true,
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
                        field: 'placeholder',
                        label: '提示',
                        type: 'input',
                    },
                    {
                        field: 'required',
                        label: '必填验证',
                        type: 'switch',
                    },

                    {
                        field: 'dataSourceType',
                        label: '数据源',
                        type: 'select',
                        options: [{ label: '自定义', value: 1 }, { label: '其他表单数据', value: 2 }],
                        multiple: false,
                    },
                    {
                        field: 'defaultValue',
                        label: '默认值',
                        type: 'defaultValues',
                    },
                ],
                method: {
                    input: "",
                }
            },
            {
                defaultValue: "",
                component: 'qSelect',
                title: "多选下拉选择",
                type: "SELECT_MULTIPLE",
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
                    placeholder: '多选下拉选择',
                    // 默认值
                    defaultValue: [],
                    //数据源
                    dataSourceType: 1,
                    // 禁用
                    disabled: false,
                    //数据源表单
                    sourceFormCode: '',
                    //数据源应用
                    sourceAppId: '',
                    //多选
                    multiple: true,
                    //数据源表单字段
                    sourceFieldCode: '',
                    //排序字段
                    sortField: 'create_time',
                    //排序方式 asc/desc
                    sortOrder: 'desc',
                    //过滤逻辑 and/or
                    conditionType: 'and',
                    //过滤条件
                    conditionList: [],
                    //关联表字段元数据
                    sourceFieldList: [],
                    //选项
                    options: [],
                    // 只读
                    readonly: false,
                    // 显示
                    visible: true,
                    value: [],
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
                        field: 'placeholder',
                        label: '提示',
                        type: 'input',
                    },
                    {
                        field: 'required',
                        label: '必填验证',
                        type: 'switch',
                    },

                    {
                        field: 'dataSourceType',
                        label: '数据源',
                        type: 'select',
                        options: [{ label: '自定义', value: 1 }, { label: '其他表单数据', value: 2 }],
                        multiple: false,
                    },
                    {
                        field: 'defaultValue',
                        label: '默认值',
                        component: 'a-select',
                        type: 'component',
                    },
                ],
                method: {
                    input: "",
                }
            },
            {
                defaultValue: "",
                component: 'qUpload',
                title: "附件",
                type: "ATTACH",
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
                    // 示例文件
                    exampleFiles: [],
                    //值
                    value: [],
                    //文件类型
                    attachment_type: 'picture',
                    //文件大小
                    size: 2,
                    //单位
                    sizeUnit: 'MB',
                    //最大上传数
                    limit: 10,
                    // 禁用
                    disabled: false,
                    // 只读
                    readonly: false,
                    // 显示
                    visible: true,
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
                        field: 'attachment_type',
                        label: '文件类型',
                        type: 'select',
                        options: [
                            { label: '图片', value: 'picture' },
                            { label: '视频', value: 'video' },
                            { label: '音频', value: 'audio' },
                            { label: '文档', value: 'doc' },
                            { label: '压缩包', value: 'zip' },
                        ]
                    },
                    {
                        field: 'exampleFiles',
                        label: '示例文件',
                        component: 'aTUpload',
                        type: 'component',
                    },
                    {
                        field: 'size',
                        label: '文件总大小',
                        type: 'input',
                    },
                    {
                        field: 'required',
                        label: '必填验证',
                        type: 'switch',
                    },
                    {
                        field: 'limit',
                        label: '最大上传数',
                        type: 'number',
                    },
                ],
                method: {
                    input: "",
                }
            },
            {
                defaultValue: "",
                component: 'qUpload',
                title: "图片",
                type: "PICTURE",
                props: {
                    //标题
                    label: "",
                    //是否拍照
                    takePhoto: false,
                    //图片模式
                    accept: '.gif, .jpg, .jpeg, .png, .GIF, .JPG, .PNG',
                    //照片模式
                    "list-type": "picture-card",
                    // 'mini | small | medium(默认) | large'
                    size: 'medium',
                    //描述
                    desc: "",
                    // 字段名
                    field: '',
                    //是否必填
                    required: true,
                    // 示例文件
                    exampleFiles: [],
                    //值
                    value: [],
                    //文件类型
                    attachment_type: 'picture',
                    //文件大小
                    size: 2,
                    //单位
                    sizeUnit: 'MB',
                    //最大上传数
                    limit: 10,
                    // 禁用
                    disabled: false,
                    // 只读
                    readonly: false,
                    // 显示
                    visible: true,
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
                        field: 'exampleFiles',
                        label: '示例文件',
                        component: 'aTUpload',
                        type: 'component',
                    },
                    {
                        field: 'size',
                        label: '文件总大小',
                        type: 'input',
                    },
                    {
                        field: 'required',
                        label: '必填验证',
                        type: 'switch',
                    },
                    {
                        field: 'takePhoto',
                        label: '是否只允许拍照上传',
                        type: 'switch',
                    },
                    {
                        field: 'limit',
                        label: '最大上传数',
                        type: 'number',
                    },
                ],
                method: {
                    input: "",
                }
            },
            {
                defaultValue: "",
                component: 'qEditors',
                title: "编辑器",
                type: "EDITORS",
                props: {
                    //标题
                    label: "",
                    //描述
                    desc: "编辑器",
                    // 字段名
                    field: '',
                    //文件类型
                    foldContext: '编辑器',
                },
                attribute: [
                    {
                        field: 'type',
                        label: '组件类型',
                        type: 'type',
                    },
                    {
                        field: 'desc',
                        label: '描述',
                        type: 'wangEditor',
                    },
                    {
                        field: 'fold',
                        label: '是否折叠',
                        type: 'fold',
                    },
                ],
                method: {
                    input: "",
                }
            },
        ]
    }
