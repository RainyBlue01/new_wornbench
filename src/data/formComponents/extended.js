// 高级组件的默认值与属性面板定义。
export default {
        title: '高级组件',
        list: [
            // {
            //     title: "业务组件",
            //     component: 'qJsonSchema',
            //     type: "JSON_SCHEMA",
            //     props: {
            //         label: "",
            //         desc: "",
            //         field: '',
            //         required: false,
            //         businessPreset: 'booking',
            //         __businessPresetApplied: 'booking',
            //         defaultValue: {},
            //         value: {},
            //         disabled: false,
            //         readonly: false,
            //         visible: true,
            //         schema: {
            //             type: 'object',
            //             title: '预约组件',
            //             description: '基于 JSON Schema 描述预约业务组件的数据结构和提交值',
            //             required: ['bookingItemId', 'bookingDate', 'contactName', 'contactPhone'],
            //             properties: {
            //                 bookingItemId: {
            //                     type: 'string',
            //                     title: '预约项目',
            //                 },
            //                 bookingItemName: {
            //                     type: 'string',
            //                     title: '预约项目名称',
            //                 },
            //                 bookingDate: {
            //                     type: 'string',
            //                     title: '预约日期',
            //                     format: 'date',
            //                 },
            //                 bookingSlot: {
            //                     type: 'string',
            //                     title: '预约时段',
            //                 },
            //                 contactName: {
            //                     type: 'string',
            //                     title: '联系人',
            //                     maxLength: 20,
            //                 },
            //                 contactPhone: {
            //                     type: 'string',
            //                     title: '联系电话',
            //                     pattern: '^1[3-9]\\d{9}$',
            //                 },
            //                 remark: {
            //                     type: 'string',
            //                     title: '备注',
            //                     format: 'textarea',
            //                     maxLength: 200,
            //                 },
            //             },
            //         },
            //         uiSchema: {
            //             renderer: 'booking',
            //             contactName: {
            //                 placeholder: '请输入联系人',
            //                 component: 'input',
            //             },
            //             contactPhone: {
            //                 placeholder: '请输入联系电话',
            //                 component: 'input',
            //             },
            //             remark: {
            //                 placeholder: '请输入备注说明',
            //                 component: 'textarea',
            //             },
            //         },
            //         validationConfig: {
            //             enableJsonSchema: true,
            //             validateOnChange: true,
            //             validateOnSubmit: true,
            //             requiredMessage: '请完善预约信息',
            //             customRules: [],
            //         },
            //         logicConfig: {
            //             rules: [],
            //         },
            //         requestConfig: {
            //             enable: false,
            //             method: 'post',
            //             url: '',
            //             triggerEvents: ['manual'],
            //             watchFields: [],
            //             showManualButton: false,
            //             buttonText: '请求后台',
            //             params: {},
            //             headers: {},
            //             body: {},
            //             responsePath: '',
            //             outputMappings: [],
            //             successMessage: '',
            //             errorMessage: '请求失败，请检查后台配置',
            //         },
            //         businessFunctionConfig: {
            //             enable: false,
            //             functions: [],
            //             bookingConfig: {
            //                 scopeType: 'future',
            //                 scopeDays: 7,
            //                 fixedDate: '',
            //                 advanceDays: 0,
            //                 items: [
            //                     {
            //                         id: 'booking_item_1',
            //                         name: '预约项目1',
            //                         desc: '可步行预约（可多选）',
            //                         img: '',
            //                         bookingType: 'time',
            //                         maxPerSlot: 10,
            //                         timeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00'],
            //                     },
            //                     {
            //                         id: 'booking_item_2',
            //                         name: '预约项目2',
            //                         desc: '默认预约项目示例',
            //                         img: '',
            //                         bookingType: 'time',
            //                         maxPerSlot: 10,
            //                         timeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00'],
            //                     },
            //                 ],
            //             },
            //         },
            //         containerConfig: {
            //             type: 'inline',
            //             title: '预约表单',
            //             width: 720,
            //             triggerMode: 'button',
            //             triggerText: '打开表单',
            //             openEvents: ['manual'],
            //             closeOnSubmit: true,
            //             destroyOnClose: false,
            //         },
            //         moduleConfig: {
            //             mode: 'single',
            //             modules: [],
            //         },
            //         dataBridgeConfig: {
            //             bridges: [],
            //         },
            //         linkage: {
            //             enable: false,
            //             logicConditions: [],
            //             mode: 'and',
            //             sourceFormCode: '',
            //             relationTrigger: {
            //                 fieldCode: '',
            //                 sourceFieldCode: '',
            //             }
            //         }
            //     },
            //     attribute: [
            //         {
            //             field: 'type',
            //             label: '组件类型',
            //             type: 'type',
            //         },
            //         // {
            //         //     field: 'title',
            //         //     label: '标题',
            //         //     type: 'input',
            //         // },
            //         // {
            //         //     field: 'desc',
            //         //     label: '描述',
            //         //     type: 'wangEditor',
            //         // },
            //         // {
            //         //     field: 'required',
            //         //     label: '必填校验',
            //         //     type: 'switch',
            //         // },
            //         {
            //             field: 'businessPreset',
            //             label: '业务预设',
            //             type: 'select',
            //             options: [
            //                 { label: '预约组件', value: 'booking' },
            //                 { label: '请假组件', value: 'leave' },
            //                 { label: '自定义', value: 'custom' },
            //             ],
            //             multiple: false,
            //         },
            //         {
            //             field: 'jsonSchemaConfig',
            //             label: '业务组件配置',
            //             component: 'qJsonSchemaConfigEditor',
            //             type: 'component',
            //         },
            //         // {
            //         //     field: 'props.linkage',
            //         //     label: '数据联动',
            //         //     type: 'linkage',
            //         // },
            //     ],
            //     children: [
            //     ]
            // },
            {
                id: '',
                title: "签名",
                component: 'qSignature',
                type: "SIGNATURE",
                props: {
                    desc: "",
                    required: true,
                    defaultValue: '',
                    value: '',
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
                ],
                children: [
                ]
            },
            {
                id: '',
                title: "子表单",
                component: 'qSubform',
                type: "SUBFORM",
                props: {
                    desc: "",
                    freezingColumn: 'first',
                    addRow: false,
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
                        field: 'freezingColumn',
                        label: '排列方式',
                        type: 'select',
                        options: [
                            { label: '横向', value: 'first' },
                            { label: '竖向', value: 'last' }
                        ]
                    },
                    {
                        field: 'addRow',
                        label: '列编辑',
                        type: 'switch',
                    },
                ],
                children: [
                ]
            },
            {
                id: '',
                title: "关联数据",
                component: 'qRelationData',
                type: "RELATION_DATA",
                props: {
                    //描述
                    desc: "",
                    //查询表
                    formId: '',
                    value: '',
                    //查询字段
                    fieldList: [],
                    //数据勾选
                    selectType: 'single',
                    //关联查询
                    conditionType: 'and',
                    conditionList: [],
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
                        field: 'formId',
                        label: '查询表',
                        type: 'formCode',
                    },
                    {
                        field: 'selectType',
                        label: '数据勾选',
                        type: 'select',
                        options: [
                            { label: '单条', value: 'single' },
                            { label: '多条', value: 'multiple' },
                        ]
                    },
                    {
                        field: 'addCondition',
                        label: '关联查询',
                        title: '关联条件配置',
                        type: 'addCondition'
                    },
                ]
            },
            {
                id: '',
                title: "关联查询",
                component: 'qRelationQuery',
                type: "RELATION_QUERY",
                props: {
                    //描述
                    desc: "",
                    //查询表
                    formId: '',
                    //查询字段
                    fieldList: [],
                    //查询结果显示
                    selectType: 'single',
                    //条件查询
                    conditionType: 'and',
                    conditionList: [],
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
                        field: 'formId',
                        label: '查询表',
                        type: 'formCode',
                    },
                    {
                        field: 'selectType',
                        label: '查询结果显示',
                        type: 'select',
                        options: [
                            { label: '单条', value: 'single' },
                            { label: '多条', value: 'multiple' },
                        ]
                    },

                    {
                        field: 'addCondition',
                        label: '条件查询',
                        title: '查询条件配置',
                        type: 'addCondition'
                    },


                ]
            },
            {
                id: '',
                title: "按钮",
                component: 'qButton',
                type: "BUTTON_CONNECTOR",
                props: {
                    //描述
                    desc: "",
                    btnText: '按钮文本',
                    btnType: 'primary',
                    btnShape: 'square',
                    btnStatus: 'normal',
                    btnSize: 'medium',
                    btnLong: true,
                    btnAction: {
                        connectorId: '',
                        connectorName: '',
                        sceneId: '',
                        sceneName: '',
                        input: [],
                        output: [],
                        enableOutput: false,
                    },
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
                        field: 'btnText',
                        label: '按钮文本',
                        type: 'input',
                    },
                    {
                        field: 'btnType',
                        label: '按钮类型',
                        type: 'select',
                        options: [
                            { label: '主要按钮', value: 'primary' },
                            { label: '次要按钮', value: 'secondary' },
                            { label: '线性按钮', value: 'outline' },
                            { label: '虚框按钮', value: 'dashed' },
                            { label: '文字按钮', value: 'text' },
                        ]
                    },

                    {
                        field: 'btnStatus',
                        label: '按钮状态',
                        type: 'select',
                        options: [
                            { label: '常规', value: 'normal' },
                            { label: '警告', value: 'warning' },
                            { label: '成功', value: 'success' },
                            { label: '危险', value: 'danger' },
                        ]
                    },
                    {
                        field: 'btnSize',
                        label: '按钮尺寸',
                        type: 'select',
                        options: [
                            { label: '迷你', value: 'mini' },
                            { label: '小', value: 'small' },
                            { label: '中', value: 'medium' },
                            { label: '大', value: 'large' },
                        ]
                    },
                    {
                        field: 'btnLong',
                        label: '宽度自适应',
                        type: 'switch',
                    },
                    {
                        field: 'btnAction',
                        label: '按钮动作',
                        type: 'btnAction',
                    },
                ]
            }
        ]

    }
