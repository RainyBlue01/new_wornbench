<template>
    <div class="selectPerson">
        <div class="select" :class="{ 'is-disabled': isDisabled }" @click="changeItem">
            <a-tag v-for="(name, index) of userList" :key="index">
                <div class="tag">
                    <div class="tag-name">
                        {{ name.label }}
                    </div>
                    <div class="close" v-if="!isDisabled" @click.stop="closeItem(index)">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <div class="placeholder" v-if="!isDisabled && userList.length === 0">
                {{ props.placeholder }}
            </div>
        </div>
        <selectDept
            :comDes="props.comDes"
            :restrict-to-range="props.restrictToRange"
            ref="selectModelRef"
            @setData="setData"
            :title="props.title"
            :deptList="props.deptList"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, inject } from 'vue'
import selectDept from './components/selectDept.vue'



const props = defineProps({
    comDes: { type: Object, default: () => ({ props: {} }) },
    modelValue: { type: Array, default: () => [] },
    placeholder: { type: String, default: '选择部门' },
    title: { type: String, default: '选择部门' },
    deptList: { type: Array, default: () => [] },
    restrictToRange: { type: Boolean, default: true },
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
const provideState = inject("provideDesigner") as {
    filterData: (...args: any) => void;
};
const isDisabled = computed(() => Boolean(props.comDes?.props?.disabled))

const closeItem = (index: number) => {
    if (isDisabled.value) {
        return ''
    }
    userList.value.splice(index, 1)
    provideState?.filterData?.(props.comDes)
}
const changeItem = () => {
    if (isDisabled.value) {
        return ''
    }
    selectModelRef.value?.showItem(userList.value)
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
        -webkit-text-fill-color: var(--color-text-1);

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
