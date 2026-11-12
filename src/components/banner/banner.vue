<template>
    <header class="form-designer-header banner">
        <div class="form-designer-header__left">
            <button type="button" class="form-designer-back-btn" @click="linkTo">
                <icon-arrow-left />
                <span>返回</span>
            </button>
            <div class="form-designer-breadcrumb">
                <span>工作台</span>
                <span class="form-designer-breadcrumb__sep">/</span>
                <span class="form-designer-breadcrumb__current">{{ breadcrumbCurrent }}</span>
            </div>
        </div>

        <div v-if="route.query.type == '1'" class="form-designer-step-bar">
            <button type="button" class="form-designer-step-item"
                :class="{ 'form-designer-step-item--active': Number(active) === 1, 'form-designer-step-item--done': Number(active) > 1 }"
                @click="toSave(1)">
                <span class="form-designer-step-num">
                    <i v-if="Number(active) > 1" class="fas fa-check" aria-hidden="true" style="font-size: 9px;" />
                    <template v-else>1</template>
                </span>
                <span>设计表单</span>
            </button>
            <span class="form-designer-step-line" />
            <button type="button" class="form-designer-step-item"
                :class="{ 'form-designer-step-item--active': Number(active) === 2 }" @click="goPublish">
                <span class="form-designer-step-num">2</span>
                <span>发布应用</span>
            </button>
        </div>

        <div v-else-if="route.query.type == '2'" class="form-designer-step-bar">
            <button type="button" class="form-designer-step-item"
                :class="{ 'form-designer-step-item--active': Number(active) === 1, 'form-designer-step-item--done': Number(active) > 1 }"
                @click="toSave(1)">
                <span class="form-designer-step-num">
                    <i v-if="Number(active) > 1" class="fas fa-check" aria-hidden="true" style="font-size: 9px;" />
                    <template v-else>1</template>
                </span>
                <span>设计表单</span>
            </button>
            <span class="form-designer-step-line" />
            <button type="button" class="form-designer-step-item"
                :class="{ 'form-designer-step-item--active': Number(active) === 2, 'form-designer-step-item--done': Number(active) > 2 }"
                @click="toSave(2)">
                <span class="form-designer-step-num">2</span>
                <span>设计流程</span>
            </button>
            <span class="form-designer-step-line" />
            <button type="button" class="form-designer-step-item"
                :class="{ 'form-designer-step-item--active': Number(active) > 2 }" @click="goPublish">
                <span class="form-designer-step-num">3</span>
                <span>发布应用</span>
            </button>
        </div>

        <div v-else-if="route.query.type == '3'" class="form-designer-step-bar">
            <button type="button" class="form-designer-step-item"
                :class="{ 'form-designer-step-item--active': Number(active) === 1, 'form-designer-step-item--done': Number(active) > 1 }"
                @click="toSave(1)">
                <span class="form-designer-step-num">
                    <i v-if="Number(active) > 1" class="fas fa-check" aria-hidden="true" style="font-size: 9px;" />
                    <template v-else>1</template>
                </span>
                <span>设计报表</span>
            </button>
            <span class="form-designer-step-line" />
            <button type="button" class="form-designer-step-item"
                :class="{ 'form-designer-step-item--active': Number(active) === 2 }" @click="goPublish">
                <span class="form-designer-step-num">2</span>
                <span>发布报表</span>
            </button>
        </div>

        <div class="form-designer-header__right">
            <button type="button" class="tdc-bell-btn" aria-label="我的待办" @click="goToDoCenter">
                <i class="fas fa-bell" aria-hidden="true" />
                <span v-if="pendingCount > 0" class="tdc-bell-dot" aria-hidden="true" />
            </button>
            <button type="button" class="tdc-download-btn" aria-label="下载中心" @click="openDownloadCenter">
                <i class="fas fa-download" aria-hidden="true" />
            </button>
            <a-dropdown trigger="click" @select="onUserMenuSelect">
                <span class="tdc-user-trigger">
                    <img v-if="userInfo?.icon" :src="userInfo.icon" class="tdc-avatar" alt="" />
                    <div v-else class="tdc-avatar-fallback">
                        {{ userNicknameInitial }}
                    </div>
                    <div class="tdc-user-meta">
                        <p class="tdc-user-name">
                            {{ userInfo?.nickname || '系统管理员' }}
                        </p>
                        <p class="tdc-user-dept">{{ userDeptLabel }}</p>
                    </div>
                </span>
                <template #content>
                    <a-doption value="logOut">退出登录</a-doption>
                </template>
            </a-dropdown>
        </div>
    </header>

    <OutputManageCenter ref="outputManageCenterRef" embedded />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAppReturnRoute } from '@/views/application/composables/useAppFormNav'
