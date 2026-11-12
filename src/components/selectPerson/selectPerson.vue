<template>
    <div class="selectPerson">
        <div class="select" @click="changeItem">
            <div class="placeholder" v-if="userList.length === 0">
                {{ placeholder }}
            </div>
            <a-tag v-for="(name, index) of userList" :key="index">
                <div class="tag">
                    <div class="tag-name">
                        {{ name?.nickname }}
                    </div>
                    <div class="close" @click.stop="closeItem(Number(index))">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
        </div>
        <selectModel
            ref="selectModelRef"
            @setData="setData"
            :title="title"
            :dept-list="deptList"
            :modal-class="modalClass"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import selectModel from './components/selectModelPerson.vue'
const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    placeholder: { type: String, default: '选择人员' },
    title: { type: String, default: '选择人员' },
    deptList: { type: Array, default: () => [] },
    modalClass: { type: String, default: '' },
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
const setDatas = (data: any) => {
    if (data.nickname) {
        return data.nickname
    } else {
        return data.label
    }
}

const closeItem = (index: number) => {
    userList.value.splice(index, 1)
}
const changeItem = () => {
    selectModelRef.value.showItem(userList.value)
}
const setData = (val: any) => {
    userList.value = val
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
}
</style>
