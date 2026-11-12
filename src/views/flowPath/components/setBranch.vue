<template>
    <div>
        <base-modal ref="modalRef" modal-class="condition-modal" :render-to-body="false" @handle-ok="formSubmit"
            @handle-cancel="handleCancel">
            <div class="condition-wrapper">
                <div class="condition-match">
                    <a-radio-group v-model="form.mode">
                        <a-radio value="all">满足全部条件</a-radio>
                        <a-radio value="any">满足任一条件</a-radio>
                    </a-radio-group>
                </div>

                <div class="condition-list">
                    <p v-if="!form.logicConditions.length" class="condition-empty">
                        暂无逻辑规则，点击「新增逻辑规则」
                    </p>
                    <div v-for="(items, index) in form.logicConditions" :key="index" class="condition-item">
                        <a-select allow-clear filterable v-model="items.fieldCode" placeholder="选择字段"
                            class="condition-field" @change="changeName($event, items)">
                            <a-option :label="item.title" :value="item.id" v-for="item in DataFormList"
                                :key="item.id" />
                            <a-option label="表达式" value="expression" />
                        </a-select>
                        <a-select allow-clear filterable v-model="items.condition" placeholder="选择规则"
                            class="condition-rule"
                            v-if="items.fieldCode !== 'expression' && items.rulesOption.length > 0"
                            @change="changeValue($event, items)">
                            <a-option :label="item.name" :value="item.value" v-for="item in items.rulesOption"
                                :key="item.value" />
                        </a-select>
                        <div class="condition-expression" v-if="items.fieldCode == 'expression'">
                            <expression v-model:label="items.value" v-model:value="items.expression" :custom="true">
                                <template #default>
                                    <a-input v-model="items.defaultValue" allow-clear />
                                </template>
                            </expression>
                        </div>
                        <formLogics :deptList="deptList" v-if="items.condition" :datas="items"
                            class="condition-value" />
                        <button type="button" class="condition-remove" title="删除" @click="deleteItem(index)">
                            <icon-delete />
                        </button>
                    </div>
                </div>

                <button type="button" class="condition-add-btn" @click="addItem">
                    <icon-plus />
                    新增逻辑规则
                </button>
            </div>
        </base-modal>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { typeFlter, setFormValue, selectTypeFlter, selectDateFlter, numTypeFlter, setDataForm, setDataFormList, removeSpecialChars } from '@/data/data_form.js'
import { useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
const win = window as any
const route = useRoute()
const modalRef = ref()
const edit = ref(false)
const indexs = ref(0)
interface FormDataType {
    logicConditions?: Array<any>;
    mode: string;
}
const form = reactive<FormDataType>({
    logicConditions: [{ fieldCode: '', expression: '', condition: '', value: '', rulesOption: [], inputType: '', default: [], valueShow: '' }],
    mode: 'all',
})
const props = defineProps<{
    formList: any,
    nowNode: any,
    deptList: any,
}>()
const DataFormList = ref([])

const addItem = () => {
    form.logicConditions.push({ custom: false, fieldCode: '', expression: '', condition: '', value: '', rulesOption: [], inputType: '', default: [], valueShow: '' })
}
setDataFormList(props.formList, DataFormList.value)
const changeName = (val: any, item: any) => {
    setDataForm(val, item, DataFormList.value)
}
const changeValue = (val: any, items: any) => {
    setFormValue(items)
}

const emits = defineEmits([
    'init',
])
const deleteItem = (index: number) => {
    form.logicConditions.splice(index, 1)

}
const showItem = (item: any) => {
    modalRef.value.handleClick({
        title: '条件规则',
        okText: '确认',
        cancelText: '取消',
        showBtn: true,
        width: '964px',
    })
    if (item.option && item.rules) {
        form.logicConditions = JSON.parse(JSON.stringify(item.rules))
        form.logicConditions.map((v: any) => {
            if (v.fieldCode == 'expression') {
                v.expression = `${v.expression}`
            }
        })

        form.mode = item.option == 1 ? 'all' : 'any'
    }

}


const handleCancel = () => {
    form.logicConditions = [{ fieldCode: '', condition: '', value: '', rulesOption: [], inputType: '', valueShow: '', }]
    form.fieldCodes = []
    form.mode = 'all'
    edit.value = false
    indexs.value = false
    modalRef.value.handleClose()
}
const valueOptionalConditions = ['IS_NULL', 'NOT_NULL']
const departmentOrUserTypes = ['DEPT', 'DEPT_MULTIPLE', 'USER', 'USER_MULTIPLE']
const numericInputTypes = ['NUMBER', 'RATE', 'MONEY']

const hasRuleValue = (rule: any) => {
    if (valueOptionalConditions.includes(rule.condition)) return true
    if (rule.condition == 'BETWEEN' && numericInputTypes.includes(rule.inputType)) {
        return rule.min !== '' && rule.min !== null && rule.min !== undefined
            && rule.max !== '' && rule.max !== null && rule.max !== undefined
    }
    if (numericInputTypes.includes(rule.inputType)) {
        if (typeof rule.value == 'number') return Number.isFinite(rule.value)
        if (typeof rule.value == 'string') {
            return rule.value.trim() !== '' && Number.isFinite(Number(rule.value))
        }
        return false
    }
    if (departmentOrUserTypes.includes(rule.inputType)) {
        return Array.isArray(rule.default) && rule.default.length > 0
    }
    if (Array.isArray(rule.value)) return rule.value.length > 0
    if (typeof rule.value == 'string') return rule.value.trim() !== ''
    return rule.value !== null && rule.value !== undefined
}

const isRuleComplete = (rule: any) => {
    if (!rule.fieldCode) return false
    if (rule.fieldCode == 'expression') return Boolean(rule.expression?.trim())
    return Boolean(rule.condition) && hasRuleValue(rule)
}

const formSubmit = () => {
    let params = JSON.parse(JSON.stringify(form))
    let nameNull = params.logicConditions.length === 0
    params.logicConditions.map((v: any) => {
        if (!isRuleComplete(v)) {
            nameNull = true
            return
        }
        if (v.fieldCode == 'expression') {
            v.expression = removeSpecialChars(v.expression)
        } else {
            if (valueOptionalConditions.includes(v.condition)) {
                const method = v.condition == 'IS_NULL' ? 'isNull' : 'isNotNull'
                v.symbol = method
                v.value = ''
                v.expression = `${method}(${v.fieldCode})`
                return
            }
            let value = {}
            if (v.condition == 'DYNAMIC_BETWEEN' && v.inputType == 'DATE') {
                if (v.value > 5 && v.value < 9) {
                    value.type = "MONTH"
                    let items = v.value == 6 ? 1 : v.value == 7 ? 3 : v.value == 8 ? 6 : 1
                    value.num = JSON.parse(JSON.stringify(items))
                    v.value = value
                }
                if (v.value < 6) {
                    value.type = "DAY"
                    let items = v.value == 1 ? 1 : v.value == 2 ? 3 : v.value == 3 ? 5 : v.value == 4 ? 7 : 15
                    value.num = JSON.parse(JSON.stringify(items))
                    v.value = value
                }
                if (v.value > 8) {
                    value.type = "YEAR"
                    let items = v.value == 9 ? 1 : v.value == 10 ? 2 : v.value == 11 ? 3 : 1
                    value.num = JSON.parse(JSON.stringify(items))
                    v.value = value
                }
            } else if (v.condition == 'BETWEEN' && numericInputTypes.includes(v.inputType)) {
                v.value = [v.min, v.max]
            }
            if (v.inputType == 'ADDRESS' && v.xsArea) {
                v.value.push(v.xsArea)
            }
            if (v.condition) {
                if (numericInputTypes.includes(v.inputType)) {
                    numTypeFlter.map(v1 => {
                        if (v.condition == v1.value) {
                            v.symbol = v1.method
                            v.expression = v1.method + "(" + v.fieldCode + ',' + v.value + ")"
                        }
                    })
                } else if (v.inputType == 'DATE' || v.inputType == 'TIME') {
                    selectDateFlter.map(v1 => {
                        if (v.condition == v1.value) {
                            v.symbol = v1.method
                            v.expression = v1.method + "(" + v.fieldCode + ',' + v.value + ")"
                        }
                    })
                } else if (v.inputType == 'CHECKBOX' || v.inputType == 'SELECT_MULTIPLE') {
                    selectTypeFlter.map(v1 => {
                        if (v.condition == v1.value) {
                            v.symbol = v1.method
                            v.expression = v1.method + "(" + v.fieldCode + ',' + v.value + ")"
                        }
                    })
                } else if (v.inputType == 'DEPT_MULTIPLE' || v.inputType == 'USER_MULTIPLE') {
                    selectTypeFlter.map(v1 => {
                        if (v.condition == v1.value) {
                            v.symbol = v1.method
                            v.value = v.default.map(v => { return v.id })
                            v.expression = v1.method + "(" + v.fieldCode + ',' + v.value + ")"
                        }
                    })
                    v.value = v.default.map(v => { return v.id })
                } else if (v.inputType == 'DEPT' || v.inputType == 'USER') {
                    selectTypeFlter.map(v1 => {
                        if (v.condition == v1.value) {
                            v.symbol = v1.method
                            v.value = v.default[0].id
                            v.expression = v1.method + "(" + v.fieldCode + ',' + v.value + ")"
                        }
                    })
                    v.value = v.default.map(v => { return v.id })
                } else {
                    typeFlter.map(v1 => {
                        if (v.condition == v1.value) {
                            v.symbol = v1.method
                            v.expression = v1.method + "(" + v.fieldCode + ',' + v.value + ")"
                        }
                    })
                }

            }
        }

    })
    if (nameNull) {
        Message.error('请完善条件规则')
    } else {
        emits('init', params)
        handleCancel()
    }

}
defineExpose({
    showItem,
})
</script>
<style lang="scss" scoped>
@use "@/styles/condition-modal.scss" as conditionModal;

:deep(.condition-modal) {
    @include conditionModal.condition-modal-shell;
}

.condition-wrapper {
    @include conditionModal.condition-wrapper-styles;

    .condition-match {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
}
</style>
