<template>
    <a-modal v-model:visible="visible" :title="modalTitle" :width="1200" title-align="start" @ok="handleOk"
        @cancel="handleCancel" :mask-closable="false">
        <div class="fx-field-container">
            <!-- 左侧：变量、函数和聚合函数选择区 -->
            <div class="left-panel">
                <div class="panel-section">
                    <div class="section-title">计算范围</div>
                    <div class="field-list">
                        <div v-for="field in availableFields" :key="field.column" class="field-item"
                            @click="insertField(field)">
                            <span class="field-name">{{ field.label }}</span>
                        </div>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">聚合函数</div>
                    <div class="func-list">
                        <div v-for="func in aggregateFunctions" :key="func.value" class="func-item"
                            @click="insertFunction(func)">
                            <span class="func-name">{{ func.name }}</span>
                            <span class="func-desc">{{ func.value }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧：公式编辑区 -->
            <div class="right-panel">
                <a-form :model="formModel" layout="vertical">
                    <a-form-item label="字段名称" required>
                        <a-input v-model="formModel.label" placeholder="请输入计算字段名称" allow-clear />
                    </a-form-item>

                    <a-form-item label="计算公式" required>
                        <div class="formula-editor">
                            <Codemirror ref="cmRef" v-model="formModel.formula" :options="cmOptions" :height="300"
                                @ready="onCmReady" @change="onCmChange" />
                            <div class="editor-tips">
                                <span>提示：点击左侧字段或函数插入到公式中</span>
                            </div>
                        </div>
                    </a-form-item>
                </a-form>
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue'
import { uuid } from '@/utils/id'
import Codemirror from 'codemirror-editor-vue3'
import type { CmComponentRef } from 'codemirror-editor-vue3'
import 'codemirror/mode/javascript/javascript.js'
import { Message } from '@arco-design/web-vue'

// Props
interface Props {
    fields?: any[]
}

const props = withDefaults(defineProps<Props>(), {
    fields: () => []
})

// Emits
const emits = defineEmits(['confirm', 'cancel'])

// 状态
const visible = ref(false)
const cmRef = ref<CmComponentRef>()
const isEditMode = ref(false)

// 弹窗标题
const modalTitle = computed(() => isEditMode.value ? '修改指标' : '新增指标')

// 表单数据
const formModel = reactive({
    label: '',
    formula: '',
    code: '',
    type: 'NUMBER'
})

// CodeMirror 配置
const cmOptions = {
    mode: "text/javascript",
    lineNumbers: false,
    lineWrapping: true,
    tabSize: 4,
    showCursorWhenSelecting: true,
}

// 可用字段（从父组件传入）
const availableFields = ref<any[]>([])

// 聚合函数列表
const aggregateFunctions = [
    { name: '求和（SUM）', value: 'sum()' },
    { name: '平均值（AVG）', value: 'avg()' },
    { name: '最大值（MAX）', value: 'max()' },
    { name: '最小值（MIN）', value: 'min()' },
    { name: '计数（COUNT）', value: 'count()' }
]

// 显示弹窗
const pendingRestore = ref(false)
const show = (fields: any[], editData?: any) => {
    console.log(fields)
    availableFields.value = JSON.parse(JSON.stringify(fields)) || []

    if (editData) {
        // 编辑模式
        isEditMode.value = true
        formModel.label = editData.label || ''
        formModel.formula = editData.fxColumn || ''
        formModel.code = editData.code || ''
        pendingRestore.value = true
    } else {
        // 新增模式
        isEditMode.value = false
        formModel.label = ''
        formModel.formula = ''
        formModel.code = ''
        pendingRestore.value = false
        nextTick(() => {
            cmRef.value?.cminstance?.setValue('')
        })
    }

    visible.value = true

    if (pendingRestore.value) {
        const tryRestore = () => {
            const instance = cmRef.value?.cminstance
            if (instance) {
                nextTick(() => restoreMarks())
            } else {
                setTimeout(tryRestore, 50)
            }
        }
        nextTick(tryRestore)
    }
}

// 隐藏弹窗
const hide = () => {
    visible.value = false
    isEditMode.value = false
    formModel.label = ''
    formModel.formula = ''
    formModel.code = ''
    pendingRestore.value = false
    if (cmRef.value?.cminstance) {
        cmRef.value.cminstance.setValue('')
    }
}

// 暴露方法
defineExpose({ show, hide })

// CodeMirror 就绪
const onCmReady = (cm: any) => {
    if (pendingRestore.value) {
        pendingRestore.value = false
        nextTick(() => restoreMarks())
    }
}

// 编辑模式回显：解析公式中的字段引用并应用 markText 标记
const restoreMarks = () => {
    const instance = cmRef.value?.cminstance;
    if (!instance || !formModel.formula) return;

    // 先清空编辑器
    instance.setValue('')

    // 设置公式内容
    instance.setValue(formModel.formula)

    // 使用正则表达式查找所有 @#id@# 格式的字段引用
    const regex = /"([^"]+)"/g
    let match

    // 收集所有需要标记的位置
    const marks = []
    while ((match = regex.exec(formModel.formula)) !== null) {
        const fieldId = match[1]
        const field = availableFields.value.find(f => f.id === fieldId || f.column === fieldId)
        
        if (field) {
            marks.push({
                start: match.index,
                end: match.index + match[0].length,
                field: field
            })
        }
    }

    // 应用标记
    marks.forEach(mark => {
        const startPos = instance.posFromIndex(mark.start)
        const endPos = instance.posFromIndex(mark.end)

        markVariable({
            start: startPos,
            end: endPos,
            value: mark.field.id || mark.field.column,
            label: mark.field.showLabel || mark.field.label,
        })
    })
}

