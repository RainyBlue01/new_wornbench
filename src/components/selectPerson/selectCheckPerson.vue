<template>
    <div class="selectPerson">
        <div class="select" :class="{ 'is-disabled': comDes.props.disabled }" @click="changeItem">
            <a-tag v-for="(name, index) of userList" :key="index">
                <div class="tag">
                    <div class="tag-name">
                        {{ name.nickname }}
                    </div>
                    <div class="close" v-if="!comDes.props.disabled" @click.stop="closeItem(index)">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <div class="placeholder" v-if="!comDes.props.disabled && userList.length === 0">
                {{ placeholder }}
            </div>
        </div>
        <selectModel ref="selectModelRef" :formConfs="formConfs" :comDes="comDes" @setData="setData" :title="title" :deptList="deptList" />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed ,inject} from 'vue'
import selectModel from './components/selectModel.vue'
const props = defineProps({
    formConfs: { type: Object, default: () => ({}) },
    comDes: { type: Object, default: () => ({ props: {} }) },
    modelValue: { type: Array, default: () => [] },
    placeholder: { type: String, default: '选择人员' },
    title: { type: String, default: '选择人员' },
    deptList: { type: Array, default: () => [] },
});
const selectModelRef = ref()
const emit = defineEmits(["update:modelValue"]);
let userList = computed({
    get() {
        return props.modelValue ?? [];
    },
    set(val: any) {
        emit("update:modelValue", val);
    },
});
const provideState = inject<{ filterData?: (...args: any) => void } | null>("provideDesigner", null);
const closeItem = (index: number) => {
     if(props.comDes.props.disabled){
        return ''
    }
    userList.value.splice(index, 1)
     provideState?.filterData?.(props.comDes)
}
const changeItem = () => {
      if(props.comDes.props.disabled){
        return ''
    }
    selectModelRef.value.showItem(userList.value)
}
const setData = (val: any) => {
    userList.value = val
     provideState?.filterData?.(props.comDes)
}
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss" as personModal;

.selectPerson {
    width: 100%;
}

.tag {
    display: flex;
    align-items: center;
    color: #334155;
    font-size: 13px;

    .close {
        margin-left: 4px;
        cursor: pointer;
        color: #94a3b8;

        &:hover {
            color: #64748b;
        }
    }
}

.select {
    @include personModal.dsp-org-trigger;

    .placeholder {
        font-size: 13px;
        color: #cbd5e1;
          margin-left: 8px;
        line-height: 26px;
    }

    &.is-disabled {
        background: #f8fafc !important;
        cursor: not-allowed;

        &:hover,
        &:focus-within {
            background: #f8fafc !important;
            border-color: #e2e8f0 !important;
            box-shadow: none !important;
        }

        :deep(.arco-tag) {
            background: transparent !important;
        }

        .tag,
        .placeholder {
            color: #94a3b8;
        }
    }
}
</style>
