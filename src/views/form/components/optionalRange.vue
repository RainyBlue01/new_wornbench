<template>
    <div class="optionalRange">
        <div class="optionalRange-item"
            v-if="!activeForm.props.currentUserDept && !activeForm.props.currentUserMainDept && !activeForm.props.currentUserSecondaryDept && !activeForm.props.currentUserLowerDept">
            <a-select allow-clear placeholder="请选择" v-model="activeForm.props.rangeType" :options="options">
            </a-select>
        </div>
        <div class="optionalRange-item"
            v-if="activeForm.props.rangeType == 'CUSTOM' && !activeForm.props.currentUserDept && !activeForm.props.currentUserMainDept && !activeForm.props.currentUserSecondaryDept && !activeForm.props.currentUserLowerDept">
            <selectCheckDept v-model="activeForm.props.range" :comDes="activeForm" :deptList="deptList"
                :restrict-to-range="false" />
        </div>
        <div class="optionalRange-item"
            v-if="activeForm.props.rangeType == 'DEPT_FIELD' && !activeForm.props.currentUserDept && !activeForm.props.currentUserMainDept && !activeForm.props.currentUserSecondaryDept && !activeForm.props.currentUserLowerDept">
            <a-radio-group direction="vertical" v-model="activeForm.props.deptField">
                <a-radio :value="item.id" v-show="item.type == 'DEPT' || item.type == 'DEPT_MULTIPLE'"
                    v-for="item in formConfs.formList">{{ item.title }}</a-radio>
            </a-radio-group>
        </div>
        <div class="optionalRange-item"
            v-show="(activeForm.type == 'USER' || activeForm.type == 'USER_MULTIPLE') && activeForm.props.rangeType == 'CUSTOM'">
            <a-checkbox class="show-item" v-model="activeForm.props.currentUserDept">当前用户</a-checkbox>
        </div>
        <div class="optionalRange-item"
            v-show="(activeForm.type == 'DEPT' || activeForm.type == 'DEPT_MULTIPLE') && activeForm.props.rangeType == 'CUSTOM'">
            <a-checkbox v-model="activeForm.props.currentUserMainDept"
                :disabled="activeForm.props.currentUserLowerDept || activeForm.props.currentUserSecondaryDept">当前用户主要部门</a-checkbox>
        </div>
        <div class="optionalRange-item"
            v-show="(activeForm.type == 'DEPT' || activeForm.type == 'DEPT_MULTIPLE') && activeForm.props.rangeType == 'CUSTOM'">
            <a-checkbox v-model="activeForm.props.currentUserSecondaryDept"
                :disabled="activeForm.props.currentUserLowerDept || activeForm.props.currentUserMainDept">当前用户兼任部门</a-checkbox>
        </div>
        <div class="optionalRange-item"
            v-show="(activeForm.type == 'DEPT' || activeForm.type == 'DEPT_MULTIPLE') && activeForm.props.rangeType == 'CUSTOM'">
            <a-checkbox v-model="activeForm.props.currentUserLowerDept"
                :disabled="activeForm.props.currentUserMainDept || activeForm.props.currentUserSecondaryDept">当前用户所处部门及下级部门</a-checkbox>
        </div>
        <div class="form-item"
            v-if="activeForm.props.rangeType == 'CUSTOM' && !activeForm.props.currentUserDept && !activeForm.props.currentUserSecondaryDept && !activeForm.props.currentUserMainDept && !activeForm.props.currentUserLowerDept">
            <div class="form-item-title">
                <div class="left">
                    默认值
                </div>
            </div>
            <div class="form-item-body">
                <component :is="formData.component" :formConfs="formConfs" :comDes="activeForm"
                    v-model="activeForm.props.defaultValue" :deptList="deptList"
                    :placeholder="activeForm.props.placeholder" />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { getFormById } from '@/utils/form';
import { useRoute } from 'vue-router';
const route = useRoute();
// const formList = ref<any>(getFormById(route.query.id));
const props = defineProps<{
    activeForm: any;
    formData: any;
    formConfs: any
    deptList: any;
    options: any;
}>();
</script>
<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.form-item {
    margin-bottom: 18px;
}

.optionalRange-item {
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