// CodeMirror 内容变化
const onCmChange = (val: string, cm: any) => {
    formModel.formula = val
}

// 插入字段
const insertField = (field: any) => {
    const instance = cmRef.value?.cminstance
    if (!instance) return

    instance.focus()
    const cursor = instance.getCursor()

    // 插入字段引用格式："column"
    const fieldRef = `"${field.column}"`
    instance.replaceSelection(fieldRef)
    markVariable({
        start: cursor,
        end: instance?.getCursor(),
        value: field.id || field.column,
        label: field.showLabel || field.label,
    });
}

// 插入函数
const insertFunction = (func: any) => {
    const instance = cmRef.value?.cminstance
    if (!instance) return

    instance.focus()
    
    // 插入函数，将光标放在括号内
    const funcText = func.value
    instance.replaceSelection(funcText)
    
    // 将光标移动到括号内
    const cursor = instance.getCursor()
    instance.setCursor({ line: cursor.line, ch: cursor.ch - 1 })
}

function markVariable(mark: {
    start: any;
    end: any;
    label: string;
    value: string;
}) {
    const instance = cmRef.value?.cminstance;
    const label = mark.label;
    const spanDom = document.createElement("span");
    spanDom.title = label;
    spanDom.innerText = label;
    spanDom.classList.add("exp-variable");
    spanDom.dataset.variable = mark.label;

    instance?.markText(mark.start, mark.end, {
        replacedWith: spanDom,
        atomic: true,
    });
    const cursor = instance?.getCursor();
    instance?.setCursor({ line: cursor?.line, ch: cursor?.ch });
}

// 确认
const handleOk = () => {
    if (!formModel.label.trim()) {
        Message.warning('请输入字段名称')
        return
    }

    if (!formModel.formula.trim()) {
        Message.warning('请输入计算公式')
        return
    }

    // 解析公式，提取字段ID并替换为字段名称用于显示
    var splitList = ["(", "-", "/", "+", "*", ")"];
    let a = splitString(formModel.formula, splitList);
    let icons = JSON.parse(JSON.stringify(formModel.formula));
    
    a.map(v => {
        availableFields.value.map(v1 => {
            if (('"' + (v1.id || v1.column) + '"') == v) {
                icons = icons.replaceAll(v, v1.showLabel || v1.label)
            }
        })
    })

    const result = {
        code: formModel.code ? formModel.code : uuid(),
        label: formModel.label,
        showLabel: formModel.label,
        type: 'NUMBER',
        fxColumn: formModel.formula,
        labelColumn: icons,
    }

    emits('confirm', result, formModel.code)
    hide()
}

