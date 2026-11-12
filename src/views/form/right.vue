<template>
    <aside class="form-designer-sidebar-right right">
        <div class="form-designer-right-tabs">
            <button type="button" class="form-designer-right-tab"
                :class="{ 'form-designer-right-tab--active': active == 1 }" @click="active = 1">
                组件属性
            </button>
            <button type="button" class="form-designer-right-tab"
                :class="{ 'form-designer-right-tab--active': active == 2 }" @click="active = 2">
                表单属性
            </button>
        </div>
        <div class="form-designer-right-body form" v-if="active == 1 && hasActiveComponentAttributes">
            <attribute :deptList="deptList" v-for="(item, index) in activeForm.attribute" :activeForm="activeForm"
                :tableList="tableList" :formConfs="formConfs" :formData="item" :key="index" />
        </div>
        <div class="form-designer-right-body form-designer-right-body--empty" v-else-if="active == 1">
            <emptyBox embedded desc="请选择表单组件" />
        </div>
        <div class="form-designer-right-body form" v-if="active == 2">
            <div class="form-designer-prop-group form-item">
                <label class="form-designer-prop-label">表单页面宽度</label>
                <a-input-group :style="{ width: '100%' }">
                    <a-select :style="{ width: '88px', marginRight: '8px' }" @change="changeWidthType"
                        v-model="formConfs.widthType" placeholder="固定">
                        <a-option value="fixed">固定</a-option>
                        <a-option value="scale">百分比例</a-option>
                    </a-select>
                    <a-input-number :style="{ width: 'calc(100% - 96px)' }"
                        :min="formConfs.widthType == 'fixed' ? 720 : 50"
                        :max="formConfs.widthType == 'fixed' ? 1200 : 100" v-model="formConfs.width"
                        placeholder="720" />
                </a-input-group>
                <p class="form-designer-prop-hint">手机端页面宽度默认为100%</p>
            </div>
            <div class="form-designer-prop-group form-item">
                <label class="form-designer-prop-label">表单标签显示位置</label>
                <a-select :style="{ width: '100%' }" v-model="formConfs.titleStyle" placeholder="字段名称">
                    <a-option value="horizontal">左</a-option>
                    <a-option value="vertical">上</a-option>
                    <a-option value="hide">隐藏</a-option>
                </a-select>
            </div>
            <div class="form-designer-prop-group form-item">
                <div class="form-designer-prop-header">
                    <label class="form-designer-prop-label">表单逻辑规则</label>
                    <span class="form-designer-prop-link" @click="setLogics">
                        <icon-plus /> 新增逻辑规则
                    </span>
                </div>
                <div class="form-designer-prop-card" @click="setLogics">
                    <span>{{ formConfs.formLogic || '当前表单暂无逻辑规则' }}</span>
                    <icon-edit class="prop-card-icon" />
                </div>
            </div>
            <!-- <div class="form-designer-prop-group form-item">
                <div class="form-designer-prop-header">
                    <label class="form-designer-prop-label">表单事件</label>
                    <span class="form-designer-prop-link" @click="setEvents">
                        <icon-plus /> 新增事件
                    </span>
                </div>
                <div class="form-designer-prop-card" @click="setEvents">
                    <span>{{ eventSummary }}</span>
                    <icon-edit class="prop-card-icon" />
                </div>
            </div> -->
            <div class="form-designer-prop-group form-item">
                <div class="form-designer-prop-toggle">
                    <span class="form-designer-prop-toggle-label">提交时记录IP</span>
                    <a-switch v-model="formConfs.subIp" />
                </div>
            </div>
            <div class="form-designer-prop-group form-item">
                <div class="form-designer-prop-toggle">
                    <span class="form-designer-prop-toggle-label">表单提交按钮</span>
                    <a-switch v-model="formConfs.subEnable" />
                </div>
                <a-input v-if="formConfs.subEnable" :style="{ width: '100%', marginTop: '8px' }"
                    v-model="formConfs.subText" placeholder="请输入表单提交按钮文案" allow-clear />
            </div>
            <div class="form-designer-prop-group form-item">
                <div class="form-designer-prop-toggle">
                    <span class="form-designer-prop-toggle-label">保存草稿</span>
                    <a-switch v-model="formConfs.draftBox" />
                </div>
            </div>
        </div>
        <create ref="createRef" :deptList="deptList" :formList="tableList" :formConfs="formConfs" />
        <FormEventManager ref="eventManagerRef" :form-confs="formConfs" :form-list="formList" />
    </aside>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
import create from './components/create.vue';
import attribute from './components/attribute.vue'
import emptyBox from '@/components/emptyBox/emptyBox.vue'
import FormEventManager from './components/FormEventManager.vue'
const active = ref(1)
const createRef = ref()
const eventManagerRef = ref<InstanceType<typeof FormEventManager>>()
const tableList = ref([])
const props = defineProps<{
    activeForm: any,
    formList: any,
    formConfs: any,
    deptList: any
}>()
const hasActiveComponentAttributes = computed(() =>
    !!(props.activeForm?.id && props.activeForm?.attribute?.length),
)
const eventSummary = computed(() => {
    const count = Array.isArray(props.formConfs?.formEvents) ? props.formConfs.formEvents.length : 0
    return count ? `当前表单${count}个事件` : '当前表单0个事件'
})
const changeWidthType = () => {
    props.formConfs.width = props.formConfs.widthType == 'fixed' ? 720 : 90
}
const setData = (list: any) => {
    list.map((v: any) => {
        tableList.value.push(v)
        if (v.children) {
            setData(v.children)
        }
    })
}
const setLogics = () => {
    tableList.value = []
    setData(props.formList)
    setTimeout(() => {
        createRef.value.showItem()
    }, 100)
}
const setEvents = () => {
    eventManagerRef.value?.open()
}
</script>
<style lang="scss" scoped>
@use "@/styles/form-designer.scss";

.form-designer-right-body--empty {
    display: flex;
    flex: 1;
    min-height: 0;
    align-items: center;
    justify-content: center;
}

.prop-card-icon {
    font-size: 12px;
    color: #94a3b8;
}
</style>
