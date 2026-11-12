<template>
    <a-modal class="scene-config-model" title="变量配置" :visible="dialogVisible" :width="1400"
        :body-style="{ height: '500px' }" :esc-to-close="false" :mask-closable="false" unmount-on-close
        @cancel="handleClose" @ok="submit" ok-text="确认" cancel-text="取消">
        <div class="dialog-content">
            <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
                <a-form-item label="入参变量">
                    <div class="input-box">
                        <a-table ref="refInputTable" :columns="inputColumns" :data="form.input" :pagination="false"
                            :bordered="true" default-expand-all-rows>
                            <!-- 变量名称列 -->
                            <template #name="{ record, rowIndex }">
                                <a-select v-model="record.name" @change="changeInputName(record, $event)"
                                    :field-names="fieldNames"
                                    :options="record.parentName ? record.child : actions.input" placeholder="请选择业务场景">
                                </a-select>

                            </template>

                            <!-- 是否子表单列 -->
                            <template #filedType="{ record, rowIndex }">
                                <a-select v-model="record.type" placeholder="请选择" class="type-select"
                                    :options="electType">
                                </a-select>
                            </template>

                            <!-- 默认值/操作列 -->
                            <template #valueOrAction="{ record, rowIndex }">
                                <a-select v-if="record.type == 0" @change="changeInputFieldCode(record, $event)"
                                    :options="record.parentName ? record.codeChild : formList"
                                    v-model="record.fieldCode" placeholder="变量名称">
                                </a-select>
                                <a-input v-if="record.type === 1" v-model="record.defaultValue" placeholder="请输入默认值"
                                    class="value-input" />
                            </template>

                            <!-- 删除操作列 -->
                            <template #operation="{ record, rowIndex }">
                                <template v-if="!record.parentName">
                                    <a-space>
                                        <a-button v-if="record.isSubForm" @click="addInputSubForm(record)">
                                            新增子表单入参变量
                                        </a-button>
                                        <a-button @click="deleteInput(rowIndex)">
                                            删除
                                        </a-button>

                                    </a-space>

                                </template>
                                <template v-else>
                                    <a-button @click="deleteInputSubForm(record, rowIndex)">
                                        删除
                                    </a-button>
                                </template>
                            </template>

                            <!-- 表格底部的新增按钮 -->
                            <template #footer>
                                <div style="display: flex;  justify-content: flex-start; padding: 8px;">
                                    <a-button @click="addInput" class="add-btn">
                                        <icon-plus />
                                        新增变量
                                    </a-button>
                                </div>
                            </template>
                        </a-table>
                    </div>
                </a-form-item>
                <a-form-item>
                    配置出参
                    <a-switch v-model="form.enableOutput" class="switch" />
                </a-form-item>
                <a-form-item label="出参变量" v-if="form.enableOutput">
                    <div class="input-box">
                        <a-table :columns="outputColumns" :data="form.output" :pagination="false" :bordered="true"
                            default-expand-all-rows>
                            <!-- 变量名称列 -->
                            <template #name="{ record, rowIndex }">
                                <a-select :field-names="fieldNames" @change="changeOutputName(record, $event)"
                                    :options="record.parentName ? record.child : actions.output.outputParams"
                                    v-model="record.name" placeholder="请选择业务场景">
                                </a-select>
                            </template>

                            <!-- 路径列 -->
                            <template #path="{ record, rowIndex }">
                                <a-select v-model="record.fieldCode" @change="changeOutputFieldCode(record, $event)"
                                    :options="record.parentName ? record.codeChild : formList" placeholder="变量名称">
                                </a-select>
                            </template>



                            <!-- 操作列 -->
                            <template #operation="{ record, rowIndex }">
                                <div class="operation-buttons">
                                    <!-- 添加子节点按钮 -->
                                    <template v-if="!record.parentName">
                                        <a-space>
                                            <a-button v-if="record.isSubForm" @click="addChildParam(record, rowIndex)">
                                                新增子表单入参变量
                                            </a-button>
                                            <a-button @click="deleteOutputParam(rowIndex)">
                                                删除
                                            </a-button>

                                        </a-space>

                                    </template>
                                    <template v-else>
                                        <a-button @click="deleteChildParam(record, rowIndex)">
                                            删除
                                        </a-button>
                                    </template>
                                </div>
                            </template>

                            <!-- 表格底部的新增按钮 -->
                            <template #footer>
                                <div style="display: flex; justify-content: flex-start; padding: 8px;">
                                    <a-button @click="addOutputParam" class="add-btn">
                                        <icon-plus />
                                        新增变量
                                    </a-button>
                                </div>
                            </template>
                        </a-table>
                    </div>
                </a-form-item>
            </a-form>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { useRoute } from 'vue-router'
