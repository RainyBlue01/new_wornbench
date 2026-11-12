<template>
    <div class="app-manage-page cross-app-share">
        <h2 class="app-manage-page-title">跨应用共享数据</h2>
        <p class="app-manage-page-desc">设置当前应用数据共享给其他应用，实现数据互通。</p>

        <div class="app-manage-form">
            <a-form ref="refChangeForm" :style="{ width: '100%' }" :model="formData" :rules="rules" layout="vertical"
                scroll-to-first-error>
                <a-form-item field="targetApps" label="选择目标应用">
                    <div class="target-apps-wrapper">
                        <div class="target-apps-title">
                            <a-input v-model="searchKeyword" placeholder="搜索应用..." class="search-input" allow-clear>
                                <template #prefix>
                                    <IconSearch />
                                </template>
                            </a-input>
                        </div>


                        <div class="app-list app-manage-inner-scroll">
                            <a-checkbox-group v-model="formData.targetApps" direction="vertical">
                                <a-checkbox v-for="app in filteredApps" :key="app.appId" :value="app.appId"
                                    class="app-checkbox-item">
                                    {{ app.appName }}
                                </a-checkbox>
                            </a-checkbox-group>

                            <div v-if="filteredApps.length === 0" class="empty-state">
                                <p>暂无匹配的应用</p>
                            </div>
                        </div>
                    </div>
                </a-form-item>
            </a-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'
import { setCrossAppShare, getCrossAppShare, listByRelation } from '@/api/homePage/index'

const refChangeForm = ref()
const route = useRoute()

const getAppId = inject('appId', () => route.query.id) as () => any

const props = defineProps<{
    appdes: any
}>()

const emits = defineEmits(['handleCancel'])

interface AppItem {
    appId: string | number
    appName: string
}

interface FormDataType {
    targetApps: (string | number)[]
}

const formData = reactive<FormDataType>({
    targetApps: []
})

const searchKeyword = ref('')
const appList = ref<AppItem[]>([])

const filteredApps = computed(() => {
    if (!searchKeyword.value) {
        return appList.value
    }
    const keyword = searchKeyword.value.toLowerCase()
    return appList.value.filter(app =>
        app.appName.toLowerCase().includes(keyword)
    )
})

const rules = ref({
    targetApps: [
        {
            validator: (value: any) => {
                if (value && value.length === 0) {
                    return Promise.resolve()
                }
                return Promise.resolve()
            }
        }
    ]
})

const loadAppList = async () => {
    if (!getAppId()) return
    try {


        const res = await getCrossAppShare(getAppId())
        appList.value = res || []
        res.forEach((item: any) => {
            if (item.shared === true) {
                formData.targetApps.push(item.appId)
            }
        })


    } catch (error) {
        console.error('加载应用列表失败:', error)
    }
}

const handClear = () => {
    formData.targetApps = []
    emits('handleCancel')
}

const formSubmit = () => {
    refChangeForm.value.validate((error: any) => {
        if (!error) {
            const params = {
                appId: getAppId(),
                shareAppIds: formData.targetApps
            }
            setCrossAppShare(params, getAppId()).then(() => {
                Message.success('修改成功')
                handClear()
            }).catch((err: any) => {
                // Message.error(err.message || '操作失败')
            })
        }
    })
}

onMounted(() => {
    loadAppList()
})

defineExpose({
    formSubmit,
    handClear
})
</script>

<style lang="scss" scoped>
@use "@/styles/app-manage.scss" as appManage;

.cross-app-share {
    .app-manage-page-title {
        margin-bottom: 8px;
    }

    .app-manage-page-desc {
        margin-bottom: 20px;
        font-size: 13px;
        color: #64748b;
    }

    .target-apps-wrapper {
        width: 100%;
        border: 1px solid #e2e8f0;
        border-radius: 8px;

        .target-apps-title {
            border-radius: 8px 8px 0 0;
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
            background: #f8fafc;
        }
    }

    .search-input {
        width: 100%;
    }

    .app-list {
        max-height: 240px;
        overflow-y: auto;
        // padding: 8px;
        border-radius: 8px;
        scrollbar-color: rgba(148, 163, 184, 0.8) transparent;
    }

    :deep(.arco-checkbox-group) {
        width: 100%;
    }

    .app-checkbox-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        transition: all 0.15s;
        margin: 0;
        border-radius: 8px;

        &:hover {
            background: #F8FAFC;
        }

        &:deep(.arco-checkbox-wrapper) {
            margin-right: 8px;
        }

        &:deep(.arco-checkbox-label) {
            font-size: 14px;
            color: #1d2129;
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #86909c;

        p {
            margin: 0;
            font-size: 14px;
        }
    }
}
</style>
