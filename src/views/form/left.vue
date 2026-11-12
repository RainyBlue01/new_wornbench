<template>
    <aside class="form-designer-sidebar-left left">
        <div class="form-designer-sidebar-search">
            <a-input v-model="searchKeyword" placeholder="搜索组件..." allow-clear />
        </div>
        <div class="form-designer-component-list components-list">
            <div v-for="(group, listIndex) in filteredComponents" :key="listIndex"
                class="form-designer-component-group">
                <div class="form-designer-component-group-title">
                    {{ group.title }}
                </div>
                <draggable class="components-draggable" :animation="200" :clone="cloneComponent" :sort="false"
                    :list="group.list" :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
                    draggable=".form-designer-component-item">
                    <div class="form-designer-component-item components-item" v-for="comp in group.list"
                        :key="comp.type + comp.title"
                        :id="comp.type == 'ROW' || comp.type == 'SUBFORM' || comp.type == 'TITLE' || comp.type == 'JSON_SCHEMA' || comp.type == 'SPLIT_LINE' || comp.type == 'HR' || comp.type == 'BUTTON_CONNECTOR' ? 'other' : comp.type == 'ROW' ? 'others' : ''"
                        @click="appendComponent(comp)">
                        <i :class="getComponentIcon(comp.type)" aria-hidden="true" />
                        {{ comp.title }}
                    </div>
                </draggable>
            </div>
        </div>
    </aside>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
import { inputComponents } from '@/data/form'
import { generate } from '@/utils/id';
import { nanoid } from 'nanoid';
import { VueDraggableNext as draggable } from 'vue-draggable-next'

const searchKeyword = ref('')
const tempActiveData = ref({})
const emit = defineEmits<{
    (e: 'append-component', item: any): void;
}>()

const componentIconMap: Record<string, string> = {
    INPUT: 'fas fa-font',
    TEXTAREA: 'fas fa-align-left',
    RADIO: 'fas fa-dot-circle',
    CHECKBOX: 'fas fa-check-square',
    SWITCH: 'fas fa-toggle-on',
    SELECT: 'fas fa-chevron-down',
    SELECT_MULTIPLE: 'fas fa-list',
    ATTACH: 'fas fa-paperclip',
    PICTURE: 'fas fa-image',
    EDITORS: 'fas fa-info-circle',
    PHONE: 'fas fa-phone',
    ID_CARD: 'fas fa-id-card',
    EMAIL: 'fas fa-envelope',
    NUMBER: 'fas fa-hashtag',
    MONEY: 'fas fa-yen-sign',
    DATE: 'fas fa-calendar',
    DATE_INTERVAL: 'fas fa-calendar-alt',
    TIME: 'fas fa-clock',
    TIME_INTERVAL: 'fas fa-clock',
    ADDRESS: 'fas fa-map-marker-alt',
    LOCATION: 'fas fa-map-pin',
    URL: 'fas fa-link',
    RATE: 'fas fa-star',
    JSON_SCHEMA: 'fas fa-code',
    SIGNATURE: 'fas fa-signature',
    SUBFORM: 'fas fa-table',
    RELATION_DATA: 'fas fa-database',
    RELATION_QUERY: 'fas fa-project-diagram',
    USER: 'fas fa-user',
    USER_MULTIPLE: 'fas fa-users',
    DEPT: 'fas fa-building',
    DEPT_MULTIPLE: 'fas fa-sitemap',
    ROW: 'fas fa-columns',
    TITLE: 'fas fa-heading',
    SPLIT_LINE: 'fas fa-minus',
    COL: 'fas fa-square',
}

const getComponentIcon = (type: string) => componentIconMap[type] || 'fas fa-cube'

const filteredComponents = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase()
    if (!keyword) return inputComponents

    return inputComponents
        .map((group) => ({
            ...group,
            list: group.list.filter((comp: { title: string }) =>
                comp.title.toLowerCase().includes(keyword),
            ),
        }))
        .filter((group) => group.list.length > 0)
})

const createIdAndKey = (item) => {
    item.id = generate()
    item.props.field = item.id
    if (item.type === 'ROW') {
        item.children.map(v => {
            v.id = generate()
            v.props.field = v.id
        })
    }
    if (item.props.options && item.type !== 'RATE') {
        item.props.options.push({ label: '选项一', value: nanoid(9) })
        item.props.options.push({ label: '选项二', value: nanoid(9) })
    }
    return item
}

const cloneComponent = (origin: any) => {
    tempActiveData.value = JSON.parse(JSON.stringify(origin))
    createIdAndKey(tempActiveData.value)
    return tempActiveData.value
}

const appendComponent = (origin: any) => {
    emit('append-component', cloneComponent(origin))
}
</script>
<style lang="scss" scoped>
@use "@/styles/form-designer.scss";
</style>