import { getFormList } from '@/utils/form'
import { INPUT_VALUE_TYPES } from '@/utils/buttonAction'
const props = defineProps<{
    activeFlew: any,
    actions: any,
}>()
const electType = INPUT_VALUE_TYPES
const emits = defineEmits(['refresh'])
const route = useRoute()
const fieldNames = { value: 'name', label: 'name' }
const formList = ref(getFormList(route.query.id, true))
// 状态定义
const dialogVisible = ref(false)
const formRef = ref(null)
const inputColumns = [
    {
        title: '变量名称',
        dataIndex: 'name',
        slotName: 'name',
        width: 416,
    },
    {
        title: '变量类型',
        dataIndex: 'filedType',
        slotName: 'filedType',
        width: 120
    },
    {
        title: '默认值/操作',
        dataIndex: 'valueOrAction',
        slotName: 'valueOrAction',
        "min-width": 550,
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slotName: 'operation',
        width: 120
    }
]

const outputColumns = [
    {
        title: '变量名称',
        dataIndex: 'name',
        slotName: 'name',
        width: 385,
    },
    {
        title: '路径',
        dataIndex: 'path',
        slotName: 'path',
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slotName: 'operation',
        width: 100
    }
]

// 表单数据
let form = reactive({
    input: [],
    enableOutput: false,
    output: []
})

// 添加入参变量
const addInput = () => {
    form.input.push({
        name: '',
        type: 0,
        isSubForm: false,
        fieldCode: ''
    })
}

// 删除入参变量
const deleteInput = (index: number) => {
    form.input.splice(index, 1)
}

const changeInputName = (record: any, val: any) => {
    if (record.parentName) {
        const child = record.child.find(i => i.name === val) || null
        if (child.children) {
            record.child = child.children
            record.isSubForm = true
        } else {
            record.isSubForm = false
        }
    } else {
        const child = props.actions.input.find(i => i.name === val) || null
        if (child.children) {
            record.child = child.children
            record.isSubForm = true
        } else {
            record.isSubForm = false
        }
    }

}
const changeOutputName = (record: any, val: any) => {
    if (record.parentName) {
        const child = record.child.find(i => i.name === val) || null
        if (child.children) {
            record.child = child.children
            record.isSubForm = true
        } else {
            record.isSubForm = false
        }
    } else {
        const child = props.actions.output.outputParams.find(i => i.name === val) || null
        if (child.children) {
            record.child = child.children
            record.isSubForm = true
        } else {
            record.isSubForm = false
        }
    }
}
const changeOutputFieldCode = (record: any, val: any) => {
    if (record.parentName) {
        const child = record.codeChild.find(i => i.value === val) || null
        if (child.children) {
            record.child = child.children
        }
    } else {
        const child = formList.value.find(i => i.value === val) || null
        if (child.children) {
            record.codeChild = child.children
        }
    }

}

const changeInputFieldCode = (record: any, val: any) => {
    if (record.parentName) {
        const child = record.codeChild.find(i => i.value === val) || null
        if (child.children) {
            record.child = child.children
        }
    } else {
        const child = formList.value.find(i => i.value === val) || null
        if (child.children) {
            record.codeChild = child.children
        }
    }
}
const changeOutputIsSubForm = (val: any, record: any) => {
    if (!val) {
        delete record.children
    }
}

