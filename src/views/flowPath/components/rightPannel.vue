<template>
    <aside class="form-designer-sidebar-right right">
        <div class="form-designer-right-tabs">
            <button
                v-if="activeFlew.type !== 'END'"
                type="button"
                class="form-designer-right-tab"
                :class="{ 'form-designer-right-tab--active': active === 1 }"
                @click="active = 1"
            >
                节点设置
            </button>
            <button
                type="button"
                class="form-designer-right-tab"
                :class="{ 'form-designer-right-tab--active': active === 2 }"
                @click="active = 2"
            >
                扩展配置
            </button>
        </div>
        <div class="form-designer-right-body form">
            <template v-if="active === 1">
                <attribute
                    v-for="(item, index) in activeFlew.attribute"
                    :key="index"
                    :roleList="roleList"
                    :deptList="deptList"
                    :postList="postList"
                    :activeFlew="activeFlew"
                    :form-list="formList"
                    :formData="item"
                />
            </template>

            <a-collapse v-if="active === 2" :bordered="false" class="flow-extend-collapse">
                <a-collapse-item
                    header="消息通道"
                    v-if="activeFlew.type === 'INPUT' || activeFlew.type === 'NOTICE' || activeFlew.type === 'APPROVE' || activeFlew.type === 'END'"
                    key="1"
                >
                    <msgNotice
                        :activeFlew="activeFlew"
                        :deptList="deptList"
                        :roleList="roleList"
                        :postList="postList"
                    />
                </a-collapse-item>
                <a-collapse-item header="节点限时" :key="2" v-if="activeFlew.type === 'APPROVE'">
                    <nodeTimeLimit
                        :activeFlew="activeFlew"
                        :deptList="deptList"
                        :roleList="roleList"
                        :postList="postList"
                    />
                </a-collapse-item>
                <a-collapse-item header="插件管理" key="3">
                    <div class="body">
                        <empty-box />
                    </div>
                </a-collapse-item>
            </a-collapse>
        </div>
    </aside>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import attribute from './attribute.vue'
import msgNotice from './msgNotice.vue'
import nodeTimeLimit from './nodeTimeLimit.vue'

const active = ref(1)
const props = defineProps<{
    activeFlew: any,
    deptList: any,
    roleList: any,
    postList: any
    formList: any[]
}>()

watch(() => props.activeFlew.type, (newVal) => {
    if (newVal === 'END') {
        active.value = 2
    } else {
        active.value = 1
    }
}, { immediate: true })
</script>

<style lang="scss" scoped>
@use "@/styles/form-designer.scss";

:deep(.flow-extend-collapse) {
    .arco-collapse-item-header {
        font-size: 13px;
        font-weight: 500;
        color: #334155;
        padding: 12px 32px 12px 0;
        background: transparent;
    }

    .arco-collapse-item-content {
        background: #fff;
        padding: 0 0 12px;
    }
    .arco-collapse-item-icon-hover{
        right:0px !important;
        left:auto !important;
    }
}

.body {
    height: 500px;
}
</style>