import OutputManageCenter from '@/views/outputManageCenter/index.vue'
import { useBannerBell } from '@/composables/useBannerBell'

withDefaults(
    defineProps<{
        active: number | string
        breadcrumbCurrent?: string
    }>(),
    {
        breadcrumbCurrent: '设计应用',
    },
)

const win = window as Window & { api?: { logoutUrl?: string } }
const router = useRouter()
const route = useRoute()
const outputManageCenterRef = ref<InstanceType<typeof OutputManageCenter> | null>(null)
const { pendingCount, goToDoCenter } = useBannerBell()

const rawUser = localStorage.getItem('wornbench_useinfo')
const userInfo = ref(
    rawUser
        ? (JSON.parse(rawUser) as {
            nickname?: string
            icon?: string
            deptName?: string
            department?: string
            departments?: any[]
            deptList?: any[]
        })
        : null,
)

const userNicknameInitial = computed(
    () => (userInfo.value?.nickname && userInfo.value.nickname.charAt(0)) || '',
)

const userDeptLabel = computed(() => {
    const departmentList = userInfo.value?.departments || userInfo.value?.deptList || []
    const departmentLabel = Array.isArray(departmentList)
        ? departmentList
            .map((item: any) => item?.deptName || item?.name || item?.label)
            .filter(Boolean)
            .join('、')
        : ''

    return userInfo.value?.deptName || userInfo.value?.department || departmentLabel || ''
})

const pickForwardQuery = () => {
    const q: Record<string, string> = {
        id: route.query.id as string,
        type: route.query.type as string,
    }
    if (route.query.from) {
        q.from = route.query.from as string
    }
    return q
}

const linkTo = () => {
    if (route.name == 'flowPath') {
        router.push({
            path: '/form',
            query: pickForwardQuery(),
        })
    } else if (route.name == 'publishApp') {
        const type = String(route.query.type)
        const path = type === '1' ? '/form' : type === '3' ? '/designer' : '/flowPath'
        router.push({
            path,
            query: pickForwardQuery(),
        })
    } else {
        router.push(getAppReturnRoute(route))
    }
}

const toSave = (val: number) => {
    const query = pickForwardQuery()
    if (route.query.type == '1') {
        if (val == 1) {
            router.push({ path: '/form', query })
        } else {
            goPublish()
        }
        return
    }
    if (route.query.type == '3') {
        if (val == 1) {
            router.push({ path: '/designer', query })
        } else {
            goPublish()
        }
        return
    }
    if (val == 2) {
        router.push({ path: '/flowPath', query })
    } else if (val == 1) {
        router.push({ path: '/form', query })
    }
}

const goPublish = () => {
    const query = pickForwardQuery()
    router.push({ path: '/publishApp', query })
}

const openDownloadCenter = () => {
    outputManageCenterRef.value?.open()
}

const onUserMenuSelect = (value: string | number) => {
    if (value === 'logOut') {
        window.location.href = win.api?.logoutUrl || '/'
        localStorage.removeItem('isAdmin')
        localStorage.removeItem('wornbench_userId')
        localStorage.removeItem('wornbench_token')
        localStorage.removeItem('wornbench_info')
        localStorage.removeItem('wornbench_useinfo')
        localStorage.removeItem('activeName')
        localStorage.removeItem('activeTab')
        localStorage.removeItem('flowList')
        localStorage.removeItem('formList')
        localStorage.removeItem('taskFillCenterAppId')
    }
}
</script>
<style lang="scss" scoped>
@use "@/styles/form-designer.scss";
</style>
<style lang="scss">
@use "@/styles/banner-subpage.scss";
</style>
