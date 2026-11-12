// 业务组件的默认值与属性面板定义。
export default {
        title: '业务组件',
        list: [
            {
                id: '',
                title: "人员单选",
                component: 'qRadioPersonnel',
                type: "USER",
                props: {
                    desc: "",
                    required: true,
                    defaultValue: [],
                    value: '',
                    //可选择范围类型
                    rangeType: 'CUSTOM',
                    //可选择范围
                    range: [],
                    //选择部门字段
                    deptField: '',
                    //当前用户
                    currentUserDept: false,
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
                    {
                        field: 'placeholder',
                        label: '提示',
                        type: 'input',
                    },
                    {
                        field: 'currentUserDept',
                        label: '可选范围',
                        component: 'selectRadioPerson',
                        type: 'currentUserDept',
                        options: [
                            { label: '自定义', value: 'CUSTOM' },
                            { label: '由部门字段决定', value: 'DEPT_FIELD' }
                        ]
                    }
                ],
                children: [
                ]
            },
            {
                id: '',
                title: "人员多选",
                component: 'qCheckboxPersonnel',
                type: "USER_MULTIPLE",
                props: {
                    desc: "",
                    required: true,
                    defaultValue: [],
                    value: [],
                    //可选择范围类型
                    rangeType: 'CUSTOM',
                    //可选择范围
                    range: [],
                    //选择部门字段
                    deptField: '',
                    //当前用户
                    currentUserDept: false,
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
                        field: 'currentUserDept',
                        label: '可选范围',
                        component: 'selectCheckPerson',
                        type: 'currentUserDept',
                        options: [
                            { label: '自定义', value: 'CUSTOM' },
                            { label: '由部门字段决定', value: 'DEPT_FIELD' }
                        ]
                    }
                ],
                children: [
                ]
            },
            {
                id: '',
                title: "部门单选",
                component: 'qRadioDept',
                type: "DEPT",
                props: {
                    desc: "",
                    required: true,
                    defaultValue: [],
                    value: '',
                    //可选择范围类型
                    rangeType: 'CUSTOM',
                    //可选择范围
                    range: [],
                    //选择部门字段
                    deptField: '',
                    //当前用户主要部门
                    currentUserMainDept: false,
                    //当前用户兼任部门
                    currentUserSecondaryDept: false,
                    //当前用户所处部门及下级部门
                    currentUserLowerDept: false,
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
                    {
                        field: 'placeholder',
                        label: '提示',
                        type: 'input',
                    },
                    {
                        field: 'currentUserDept',
                        label: '可选范围',
                        component: 'selectRadioDept',
                        type: 'currentUserDept',
                        options: [
                            { label: '自定义', value: 'CUSTOM' },
                        ]
                    }
                ],
                children: [
                ]
            },
            {
                id: '',
                title: "部门多选",
                component: 'qCheckboxDept',
                type: "DEPT_MULTIPLE",
                props: {
                    desc: "",
                    required: true,
                    defaultValue: [],
                    value: [],
                    //可选择范围类型
                    rangeType: 'CUSTOM',
                    //可选择范围
                    range: [],
                    //选择部门字段
                    deptField: '',
                    //当前用户主要部门
                    currentUserMainDept: false,
                    //当前用户兼任部门
                    currentUserSecondaryDept: false,
                    //当前用户所处部门及下级部门
                    currentUserLowerDept: false,
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
                        field: 'currentUserDept',
                        label: '可选范围',
                        component: 'selectCheckDept',
                        type: 'currentUserDept',
                        options: [
                            { label: '自定义', value: 'CUSTOM' },
                        ]
                    }
                ],
                children: [
                ]
            },
        ]

    }
