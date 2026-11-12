<template>
    <div class="selectTables">
        <div class="selectTables-item">
            <a-select allow-clear placeholder="请选择" @change="changeFormId()" v-model="activeForm.props.formId" allow-search
                :options="options">
            </a-select>
        </div>
        <div class="form-item">
            <div class="form-item-title">
                查询字段
            </div>
            <div class="form-item-body">
                <a-select allow-clear placeholder="请选择查询字段" multiple @change="changeFieldList()" v-model="fieldLists" allow-search
                    :options="fieldList">
                </a-select>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router'
import {
    fetchRelationApps,
    loadFormFieldMeta,
    fieldsToSelectOptions,
} from '@/utils/relationFormFields';

const fieldLists = ref<string[]>([])
const props = defineProps<{
    activeForm: any;
    formData: any;
    formConfs: any
    deptList: any;
}>();
const route = useRoute()
const category = ref(1)
const emits = defineEmits(['setTableList'])
const options = ref<{ label: string; value: string; id: string }[]>([])
const fieldList = ref<{ label: string; value: string }[]>([])

const loadFieldsForForm = async (appId: string) => {
    const { fields, category: cat } = await loadFormFieldMeta(appId)
    category.value = cat
    fieldList.value = fieldsToSelectOptions(fields)
}

const getDataList = async () => {
    const { flat } = await fetchRelationApps(route.query.id as string)
    options.value = flat.map((v) => ({
        label: v.appName,
        value: v.formId,
        id: v.appId,
    }))
    fieldList.value = []
    fieldLists.value = []

    if (props.activeForm.props.formId) {
        const matched = options.value.find(v => v.value == props.activeForm.props.formId)
        if (matched) {
            await loadFieldsForForm(matched.id)
        }
    }
    if (props.activeForm.props.fieldList) {
        fieldLists.value = props.activeForm.props.fieldList.map((v: any) => JSON.stringify(v))
    }
}

watch(
    () => props.activeForm.id,
    () => {
        getDataList()
    },
    { immediate: true },
);

const changeFieldList = () => {
    emits('setTableList', fieldLists.value, fieldList.value)
}

const changeFormId = async () => {
    if (!props.activeForm.props.formId) {
        return
    }
    fieldList.value = []
    fieldLists.value = []
    const matched = options.value.find(v => v.value == props.activeForm.props.formId)
    if (!matched) return
    await loadFieldsForForm(matched.id)
    emits('setTableList', fieldLists.value, fieldList.value)
}
</script>
<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.form-item {
    margin-bottom: 18px;
}

.selectTables-item {
    margin-bottom: 10px;
}

.form-item-title {
    color: #949495;
    font-size: 12px;
    line-height: 32px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>
