import { ref } from "vue"
import { listByRelation } from "@/api/homePage/index"
import { getAppForm } from "@/api/common/index"
import { Message } from "@arco-design/web-vue"
import { setDataFormList } from "@/data/data_form"
import type { Ref } from 'vue'
import type { LayoutItem } from '../types'
import { findReportFilterTables } from '@/utils/reportFilterTargets'

export function useDesignerDatasource({ layout, tableRefs }: {
  layout: Ref<LayoutItem[]>
  tableRefs: Ref<Record<string, any>>
}) {


// 数据源选项
const datasourceOptions = ref<any[]>([])

// 字段选项（按数据表分组）
const fieldOptions = ref<Record<string, any[]>>({})

// 处理筛选变化
const handleSelectChange = (params: any, _moduleConfigId: any, id: any) => {
    // params: 筛选条件参数 { id, label, fieldName, type, componentType, pid, symbol, value, extra }
    // 查找所有与筛选组件 formId 相同的表格组件
    const tableComponents = findReportFilterTables(layout.value, id)
    // 收集所有匹配的表格组件的筛选条件
    // 为每个表格组件构建筛选条件列表
    tableComponents.forEach(tableComp => {
        tableRefs.value[String(tableComp.i)]?.updateFilterCondition(params)
    })

    // 保存报表配置
    // handleSaveReport()
}

// 加载数据源列表
const loadDatasourceList = async () => {
    try {
        const res = await listByRelation()
        // 获取 layout 中所有 TABLE 类型组件的 formId
        const tableFormIds = new Set(
            (layout.value ?? [])
                .filter((item: any) => item.type === 'TABLE')
                .map((item: any) => item.props?.data?.appId)
                .filter((formId: any) => formId) // 过滤掉空值
        )
console.log(tableFormIds,'tableFormIds')
console.log(res,'res')
        // 转换数据格式，适配下拉框，只保留有 formId 且在 layout 中存在的数据表
        datasourceOptions.value = (Array.isArray(res) ? res : [])
            .filter((item: any) => item.appId && tableFormIds.has(item.appId)) // 只保留有 formId 且在 layout 中的数据表
            .map((item: any) => ({
                tableName: item.appId,
                comment: item.appName,
                formId: item.formId
            }))
    } catch (error) {
        console.error('加载数据源失败:', error)
    }
}

// 数据源变化时加载字段
const handleDatasourceChange = async (tableName: string) => {
    if (!tableName) {
        // 清空字段选项
        return
    }
    try {
        // 查找对应的 formId
        const datasource = datasourceOptions.value.find(d => d.tableName === tableName)
        console.log(datasource)
        if (!datasource || !datasource.formId) {
            Message.warning('未找到对应的表单ID')
            return
        }

        // 调用 getAppForm 接口获取表单字段
        const res = await getAppForm(tableName)
        let formConfig = JSON.parse(res.formConfig)
        // 解析字段列表
        const fields: any[] = [];
        let list = []
        setDataFormList(formConfig.formList, list);
        (list || []).forEach((component: any) => {
            const baseField: any = {
                id: component.id,
                column: component.id,
                label: component.title,
                type: component.type,
                props: {
                    format: component.props?.format,
                    "value-format": component.props?.["value-format"] || component.props?.valueFormat,
                },
                extra: {
                    options: component.props?.options,
                },
            }

            if (['DATE_INTERVAL', 'TIME_INTERVAL'].includes(component.type)) {
                // 区间类型字段拆分为开始和结束两个子字段
                const isDateInterval = component.type === 'DATE_INTERVAL' ? 'DATE' : 'TIME'
                const startLabel = component.title + '_开始时间'
                const endLabel = component.title + '_结束时间'

                const startField = {
                    ...baseField,
                    id: component.id + '_start',
                    column: component.id + '_start',
                    label: startLabel,
                    type: isDateInterval,
                    format: { dateTime: 0 },
                    showLabel: startLabel,
                }
                const endField = {
                    ...baseField,
                    id: component.id + '_end',
                    column: component.id + '_end',
                    label: endLabel,
                    type: isDateInterval,
                    format: { dateTime: 0 },
                    showLabel: endLabel,
                }
                // 父节点包含子字段
                // baseField.expanded = false
                // baseField.children = [, endField]
                fields.push(startField)
                fields.push(endField)
            } else if (component.type === 'ADDRESS' || component.type === 'LOCATION') {
                // 地址类型字段拆分为省、市、区、详细地址四个子字段

                const provField = {
                    ...baseField,
                    id: component.id + '_prov',
                    column: component.id + '_prov',
                    label: component.title + '_省',
                    type: 'INPUT',
                    format: {
                        address: { province: true, city: false, county: false, detail: false },
                    },
                    showLabel: component.title + '_省',
                }
                fields.push(provField)

                const cityField = {
                    ...baseField,
                    id: component.id + '_city',
                    column: component.id + '_city',
                    label: component.title + '_市',
                    type: 'INPUT',
                    showLabel: component.title + '_市',
                    format: {
                        address: { province: false, city: true, county: false, detail: false },
                    },
                }
                fields.push(cityField)

                if (component.props?.option == 'prov-city-dist-det' || component.props?.option == 'prov-city-dist') {
                    const distField = {
                        ...baseField,
                        id: component.id + '_dist',
                        column: component.id + '_dist',
                        label: component.title + '_区',
                        type: 'INPUT',
                        showLabel: component.title + '_区',
                        format: {
                            address: { province: false, city: false, county: true, detail: false },
                        },
                    }
                    fields.push(distField)
                }

                if (component.props?.option == 'prov-city-dist-det') {
                    const detField = {
                        ...baseField,
                        id: component.id + '_det',
                        column: component.id + '_det',
                        label: component.title + '_详细地址',
                        type: 'INPUT',
                        showLabel: component.title + '_详细地址',
                        format: {
                            address: { province: false, city: false, county: false, detail: true },
                        },
                    }
                    fields.push(detField)
                }

            } else {
                fields.push(baseField)
            }
        })
        fields.push({
            id: "id",
            "column": "id",
            label: "主键",
            type: "INPUT",
        });
        fields.push({
            "column": "create_user",
            id: "create_user",
            label: "创建人",

            type: "INPUT",
            default: "",
        });
        fields.push({
            "column": "create_time",
            id: "create_time",
            label: "创建时间",
            type: "DATE",
            props: {
                format: "YYYY-MM-DD HH:mm:ss",
                "value-format": "YYYY-MM-DD HH:mm:ss",
            },
        });
        fields.push({
            "column": "update_user",
            id: "update_user",
            label: "修改人",
            type: "INPUT",
            default: "",
        });
        fields.push({
            "column": "update_time",
            id: "update_time",
            label: "修改时间",
            type: "DATE",
            props: {
                format: "YYYY-MM-DD HH:mm:ss",
                "value-format": "YYYY-MM-DD HH:mm:ss",
            },
        });
        fields.push({
            "column": "submit_ip",
            id: "submit_ip",
            label: "提交ip",
            type: "INPUT",
        });

        fields.push({
            "column": "input_source",
            id: "input_source",
            label: "数据来源",
            type: "SELECT",
            "extra": {
                options: [
                    { value: 1, label: "填写" },
                    { value: 2, label: "导入" },
                ],
            },
        });

        if (formConfig.category === 2) {
            fields.push({
                "column": "instance_id",
                id: "instance_id",
                label: "流程实例id",
                type: "INPUT",
            });

            fields.push({
                "column": "instance_state",
                id: "instance_state",
                label: "流程状态",
                "extra": {
                    options: [
                        { value: 0, label: "已完成" },
                        { value: 1, label: "运行中" },
                    ],
                },
                type: "SELECT",
            });
        }

        // 存储到 fieldOptions
        fieldOptions.value[tableName] = fields
    } catch (error) {
        console.error('加载字段失败:', error)
        fieldOptions.value[tableName] = []
    }
}
  return { datasourceOptions, fieldOptions, handleSelectChange, loadDatasourceList, handleDatasourceChange }
}