const addInputSubForm = (item: any) => {
    if (!item.children || item.children.length === 0) {
        item.children = []
    }
    item.children.push({
        name: '',
        type: 0,
        child: item.child,
        codeChild: item.codeChild,
        parentName: item.name,
        isSubForm: false,
        fieldCode: ''
    })
}

const deleteInputSubForm = (record, index) => {
    const child = form.input.find(i => i.name = record.parentName) || null
    if (child) {
        child.children.splice(index, 1)
    }
}

// 添加输出参数解析
const addOutputParam = () => {
    if (!form.output) {
        form.output = []
    }
    form.output.push({
        name: "",
        fieldCode: "",
        isSubForm: false,
    })
}

// 删除输出参数解析
const deleteOutputParam = (index: number) => {
    form.output.splice(index, 1)
}

// 添加子参数
const addChildParam = (parentRecord, parentIndex) => {
    const newChild = {
        name: "",
        fieldCode: "",
        child: parentRecord.child,
        codeChild: parentRecord.codeChild,
        isSubForm: false,
        parentName: parentRecord.name
    };

    if (!parentRecord.children) {
        parentRecord.children = []
    }
    parentRecord.children.push(newChild);
}

const deleteChildParam = (record, index) => {
    const child = form.output.find(i => i.name = record.parentName) || null
    if (child) {
        child.children.splice(index, 1)
    }
}

// 显示弹窗
const showModal = async (item: any) => {
    form.enableOutput = item.enableOutput
    form.input = item.input
    form.output = item.output
    dialogVisible.value = true


}

// 重置表单
const resetForm = () => {
}

// 关闭弹窗
const handleClose = () => {
    resetForm()
    dialogVisible.value = false
    formRef.value?.clearValidate()
}

// 提交表单
const submit = async () => {
    try {
        const validateResult = await formRef.value?.validate()
        if (validateResult) {
            return false
        }
        emits('refresh', form)
        handleClose()
    } catch (error) {
        Message.error('操作失败')
    }
}

// 暴露方法给父组件
defineExpose({
    showModal
})
</script>

<style lang="scss" scoped>
@use "@/styles/textColor" as textColor;

.scene-config-model {

    .dialog-content {}

    .checkbox-wrapper {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .body-set-wrapper {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .input-box {
        width: 100%;

        .input-item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;

            :deep(.arco-select) {
                flex: 1;
            }

            .key-input,
            .type-select,
            .value-select,
            .value-input,
            .name-input,
            .path-input,
            .scene-select {
                flex: 1;
            }

            .equal-btn {
                flex: 0 0 auto;
            }

            .delete-icon {
                flex: 0 0 auto;
                cursor: pointer;
                color: rgba(0, 0, 0, 0.4);
                font-size: 16px;

                &:hover {
                    color: #f26161;
                }
            }
        }
    }

    .add-btn {
        width: 100%;
        border: 1px dashed #dcdfe6;
        background: #fff;

        &:hover {
            border-color: textColor.$ThemeTextColor;
            color: textColor.$ThemeTextColor;
        }
    }

    .form-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .title {
            display: flex;
            align-items: center;
            gap: 8px;

            .content-type {
                cursor: pointer;
                color: textColor.$ThemeTextColor;
                font-size: 12px;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
        }

        .dropdown-link {
            cursor: pointer;
            color: textColor.$ThemeTextColor;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
    }

    .switch {
        margin-left: 10px;
    }
}

:deep(.CodeMirror) {
    border: 1px solid #e5e5e5;
    height: 120px;
    width: 100%;
    border-radius: 3px;
}

:deep(.CodeMirror-gutters) {
    left: 0 !important;
}

.operation-buttons {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    width: 100%;
}
</style>
