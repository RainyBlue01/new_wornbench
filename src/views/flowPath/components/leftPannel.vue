<template>
    <div class="leftPannel">
        <div class="flow-version-header">
            <span class="flow-version-title">
                <i class="fas fa-code-branch" aria-hidden="true" />流程版本
            </span>
            <!-- <button type="button" class="flow-version-new-btn" @click="handleNewVersion">
                <i class="fas fa-plus" aria-hidden="true" /> 新建
            </button> -->
        </div>
        <div class="flow-version-list">
            <div
                v-for="(item, index) in pannelList"
                :key="item.id || index"
                class="flow-version-item"
                :class="{ active: activeIndex === index }"
                @click="selectVersion(item, index)"
            >
                <div
                    class="flow-version-icon"
                    :class="getVersionIconClass(item, index)"
                >
                    <i :class="getVersionIcon(item, index)" aria-hidden="true" />
                </div>
                <div class="flow-version-info">
                    <div class="flow-version-name">
                        {{ item.processName || '流程' }} V{{ item.version }}
                    </div>
                    <div class="flow-version-meta">{{ getVersionMeta(item, index) }}</div>
                </div>
                <span
                    v-if="getVersionBadge(item, index)"
                    class="flow-version-badge"
                    :class="getVersionBadgeClass(item, index)"
                >
                    {{ getVersionBadge(item, index) }}
                </span>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { inject, ref } from "vue";
import { Modal, Message } from "@arco-design/web-vue";

const props = defineProps<{
    pannelList: any[]
}>()

const provideState = inject<any>("provideDesigner")
const activeIndex = ref(0)

const getVersionIconClass = (_item: any, index: number) => {
    if (index === 0) return 'flow-version-icon--current'
    if (_item?.published || _item?.status === 'published') return 'flow-version-icon--published'
    return 'flow-version-icon--history'
}

const getVersionIcon = (_item: any, index: number) => {
    if (index === 0) return 'fas fa-pen'
    if (_item?.published || _item?.status === 'published') return 'fas fa-check'
    return 'fas fa-history'
}

const getVersionMeta = (item: any, index: number) => {
    if (index === 0) return '编辑中 · 当前版本'
    if (item?.published || item?.status === 'published') {
        return `已发布${item.updateTime ? ` · ${item.updateTime}` : ''}`
    }
    return `历史版本${item.updateTime ? ` · ${item.updateTime}` : ''}`
}

const getVersionBadge = (_item: any, index: number) => {
    if (index === 0) return '当前'
    if (_item?.published || _item?.status === 'published') return '已发布'
    return ''
}

const getVersionBadgeClass = (_item: any, index: number) => {
    if (index === 0) return 'flow-version-badge--current'
    return 'flow-version-badge--published'
}

const handleNewVersion = () => {
    Message.info('新建版本功能开发中')
}

const selectVersion = (item: any, index: number) => {
    if (index === activeIndex.value) return
    Modal.confirm({
        title: "提示",
        simple: true,
        renderToBody: false,
        titleAlign: "start",
        popupContainer: "#job",
        content: `确定要使用该流程吗？`,
        hideCancel: false,
        okText: "确认",
        onOk: async () => {
            activeIndex.value = index
            const configure = JSON.parse(item.configure)
            const startNode = configure.nodes.find((node: any) => node.type == "START")
            provideState.setProcess(startNode)
        },
    });
}
</script>

<style lang="scss">
.arco-modal-simple .arco-modal-footer {
    text-align: right;
}
</style>