function splitString(string: string, splitters: string[]) {
    var list = [string];
    for (var i = 0, len = splitters.length; i < len; i++) {
        traverseList(list, splitters[i], 0);
    }
    return flatten(list);
}

function traverseList(list: any, splitter: string, index: number) {
    if (list[index]) {
        const item = list[index];
        if ((list.constructor !== String) && (typeof item === 'string')) {
            const splitResult = item.split(splitter);
            // 如果分割后结果不同，则替换
            if (splitResult.length > 1 || splitResult[0] !== item) {
                list[index] = splitResult;
            }
        }
        if (Array.isArray(list[index])) {
            traverseList(list[index], splitter, 0);
        }
        if (Array.isArray(list)) {
            traverseList(list, splitter, index + 1);
        }
    }
}

function flatten(arr: any[]) {
    return arr.reduce(function (acc: any[], val: any) {
        return acc.concat(val.constructor === Array ? flatten(val) : val);
    }, []);
}

// 取消
const handleCancel = () => {
    emits('cancel')
    hide() // 使用 hide 方法来清空数据
}
</script>

<style scoped lang="scss">
.fx-field-container {
    display: flex;
    gap: 16px;
    min-height: 500px;

    .left-panel {
        width: 280px;
        border-right: 1px solid #e5e5e5;
        padding-right: 16px;
        overflow-y: auto;
        max-height: 500px;

        .panel-section {
            margin-bottom: 24px;

            .section-title {
                font-size: 14px;
                font-weight: 500;
                color: rgba(0, 0, 0, 0.9);
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e5e5;
            }

            .field-list {
                .field-item {
                    padding: 8px 12px;
                    margin-bottom: 4px;
                    background: #f5f5f5;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;

                    &:hover {
                        background: #e8f3ff;
                        color: #165dff;
                    }

                    .field-name {
                        font-size: 13px;
                        color: rgba(0, 0, 0, 0.9);
                    }
                }
            }

            .func-list {
                .func-item {
                    padding: 8px 12px;
                    margin-bottom: 4px;
                    background: #f5f5f5;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;

                    &:hover {
                        background: #e8f3ff;
                    }

                    .func-name {
                        display: block;
                        font-size: 13px;
                        font-weight: 500;
                        color: rgba(0, 0, 0, 0.9);
                        margin-bottom: 2px;
                    }

                    .func-desc {
                        display: block;
                        font-size: 11px;
                        color: rgba(0, 0, 0, 0.4);
                    }
                }
            }
        }
    }

    .right-panel {
        flex: 1;
        overflow-y: auto;
        max-height: 500px;

        .formula-editor {
            width: 100%;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
            overflow: hidden;

            .editor-tips {
                padding: 8px 12px;
                background: #f5f5f5;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.4);
                border-top: 1px solid #e5e5e5;
            }
        }
    }
}

.right-panel::v-deep {
    .CodeMirror-gutters {
        display: none;
    }

    .exp-variable {
        display: inline-block;
        background: #eaf2fd;
        color: #2f7deb !important;
        display: inline-block;
        font-size: 12px;
        margin: 0 2px;
        padding: 3px 5px;
        border-radius: 5px;
    }

    .codemirror {
        padding: 5px;
    }

    .CodeMirror {
        font-size: 14px;
        color: #3a3432;

        .cm-variable,
        .cm-property {
            color: #01a252 !important;
        }

        .cm-number {
            color: #a16a94;
        }

        .exp-variable {
            background: #eaf2fd;
            color: #2f7deb !important;
            display: inline-block;
            font-size: 12px;
            margin: 0 2px;
            padding: 3px 5px;
            border-radius: 5px;
        }
    }

    .CodeMirror-cursor {
        height: auto !important;
    }

    .CodeMirror-gutters {
        display: none;
    }

    .CodeMirror-linebackground {
        background: none;
    }
}
</style>
