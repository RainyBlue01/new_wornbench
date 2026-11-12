<template>
    <div class="selectPerson">
        <div class="select person-form-picker" @click="changeItem">
            <span v-if="!hasSelection" class="person-form-picker__placeholder">{{ displayPlaceholder }}</span>
            <a-tag v-for="(name, index) of formData.deptIds"  :key="'dept-' + index">
                <div class="tag">
                    <div class="tag-name">
                        {{ name?.label }}
                    </div>
                    <div class="close" @click.stop="closeItem(1, Number(index))">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <a-tag v-for="(name, index) of formData.postIds"  :key="index">
                <div class="tag">
                    <div class="tag-name">
                        {{ name?.postName }}
                    </div>
                    <div class="close" @click.stop="closeItem(2, Number(index))">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <a-tag v-for="(name, index) of formData.roleIds"  :key="index">
                <div class="tag">
                    <div class="tag-name">
                        {{ name?.roleName }}
                    </div>
                    <div class="close" @click.stop="closeItem(3, Number(index))">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <a-tag v-for="(name, index) of formData.userIds"  :key="index">
                <div class="tag">
                    <div class="tag-name">
                        {{ name?.nickname }}
                    </div>
                    <div class="close" @click.stop="closeItem(4, Number(index))">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <a-tag v-if="showDynamic && formData.dynamic?.deptFields?.length" v-for="(tag, index) in formData.dynamic.deptFields"  :key="tag.id"                @close="handleCloseDeptFields(Number(index))">
                <div class="tag">
                    <div class="tag-name">
                        {{ tag.title }}
                    </div>
                    <div class="close" @click.stop="closeItem(8, Number(index))">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <a-tag v-if="showDynamic && formData.dynamic?.userFields?.length" v-for="(tag, index) in formData.dynamic.userFields"  :key="tag.id">
                <div class="tag">
                    <div class="tag-name">
                        {{ tag.title }}
                    </div>
                    <div class="close" @click.stop="closeItem(9, Number(index))">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <a-tag v-if="showDynamic && formData.dynamic?.deptLeader?.level?.length" v-for="(tag, index) in formData.dynamic.deptLeader.level"   :key="tag.id">
                <div class="tag">
                    <div class="tag-name">
                        {{ tag.label }}
                    </div>
                    <div class="close" @click.stop="closeItem(5, Number(index))">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <a-tag v-if="showDynamic && formData.dynamic?.applyUser">
                <div class="tag">
                    <div class="tag-name">
                        流程发起人
                    </div>
                    <div class="close" @click.stop="closeItem(6, 0)">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
            <a-tag v-if="showDynamic && formData.dynamic?.chargeLeader?.level?.length" v-for="(tag, index) in formData.dynamic.chargeLeader.level"  :key="tag.id">
                <div class="tag">
                    <div class="tag-name">
                        {{ tag.label }}
                    </div>
                    <div class="close" @click.stop="closeItem(7, Number(index))">
                        <icon-close />
                    </div>
                </div>
            </a-tag>
        </div>
        <selectUser ref="selectModelRef" @setData="setData" :title="title" :roleList="roleList" :deptList="deptList"
            :postList="postList" :showDynamic="showDynamic" />
    </div>
</template>
  
<script lang="ts" setup>
import { ref, computed } from 'vue'
import selectUser from './components/selectUser.vue'
const props = defineProps({
    modelValue: { type: Object, default: {}},
    placeholder: { type: String, default: '选择人员' },
    deptList: { type: Array, default: [] },
    postList: { type: Array, default: [] },
    roleList: { type: Array, default: [] },
    title: { type: String, default: '选择人员' },
    showDynamic: { type: Boolean, default: true }, // 控制是否显示动态审批人
});
const selectModelRef = ref()
const emit = defineEmits(["update:modelValue"]);

const displayPlaceholder = computed(
    () => props.placeholder || (props.title ? `请选择${props.title}` : '选择人员'),
)

const hasSelection = computed(() => {
    const d = formData.value
    if (!d) return false
    if (d.deptIds?.length || d.postIds?.length || d.roleIds?.length || d.userIds?.length) {
        return true
    }
    if (!props.showDynamic || !d.dynamic) return false
    const dynamic = d.dynamic
    return !!(
        dynamic.deptFields?.length ||
        dynamic.userFields?.length ||
        dynamic.deptLeader?.level?.length ||
        dynamic.chargeLeader?.level?.length ||
        dynamic.applyUser
    )
})

let formData = computed({
    get() {
        return props.modelValue;
    },
    set(val: any) {
        emit("update:modelValue", val);
    },
});
const closeItem = (val: any, index: number) => {
    if (val == 1) {
        formData.value.deptIds.splice(index, 1)
    }
    if (val == 2) {
        formData.value.postIds.splice(index, 1)
    }
    if (val == 3) {
        formData.value.roleIds.splice(index, 1)
    }
    if (val == 4) {
        formData.value.userIds.splice(index, 1)
    }
    if (val == 5) {
        formData.value.dynamic.deptLeader.level.splice(index, 1)
    }
    if (val == 6) {
        formData.value.dynamic.applyUser = false
    }
    if (val == 7) {
        formData.value.dynamic.chargeLeader.level.splice(index, 1)
    }
     if (val == 8) {
        formData.value.dynamic.deptFields.splice(index, 1)
    }
     if (val == 9) {
        formData.value.dynamic.userFields.splice(index, 1)
    }
}
const handleCloseDeptFields = (index: number) => {
    formData.value.dynamic.deptFields.splice(index, 1)
}
const changeItem = () => {
    selectModelRef.value.showItem(formData.value)
}
const setData = (val: any) => {
    formData.value = val
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

    .person-form-picker__placeholder {
        font-size: 13px;
        color: #cbd5e1;
        margin-left: 8px;
        line-height: 26px;
    }
}
</style>

  