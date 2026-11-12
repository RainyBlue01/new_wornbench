// 布局组件的默认值与属性面板定义。
export default {
        title: '布局组件',
        list: [
            {
                id: 3,
                col: '',
                desc: "",
                title: "栅格布局",
                component: 'qRow',
                type: "ROW",
                props: {
                    gutter: 10,
                    justify: 'start',
                    align: 'start',
                    wrap: true,
                    div: false
                },
                attribute: [
                    {
                        field: 'type',
                        label: '组件类型',
                        type: 'type',
                    },
                    {
                        field: 'gutter',
                        label: '栅格间距',
                        type: 'number',
                        min: 0,
                        max: 20,
                    },
                    {
                        field: 'children',
                        label: '列编辑',
                        type: 'children',
                    },
                ],
                children: [
                    {
                        id: 4,
                        col: '',
                        desc: "",
                        title: "列",
                        component: 'qCol',
                        type: "COL",
                        props: {
                            span: 12,
                        },
                        attribute: [
                            {
                                field: 'type',
                                label: '组件类型',
                                type: 'type',
                            },
                            {
                                field: 'span',
                                label: '站位格数',
                                type: 'number',
                                min: 1,
                                max: 24,
                            },
                        ],
                        children: []
                    }, {
                        id: 5,
                        col: '',
                        desc: "",
                        title: "列",
                        component: 'qCol',
                        type: "COL",
                        props: {
                            span: 12,
                        },
                        attribute: [
                            {
                                field: 'type',
                                label: '组件类型',
                                type: 'type',
                            },
                            {
                                field: 'span',
                                label: '站位格数',
                                type: 'number',
                                min: 1,
                                max: 24,
                            },
                        ],
                        children: []
                    }]
            },

        ]
    }
