// 其他组件的默认值与属性面板定义。
export default {
        title: '其他组件',
        list: [
            {
                component: 'qTitle',
                title: "标题",
                type: "TITLE",
                props: {
                    //描述
                    desc: "标题",
                    // 字段名
                    fontSize: 'H1',
                    // 默认值
                    defaultValue: '',
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
                        field: 'fontSize',
                        label: '字体大小',
                        type: 'select',
                        options: [
                            { label: 'H1', value: 'H1' },
                            { label: 'H2', value: 'H2' },
                            { label: 'H3', value: 'H3' },
                            { label: 'H4', value: 'H4' },
                            { label: 'H5', value: 'H5' },
                            { label: 'H6', value: 'H6' },],
                        multiple: false,
                    },
                ],
            },
            {
                component: 'qDivider',
                title: "分割线",
                type: "SPLIT_LINE",
                props: {
                    // 字段名
                    size: 1,
                    // 默认值
                    type: 'solid',
                },
                attribute: [
                    {
                        field: 'type',
                        label: '组件类型',
                        type: 'type',
                    },
                    {
                        field: 'size',
                        label: '分割线高度',
                        type: 'number',
                        max: 15,
                        min: 1,
                    },
                    {
                        field: 'type',
                        label: '分割线样式',
                        type: 'select',
                        options: [
                            { label: '实线', value: 'solid' },
                            { label: '线虚线', value: 'dashed' },
                            { label: '点虚线', value: 'dotted' }],
                        multiple: false,
                    },
                ],
            },
        ]
    }
