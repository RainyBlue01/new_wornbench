<template>
    <div
        class="form-designer-prop-group form-item"
        :class="{ 'form-designer-prop-group--compact': isCompactField }"
    >
        <div v-if="formData.type === 'fieldControl'" class="form-designer-prop-section-title">
            权限设置
        </div>

        <div
            v-else-if="showLabelHeader"
            class="form-designer-prop-header"
        >
            <label class="form-designer-prop-label">{{ formData.label }}</label>
            <span
                v-if="formData.type === 'button' || formData.type === 'inputButton'"
                class="form-designer-prop-link"
                @click="changeButton"
            >
                批量配置
            </span>
        </div>

        <batchNode ref="batchNodeRef" :activeFlew="activeFlew" />

        <div class="form-item-body">
            <setConnectorId v-if="formData.type === 'connectorId'" :activeFlew="activeFlew" />
            <PluginNodeConfig v-if="formData.type === 'pluginConfig'" :active-node="activeFlew" :form-list="formList" />
            <a-input
                v-if="formData.type === 'input'"
                v-model="activeFlew[formData.field]"
                :placeholder="formData.label"
                :style="{ width: '100%' }"
            />
            <a-select
                v-if="formData.type === 'select'"
                :options="formData.options"
                placeholder="请选择符号"
                v-model="activeFlew[formData.field]"
                :style="{ width: '100%' }"
            />
            <formUser
                :roleList="roleList"
                :deptList="deptList"
                :postList="postList"
                v-if="formData.type === 'selectPerson' && activeFlew.type == 'APPROVE'  && activeFlew.approveOption == 0"
                v-model="activeFlew[formData.field]"
                :title="formData.label"
            />
            <a-select
                v-if="formData.type === 'selectPerson' && activeFlew.type == 'APPROVE' && activeFlew.approveOption == 1"
                :options="gcOptions"
                placeholder="请选择逐级审批人"
                v-model="activeFlew.graduallyCandidate.level"
                :style="{ width: '100%' }"
            />
            <p
                v-if="formData.type === 'selectPerson' && activeFlew.type == 'APPROVE' && activeFlew.approveOption == 1"
                class="form-designer-prop-hint"
            >
                从发起人的“直接部门负责人”开始，逐级向上审批，直至候选对象
            </p>
            <formUser
                :roleList="roleList"
                :deptList="deptList"
                :postList="postList"
                v-if="formData.type === 'selectPerson' && (activeFlew.type == 'INPUT' || activeFlew.type == 'NOTICE')"
                v-model="activeFlew[formData.field]"
                :title="formData.label"
            />
            <div v-if="formData.type === 'checkbox'" class="form-designer-prop-check">
                <a-checkbox v-model="activeFlew[formData.field]">
                    {{ formData.label }}
                </a-checkbox>
            </div>
            <fieldControl
                v-if="formData.type === 'fieldControl'"
                :key="activeFlew.id"
                :activeFlew="activeFlew"
            />
            <btnList v-if="formData.type === 'button'" :inputButton="activeFlew" />
            <btnList v-if="formData.type === 'inputButton'" :inputButton="activeFlew" />
            <div v-if="formData.type === 'approveBlank'" class="form-designer-prop-check form-designer-prop-check--stacked">
                <a-checkbox v-model="activeFlew.approveBlank">{{ formData.label }}</a-checkbox>
                <div v-if="activeFlew.approveBlank" class="form-designer-prop-check-extra">
                    <a-select
                        :options="options"
                        v-model="activeFlew.approveBlankOption.option"
                        :style="{ width: '100%' }"
                    />
                    <selectPerson
                        v-if="activeFlew.approveBlankOption.option == 1"
                        placeholder="人员选择"
                        title="人员选择"
                        v-model="activeFlew.approveBlankOption.userIds"
                        :deptList="deptList"
                    />
                </div>
            </div>
            <div v-if="formData.type === 'autoApprove'" class="form-designer-prop-check form-designer-prop-check--stacked">
                <a-checkbox v-model="activeFlew.autoApprove">{{ formData.label }}</a-checkbox>
                <div v-if="activeFlew.autoApprove" class="form-designer-prop-check-extra">
                    <a-select
                        :options="autoOptionList"
                        v-model="activeFlew.autoApproveOption.autoOption"
                        :style="{ width: '100%' }"
                    />
                </div>
            </div>
            <div v-if="formData.type === 'rule'" class="form-designer-prop-rule">
                <a-space fill>
                    <a-select
                        :options="ruleoptions"
                        v-model="activeFlew.rule.option"
                        :style="{ width: '120px' }"
                    />
                    <a-checkbox v-model="activeFlew.rule.ratio">占比</a-checkbox>
                </a-space>
                <a-space fill style="margin-top: 8px;">
                    <a-select
                        :options="symboloptions"
                        placeholder="请选择符号"
                        allow-clear
                        v-model="activeFlew.rule.symbol"
                        :style="{ width: '120px' }"
                    />
                    <a-input-number
                        :model-value="normalizedRuleRate"
                        @update:model-value="updateRuleRate"
                        allow-clear
                        placeholder="请输入占比"
                        :style="{ width: '100%' }"
                    >
                        <template v-if="activeFlew.rule.ratio" #append>%</template>
                    </a-input-number>
                </a-space>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import fieldControl from './fieldControl.vue'
import batchNode from './batchNode.vue'
import btnList from './btnList.vue'
import setConnectorId from './setConnectorId.vue';
import PluginNodeConfig from './PluginNodeConfig.vue';

const batchNodeRef = ref()
const props = defineProps<{
    activeFlew: any,
    formData: any,
    deptList: any,
    roleList: any,
    postList: any
    formList: any[]
}>()

const isCompactField = computed(() =>
    ['checkbox', 'approveBlank', 'autoApprove'].includes(props.formData.type)
)

const showLabelHeader = computed(() =>
    !['checkbox', 'autoApprove', 'approveBlank', 'fieldControl', 'pluginConfig'].includes(props.formData.type)
)

const normalizedRuleRate = computed<number | undefined>(() => {
    const value = props.activeFlew?.rule?.rate
    if (value === '' || value === null || value === undefined) return undefined

    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? numberValue : undefined
})

const updateRuleRate = (value: number | undefined) => {
    if (!props.activeFlew?.rule) return
    props.activeFlew.rule.rate = value ?? ''
}

const gcOptions = [
    { label: '直接部门负责人', value: 1 }, { label: '上级部门负责人', value: 2 }, { label: '三级部门负责人', value: 3 }, { label: '四级部门负责人', value: 4 }, { label: '五级部门负责人', value: 5 }
]
const options = [
    { label: '流转到下一节点', value: 0 },
    { label: '转交给指定人员', value: 1 },
]
const ruleoptions = [
    { label: '或签', value: 0 },
    { label: '会签', value: 1 },
]
const symboloptions = [
    { label: '>', value: '>' },
    { label: '>=', value: '>=' },
]
const autoOptionList = [
    { label: '与流程发起人一致', value: 0 },
    { label: '审批人处理过该流程', value: 1 },
    { label: '与上一节点审批人一致', value: 2 }
]

const changeButton = () => {
    batchNodeRef.value.showItem()
}
</script>

<style lang="scss" scoped>
@use "@/styles/form-designer.scss";

.form-item-body {
    width: 100%;
}
</style>
