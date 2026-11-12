<template>
    <div class="app-manage-modal">
        <a-modal
            v-model:visible="visible"
            :hide-title="true"
            :footer="false"
            unmount-on-close
            width="860px"
            :mask-closable="false"
            modal-class="app-manage-modal-wrap"
            @cancel="handleCancel"
        >
            <div class="app-manage-panel">
                <div class="app-manage-header import-header">
                    <h3>应用管理</h3>
                    <button type="button" class="import-close" @click="handleCancel">
                        <icon-close />
                    </button>
                </div>

                <div class="app-manage-body">
                    <div class="app-manage-sidebar">
                        <div
                            v-for="item in leftMenu"
                            :key="item.value"
                            class="app-menu-item"
                            :class="{ active: check === item.value }"
                            @click="clickItem(item.value)"
                        >
                            <component :is="item.icon" class="app-menu-icon" />
                            {{ item.title }}
                        </div>
                    </div>

                    <div
                        class="app-manage-content-wrap"
                        :class="check === 2 ? 'app-manage-content-wrap--access' : 'app-manage-scroll'"
                    >
                        <div class="app-manage-content">
                            <baseMsg
                                v-if="check === 1"
                                ref="baseMsgRef"
                                :appdes="appdes"
                                @handle-cancel="handleCancel"
                            />
                            <clear
                                v-if="check === 3 || check === 4 || check === 8"
                                ref="clearRef"
                                :appdes="appdes"
                                :check="check"
                                @handle-cancel="handleCancel"
                            />
                            <model v-if="check === 5" :appdes="appdes" @handle-cancel="handleCancel" />
                            <access
                                v-if="check === 2"
                                ref="accessRef"
                                :appdes="appdes"
                                :dept-lists="deptLists"
                                @handle-cancel="handleCancel"
                            />
                            <share v-if="check === 7" ref="shareRef" :appdes="appdes" @handle-cancel="handleCancel" />
                            <crossAppShare v-if="check === 10" ref="crossAppShareRef" :appdes="appdes" @handle-cancel="handleCancel" />
                            <clientSecret v-if="check === 9" ref="clientSecretRef" :appdes="appdes" @handle-cancel="handleCancel" />
                        </div>
                    </div>
                </div>

                <div class="app-manage-footer" v-if="check === 1 || check === 3 || check === 4 || check === 8 || check === 2 || check === 7 || check === 9 || check === 10">
                    <button type="button" class="modal-btn modal-btn-ghost" @click="handleCancel">取消</button>
                    <button type="button" class="modal-btn modal-btn-primary" @click="handleSubmit">提交</button>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, provide, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
    IconClose,
    IconFile,
    IconLock,
    IconPrinter,
    IconDelete,
    IconShareExternal,
    IconSwap,
    IconSafe,
    IconBranch,
} from '@arco-design/web-vue/es/icon'
import baseMsg from './baseMsg.vue'
import clear from './clear.vue'
import access from './access.vue'
import share from './share.vue'
import model from './model.vue'
import clientSecret from './clientSecret.vue'
import crossAppShare from './crossAppShare.vue'

const visible = ref(false)
const route = useRoute()
const props = defineProps<{
    appdes: any
    deptLists: any
}>()
const check = ref(1)
const baseMsgRef = ref()
const clearRef = ref()
const accessRef = ref()
const shareRef = ref()
const clientSecretRef = ref()
const crossAppShareRef = ref()

const getAppId = () => props.appdes?.id || route.query.id
provide('appId', getAppId)

const REPORT_CATEGORY = 3
const HIDDEN_MENU_FOR_REPORT = [5]

const allMenuItems = [
    { title: '基本信息', value: 1, icon: IconFile },
    { title: '访问限制', value: 2, icon: IconLock },
    { title: '表单打印', value: 5, icon: IconPrinter },
    { title: '公网配置', value: 7, icon: IconShareExternal },
    { title: '跨应用共享数据', value: 10, icon:IconBranch,},
    { title: '应用转让', value: 8, icon: IconSwap },
    { title: '应用密钥', value: 9, icon: IconSafe },
    { title: '应用销毁', value: 4, icon: IconDelete },
]

const leftMenu = computed(() => {
    if (props.appdes?.category === REPORT_CATEGORY) {
        return allMenuItems.filter((item) => !HIDDEN_MENU_FOR_REPORT.includes(item.value))
    }
    return allMenuItems
})

const showItem = () => {
    if (
        props.appdes?.category === REPORT_CATEGORY &&
        HIDDEN_MENU_FOR_REPORT.includes(check.value)
    ) {
        check.value = 1
    }
    visible.value = true
}

const handleCancel = () => {
    visible.value = false
    check.value = 1
    provideState.getAppDes()
}

const handleSubmit = () => {
    if (check.value === 1) {
        baseMsgRef.value?.formSubmit()
    } else if (check.value === 3 || check.value === 4 || check.value === 8) {
        clearRef.value?.formSubmit()
    } else if (check.value === 2) {
        accessRef.value?.formSubmit()
    } else if (check.value === 7) {
        shareRef.value?.formSubmit()
    } else if (check.value === 9) {
        clientSecretRef.value?.formSubmit()
    } else if (check.value === 10) {
        crossAppShareRef.value?.formSubmit()
    }
}

const provideState = inject('provideServer') as {
    getAppDes: (...args: any) => void
}

const clickItem = (data: number) => {
    check.value = data
}

defineExpose({
    showItem,
})
</script>

<style lang="scss">
.app-manage-modal-wrap {
    .arco-modal {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }

    .arco-modal-header {
        display: none;
    }

    .arco-modal-body {
        padding: 0 !important;
        overflow: hidden !important;
        max-height: none !important;
    }

    .arco-modal-footer {
        display: none;
    }
}
</style>

<style lang="scss" scoped>
@use "@/styles/app-manage.scss" as appManage;
@media screen and (max-height: 1600px) {
.app-manage-panel {
 
    max-height: 1080px !important;
}

}

.app-manage-panel {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    min-height: 480px;
    background: #fff;
}

.import-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px 16px;
    border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0;

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
    }
}

.import-close {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: #f8fafc;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background: #f1f5f9;
        color: #334155;
    }

    :deep(.arco-icon) {
        font-size: 16px;
    }
}

.app-manage-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.app-manage-sidebar {
    width: 180px;
    flex-shrink: 0;
    background: #f8fafc;
    border-right: 1px solid #f1f5f9;
    padding: 16px 0;
    overflow: hidden;
}

.app-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 20px;
    font-size: 13px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;
    border-left: 3px solid transparent;

    &:hover {
        background: #f1f5f9;
        color: #334155;
    }

    &.active {
        background: #eff6ff;
        color: #2563eb;
        border-left-color: rgb(var(--primary-6));
        font-weight: 600;

        .app-menu-icon {
            color: #2563eb;
        }
    }
}

.app-menu-icon {
    font-size: 14px;
    flex-shrink: 0;
    color: inherit;
}

.app-manage-content-wrap {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
}

.app-manage-scroll {
    @include appManage.app-manage-scrollbar;
}

.app-manage-content-wrap--access {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .app-manage-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        height: 100%;
    }
}

.app-manage-content {
    min-height: min-content;
}

.app-manage-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 36px;
    border-top: 1px solid #f1f5f9;
    background: #fff;
    flex-shrink: 0;
}

.modal-btn {
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    white-space: nowrap;
}

.modal-btn-ghost {
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;

    &:hover {
        background: #f1f5f9;
        color: #475569;
    }
}

.modal-btn-primary {
    background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
    color: #fff;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);

    &:hover {
        opacity: 0.92;
    }
}
</style>
