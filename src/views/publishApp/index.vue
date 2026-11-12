<template>
  <div class="publish-app-page">
    <banner :active="publishStepActive" :breadcrumb-current="publishBannerTitle" />
    <div class="publish-app-page__body">
      <div class="publish-app-page__content">
        <a-spin :loading="loading" style="width: 100%;">
          <a-card class="publish-card" :bordered="false">
            <template #title>
              <div class="publish-card__title"><i class="fas fa-info-circle"
                  style="margin-right:10px;color: rgb(var(--primary-6));font-size: 14px;"></i>基本信息</div>
            </template>
            <a-form :model="baseInfo" :disabled="interactionLocked" layout="vertical" class="publish-form">
              <a-form-item field="appName" label="应用名称" extra='应用名称将显示在工作台和应用中心，建议不超过 50 个字'>
                <a-input v-model="baseInfo.appName" :max-length="50" show-word-limit placeholder="请输入应用名称" />
              </a-form-item>
              <a-form-item field="icon" label="应用图标" extra='点击图标可从图标库中选择'>
                <div class="icon-row">
                  <button type="button" class="app-icon-btn" :disabled="interactionLocked" @click="openIconModal">
                    <img v-if="currentIconSrc" :src="currentIconSrc" alt="应用图标">
                    <img v-else :src="placeholderIcon" alt="默认应用图标">
                  </button>
                </div>
              </a-form-item>
              <a-form-item field="category" label="应用类型">
                <a-select v-model="baseInfo.category" :options="categoryOptions" disabled placeholder="应用类型" />
              </a-form-item>
              <a-form-item field="categoryIds" label="应用分类">
                <a-select v-model="baseInfo.categoryIds" multiple allow-search allow-clear
                  :field-names="categoryFieldNames" :options="classList" placeholder="请选择应用分类" />
              </a-form-item>
              <a-form-item field="desc" label="应用描述">
                <a-textarea v-model="baseInfo.desc" :max-length="100" show-word-limit
                  :auto-size="{ minRows: 3, maxRows: 6 }" placeholder="简要描述应用用途，帮助用户理解" />
              </a-form-item>
            </a-form>
          </a-card>

          <a-card class="publish-card" :bordered="false">
            <template #title>
              <div class="publish-card__title"><i class="fas fa-eye"
                  style="margin-right:10px;color: rgb(var(--primary-6));font-size: 14px;"></i>应用访问</div>
            </template>
            <p class="form-hint form-hint--mb">访问范围内的成员可在应用广场看到这个应用入口</p>
            <div class="publish-field tip-box access-input"
              :class="{ 'publish-field--disabled': interactionLocked }" @click="openAccessModal">
              <span v-if="!hasAccessSelection" class="setTip">+ 设置访问范围</span>
              <div v-else class="tip-box-item tags-wrapper">
                <a-tag v-for="(item, index) in accessScope.deptIds" :key="`dept-${item.id ?? index}`">
                  <div class="tag">
                    <div class="tag-name">{{ item.label || item.deptName }}</div>
                    <div class="close" @click.stop="removeAccessItem(1, index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
                <a-tag v-for="(item, index) in accessScope.postIds" :key="`post-${item.id ?? index}`">
                  <div class="tag">
                    <div class="tag-name">{{ item.postName || item.label }}</div>
                    <div class="close" @click.stop="removeAccessItem(2, index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
                <a-tag v-for="(item, index) in accessScope.roleIds" :key="`role-${item.id ?? index}`">
                  <div class="tag">
                    <div class="tag-name">{{ item.roleName || item.label }}</div>
                    <div class="close" @click.stop="removeAccessItem(3, index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
                <a-tag v-for="(item, index) in accessScope.userIds" :key="`user-${item.id ?? index}`">
                  <div class="tag">
                    <div class="tag-name">{{ item.nickname || item.label }}</div>
                    <div class="close" @click.stop="removeAccessItem(4, index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
              </div>
            </div>
          </a-card>
        </a-spin>
      </div>
    </div>
    <div class="publish-bottom-bar">
      <div class="save-status">{{ saveStatusLabel }}</div>
      <div class="publish-bottom-bar__actions">
        <a-button :loading="loading" :disabled="interactionLocked" @click="saveConfig" class="save-config-btn">
          <i class="fas fa-save"></i>保存配置
        </a-button>
        <a-button type="primary" :loading="interactionLocked" :disabled="interactionLocked" @click="startPublish"
          class="start-publish-btn"><i class="fas fa-rocket"></i>正式发布</a-button>
      </div>
    </div>

    <a-modal v-model:visible="iconModalVisible" title="选择图标" :mask-closable="false" title-align="start"
      :on-before-ok="confirmIconSelection" unmount-on-close>
      <div class="icon-modal-header">
        <button type="button" class="icon-refresh" @click="refreshIcons">换一换</button>
      </div>
      <div class="icon-lib-grid">
        <button v-for="icon in displayIcons" :key="icon.id" type="button" class="icon-lib-item"
          :class="{ 'icon-lib-item--active': modalIconId === icon.id && !modalCustomIcon }"
          @click="selectPresetIcon(icon.id)">
          <img :src="icon.url" alt="图标">
        </button>
        <button type="button" class="icon-lib-add" @click="triggerIconUpload">
          <span>+</span>
          <small>上传</small>
        </button>
      </div>
      <input ref="iconUploadInputRef" type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml"
        class="hidden-input" @change="onUploadIconChange">

    </a-modal>

    <a-modal v-model:visible="publishingVisible" title="正在发布应用" :footer="false" :closable="false" title-align="start"
      :mask-closable="false" :esc-to-close="false" unmount-on-close>
      <div class="publishing-box">
        <a-progress :percent="publishProgress" :show-text="false" />
        <p class="publishing-status">{{ publishStatusText }}</p>
      </div>
    </a-modal>

    <a-modal v-model:visible="publishSuccessVisible" title="完成发布" :mask-closable="false" unmount-on-close>
      <div class="success-box">
        <p>应用 <strong>{{ baseInfo.appName || '未命名应用' }}</strong> 已发布成功</p>
      </div>
      <template #footer>
        <a-button @click="goAppSquare">应用广场</a-button>
        <a-button type="primary" @click="goManageApp">管理应用</a-button>
      </template>
    </a-modal>

    <FillPersonModal ref="fillPersonModalRef" modal-title="设置访问范围" title="访问范围" @setData="onAccessScopeSet" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import banner from '@/components/banner/banner.vue'
import FillPersonModal from '@/views/application/publishTask/components/fillPersonModal.vue'
import { getCreatorDes, getAccess, publishApp, type PublishAppPayload } from '@/api/homePage'
import { getCategoryCache, getDeptsByIds, getPostList, getRoleList, getUsersByIds } from '@/api/common/index'
import { getIconCacheList } from '@/api/iconLibrary'
import { getAppReturnRoute } from '@/views/application/composables/useAppFormNav'
import { upload } from '@/api/user'
import placeholderIcon from '@/assets/icon_zhanwei.svg'

type AccessScope = {
  deptIds: any[]
  postIds: any[]
  roleIds: any[]
  userIds: any[]
}

const win = window as Window & { api?: { dowUrl?: string } }
const route = useRoute()
const router = useRouter()
const publishStepActive = computed(() => {
  const type = String(route.query.type)
  if (type === '1' || type === '3') return 2
  return 3
})

const publishBannerTitle = computed(() =>
  String(route.query.type) === '3' ? '发布报表' : '发布应用',
)

const loading = ref(false)
const publishing = ref(false)
const iconModalVisible = ref(false)
const publishingVisible = ref(false)
const publishSuccessVisible = ref(false)
const publishProgress = ref(0)
const publishStatusText = ref('正在验证配置...')
const saveStatusLabel = ref('配置未保存')

const fillPersonModalRef = ref<InstanceType<typeof FillPersonModal> | null>(null)
const iconUploadInputRef = ref<HTMLInputElement | null>(null)
const iconLoading = ref(false)
const iconPage = ref(0)

const categoryOptions = [
  { label: '普通表单', value: 1 },
  { label: '流程表单', value: 2 },
  { label: '简单报表', value: 3 },
]
const categoryFieldNames = { value: 'id', label: 'category' }
const classList = ref<Array<{ id: number | string; category: string }>>([])

const baseInfo = reactive({
  appName: '',
  category: undefined as number | undefined,
  categoryIds: [] as Array<number | string>,
  desc: '',
  icon: '' as string | number,
  showIcon: '',
})

const accessScope = reactive<AccessScope>({
  deptIds: [],
  postIds: [],
  roleIds: [],
  userIds: [],
})

const iconList = ref<Array<{ id: string | number; url: string }>>([])
const customIcon = ref<{ id: string | number; url: string } | null>(null)
const modalIconId = ref<string | number>('')
const modalCustomIcon = ref<{ id: string | number; url: string } | null>(null)

const appId = computed(() => String(route.query.id || ''))
const storageKey = computed(() => `publish_config_${appId.value || 'draft'}`)
const ICON_PAGE_SIZE = 12

const currentIconSrc = computed(() => {
  return baseInfo.showIcon || ''
})

const displayIcons = computed(() => {
  if (!iconList.value.length) return []
  const start = (iconPage.value * ICON_PAGE_SIZE) % iconList.value.length
  const count = Math.min(ICON_PAGE_SIZE, iconList.value.length)
  return Array.from({ length: count }, (_, i) => iconList.value[(start + i) % iconList.value.length])
})

const hasAccessSelection = computed(
  () =>
    accessScope.deptIds.length > 0 ||
    accessScope.postIds.length > 0 ||
    accessScope.roleIds.length > 0 ||
    accessScope.userIds.length > 0,
)

const interactionLocked = computed(() => loading.value || publishing.value)

const removeAccessItem = (type: number, index: number) => {
  if (interactionLocked.value) return
  if (type === 1) accessScope.deptIds.splice(index, 1)
  if (type === 2) accessScope.postIds.splice(index, 1)
  if (type === 3) accessScope.roleIds.splice(index, 1)
  if (type === 4) accessScope.userIds.splice(index, 1)
}

const getIconFromServer = (icon: string | null | undefined) => {
  if (!icon) return ''
  if (icon.startsWith('http') || icon.startsWith('data:')) return icon
  const token = localStorage.getItem('wornbench_token') || ''
  return `${win.api?.dowUrl || ''}${icon}&token=${token}`
}

const buildIconUrl = (iconId: string | number) => {
  const token = localStorage.getItem('wornbench_token') || ''
  return `${win.api?.dowUrl || ''}${iconId}&token=${token}`
}

const fetchIconList = async () => {
  iconLoading.value = true
  try {
    const res = await getIconCacheList()
    iconList.value = (res || []).map((item: any) => ({
      id: item.id,
      url: buildIconUrl(item.id),
    }))
    iconPage.value = 0
  } finally {
    iconLoading.value = false
  }
}

const isEntityList = (list: unknown): list is any[] =>
  Array.isArray(list) && list.length > 0 && typeof list[0] === 'object' && list[0] !== null

const toIdList = (list: unknown): Array<string | number> => {
  if (!Array.isArray(list) || !list.length) return []
  if (isEntityList(list)) {
    return list.map((item) => item.id).filter((id) => id != null && id !== '')
  }
  return (list as Array<string | number>).filter((id) => id != null && id !== '')
}

const applyAccessScope = (scope: Partial<AccessScope>) => {
  accessScope.deptIds = scope.deptIds || []
  accessScope.postIds = scope.postIds || []
  accessScope.roleIds = scope.roleIds || []
  accessScope.userIds = scope.userIds || []
}

const hasSavedAccess = (scope?: Partial<AccessScope>) =>
  !!scope &&
  (scope.deptIds?.length || scope.postIds?.length || scope.roleIds?.length || scope.userIds?.length)

/** 从服务端拉取访问对象配置，与 access.vue 同源 getAccess。 */
const loadAccessFromServer = async () => {
  if (!appId.value) return
  try {
    const res = await getAccess(appId.value)
    if (!res) return

    if (
      isEntityList(res.deptIds) ||
      isEntityList(res.postIds) ||
      isEntityList(res.roleIds) ||
      isEntityList(res.userIds)
    ) {
      applyAccessScope({
        deptIds: res.deptIds || [],
        postIds: res.postIds || [],
        roleIds: res.roleIds || [],
        userIds: res.userIds || [],
      })
      return
    }

    const deptIdList = toIdList(res.deptIds)
    const postIdList = toIdList(res.postIds)
    const roleIdList = toIdList(res.roleIds)
    const userIdList = toIdList(res.userIds)

    if (!deptIdList.length && !postIdList.length && !roleIdList.length && !userIdList.length) {
      return
    }

    const [depts, users, posts, roles] = await Promise.all([
      deptIdList.length ? getDeptsByIds(deptIdList) : Promise.resolve([]),
      userIdList.length ? getUsersByIds(userIdList) : Promise.resolve([]),
      postIdList.length ? getPostList() : Promise.resolve([]),
      roleIdList.length ? getRoleList() : Promise.resolve([]),
    ])

    applyAccessScope({
      deptIds: (Array.isArray(depts) ? depts : []).map((d: any) => ({
        id: d.id,
        label: d.deptName || d.label,
      })),
      userIds: (Array.isArray(users) ? users : []).map((u: any) => ({
        id: u.id ?? u.userId,
        nickname: u.nickname || u.name,
      })),
      postIds: postIdList
        .map((id) => (posts || []).find((p: any) => String(p.id) === String(id)))
        .filter(Boolean),
      roleIds: roleIdList
        .map((id) => (roles || []).find((r: any) => String(r.id) === String(id)))
        .filter(Boolean),
    })
  } catch (error) {
    console.error(error)
  }
}

const loadSavedConfig = () => {
  const raw = localStorage.getItem(storageKey.value)
  if (!raw) return
  try {
    const saved = JSON.parse(raw)
    baseInfo.appName = saved.baseInfo?.appName || baseInfo.appName
    baseInfo.category = saved.baseInfo?.category ?? baseInfo.category
    baseInfo.categoryIds = saved.baseInfo?.categoryIds || baseInfo.categoryIds
    baseInfo.desc = saved.baseInfo?.desc || baseInfo.desc
    baseInfo.icon = saved.baseInfo?.icon || baseInfo.icon
    baseInfo.showIcon = saved.baseInfo?.showIcon || baseInfo.showIcon
    if (hasSavedAccess(saved.accessScope)) {
      applyAccessScope(saved.accessScope)
    }
    if (saved.customIcon?.id && saved.customIcon?.url) {
      customIcon.value = saved.customIcon
    }
    if (saved.savedAt) {
      saveStatusLabel.value = `配置已自动保存 ${saved.savedAt}`
    }
  } catch (error) {
    console.error(error)
  }
}

const init = async () => {
  if (!route.query.id) return
  loading.value = true
  try {
    const [res] = await Promise.all([
      getCreatorDes(route.query.id),
      getCategoryCache().then((list) => {
        classList.value = list || []
      }),
    ])
    baseInfo.appName = res?.appName || ''
    baseInfo.category = res?.category
    baseInfo.categoryIds = res?.categoryIds || []
    baseInfo.desc = res?.intro || res?.description || ''
    baseInfo.icon = res?.icon || ''
    const appIcon = getIconFromServer(res?.icon)
    if (appIcon) {
      baseInfo.showIcon = appIcon
      customIcon.value = res?.icon ? { id: res.icon, url: appIcon } : null
    }
    await loadAccessFromServer()
    loadSavedConfig()
    await fetchIconList()
  } finally {
    loading.value = false
  }
}

const openIconModal = () => {
  if (interactionLocked.value) return
  modalIconId.value = baseInfo.icon || ''
  modalCustomIcon.value = customIcon.value
  if (!iconList.value.length && !iconLoading.value) {
    fetchIconList()
  }
  iconModalVisible.value = true
}

const selectPresetIcon = (id: string | number) => {
  modalIconId.value = id
  modalCustomIcon.value = null
}

const refreshIcons = () => {
  if (!iconList.value.length) return
  iconPage.value += 1
}

const triggerIconUpload = () => {
  iconUploadInputRef.value?.click()
}

const onUploadIconChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const uploadForm = new FormData()
  uploadForm.append(
    'fileProfile',
    new Blob([JSON.stringify({ folder: 'appIcon' })], { type: 'application/json' }),
  )
  uploadForm.append('file', file)
  upload(uploadForm).then((res: any) => {
    const iconId = res?.data || res
    const iconUrl = buildIconUrl(iconId)
    modalCustomIcon.value = { id: iconId, url: iconUrl }
    modalIconId.value = iconId
    Message.success('图标上传成功')
  }).catch(() => {
    Message.error('图标上传失败')
  })
  input.value = ''
}

const confirmIconSelection = () => {
  if (modalCustomIcon.value) {
    customIcon.value = modalCustomIcon.value
    baseInfo.icon = modalCustomIcon.value.id
    baseInfo.showIcon = modalCustomIcon.value.url
    return true
  }
  if (!modalIconId.value) {
    Message.warning('请选择应用图标')
    return false
  }
  const picked = iconList.value.find((item) => item.id === modalIconId.value)
  if (picked) {
    customIcon.value = null
    baseInfo.icon = picked.id
    baseInfo.showIcon = picked.url
  }
  return true
}

const openAccessModal = () => {
  if (interactionLocked.value) return
  fillPersonModalRef.value?.showModal(JSON.parse(JSON.stringify(accessScope)))
}

const onAccessScopeSet = (value: AccessScope) => {
  accessScope.deptIds = value?.deptIds || []
  accessScope.postIds = value?.postIds || []
  accessScope.roleIds = value?.roleIds || []
  accessScope.userIds = value?.userIds || []
}

const buildSavePayload = () => {
  const now = new Date()
  const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  return {
    baseInfo: {
      appName: baseInfo.appName,
      category: baseInfo.category,
      categoryIds: baseInfo.categoryIds,
      desc: baseInfo.desc,
      icon: baseInfo.icon,
      showIcon: baseInfo.showIcon,
    },
    accessScope: JSON.parse(JSON.stringify(accessScope)),
    customIcon: customIcon.value,
    savedAt: timeLabel,
  }
}

const persistPublishConfig = () => {
  const payload = buildSavePayload()
  localStorage.setItem(storageKey.value, JSON.stringify(payload))
  saveStatusLabel.value = `配置已自动保存 ${payload.savedAt}`
  return payload
}

const saveConfig = () => {
  if (interactionLocked.value) return
  persistPublishConfig()
  Message.success('配置已保存')
  // router.push(getAppReturnRoute(route))
}
const mapScopeIds = (items: any[]) => {
  if (!Array.isArray(items)) return []
  return items.map((item) => item?.id).filter((id) => id != null && id !== '')
}

const buildPublishPayload = (): PublishAppPayload => ({
  appId: appId.value,
  appName: baseInfo.appName.trim(),
  intro: baseInfo.desc?.trim() || '',
  icon: String(baseInfo.icon || ''),
  categoryIds: [...baseInfo.categoryIds],
  deptIds: mapScopeIds(accessScope.deptIds),
  postIds: mapScopeIds(accessScope.postIds),
  roleIds: mapScopeIds(accessScope.roleIds),
  userIds: mapScopeIds(accessScope.userIds),
})

const validateBeforePublish = () => {
  if (!appId.value) {
    Message.warning('缺少应用 ID，无法发布')
    return false
  }
  if (!baseInfo.appName.trim()) {
    Message.warning('请输入应用名称')
    return false
  }
  if (baseInfo.appName.trim().length > 50) {
    Message.warning('应用名称不能超过 50 个字')
    return false
  }
  if (!baseInfo.categoryIds.length) {
    Message.warning('请选择应用分类')
    return false
  }
  if (!baseInfo.icon) {
    Message.warning('请选择应用图标')
    return false
  }
  if (!hasAccessSelection.value) {
    Message.warning('请至少选择一个访问范围')
    return false
  }
  return true
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const runPublishProgress = async () => {
  publishProgress.value = 0
  publishStatusText.value = '正在验证配置...'
  await sleep(200)
  publishProgress.value = 25
  publishStatusText.value = '正在提交发布请求...'
  await sleep(200)
  publishProgress.value = 55
  publishStatusText.value = '正在同步访问权限...'
}

const startPublish = async () => {
  if (interactionLocked.value) return
  if (!validateBeforePublish()) return
  persistPublishConfig()
  publishing.value = true
  publishingVisible.value = true
  try {
    await runPublishProgress()
    await publishApp(appId.value, buildPublishPayload())
    publishProgress.value = 100
    publishStatusText.value = '发布完成'
    await sleep(200)
    publishingVisible.value = false
    publishSuccessVisible.value = true
    localStorage.removeItem(storageKey.value)
    saveStatusLabel.value = '配置未保存'
  } catch (error) {
    console.error(error)
    publishingVisible.value = false
    Message.error('发布失败，请稍后重试')
  } finally {
    publishing.value = false
  }
}

const goAppSquare = () => {
  publishSuccessVisible.value = false
  router.push({ name: 'homePage' })
}

const goManageApp = () => {
  publishSuccessVisible.value = false
  router.push(getAppReturnRoute(route))
}

init()
</script>

<style scoped lang="scss">
:deep(.arco-card-header) {
  border-bottom: none !important;
}

.publish-app-page {
  min-height: 100vh;
  background: #f5f7fb;
}

.publish-app-page__body {
  height: calc(100vh - 140px);
  padding: 24px 0px;
  overflow-y: auto;
}

.publish-app-page__content {
  max-width: 860px;
  margin: 0 auto;


}

.publish-card {
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
}

.publish-card__title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.form-hint {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 6px;
}

.form-hint--mb {
  margin-top: 0;
  margin-bottom: 12px;
}

:deep(.publish-form .arco-input-wrapper),
:deep(.publish-form .arco-select-view-single),
:deep(.publish-form .arco-select-view-multiple),
:deep(.publish-form .arco-textarea-wrapper) {
  width: 100%;
  min-height: 40px;
  background: #fff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  transition: border-color 0.2s, background 0.2s;
}

:deep(.publish-form .arco-input-wrapper:focus-within),
:deep(.publish-form .arco-select-view-single:focus-within),
:deep(.publish-form .arco-select-view-multiple:focus-within),
:deep(.publish-form .arco-textarea-wrapper:focus-within) {
  background: #fff !important;
  border-color: rgb(var(--primary-6)) !important;
}

:deep(.publish-form .arco-input),
:deep(.publish-form .arco-select-view-value),
:deep(.publish-form .arco-select-view-multiple),
:deep(.publish-form .arco-textarea) {
  font-size: 13px;
  color: #334155;
}

:deep(.publish-form .arco-input::placeholder),
:deep(.publish-form .arco-select-view-placeholder),
:deep(.publish-form .arco-textarea::placeholder) {
  color: #94a3b8;
}

:deep(.publish-form .arco-select-view-multiple) {
  .arco-select-view-inner {
    margin: 4px 0px;
  }

  .arco-tag {
    margin: 2px 4px 2px 0;
    background: #fff !important;
    border: 1px solid #e2e8f0 !important;
    color: #334155 !important;
    border-radius: 6px;
    font-size: 13px;

    .arco-tag-close-btn {
      color: #94a3b8;

      &:hover {
        color: #64748b;
      }
    }
  }
}

.icon-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon-btn {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  border: 0;
  background: rgba(0, 0, 0, 0);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: rgb(var(--primary-6));
  padding: 0px;
  font-weight: 600;
  font-size: 18px;

  &:hover {
    border-color: rgb(var(--primary-6));
    transform: scale(1.05);
  }
}

.app-icon-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-tip {
  font-size: 12px;
  color: #94a3b8;
}

.publish-field {
  width: 100%;
  box-sizing: border-box;
  min-height: 40px;
  padding: 0 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  transition: border-color 0.2s, background 0.2s;
}

.publish-field.tip-box {
  padding: 4px 12px;
  cursor: pointer;

  &:hover {
    border-color: #e2e8f0;
  }

  &:active {
    background: #fff;
    border-color: rgb(var(--primary-6));
  }

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .tip-box-item {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin: 0;
  }

  :deep(.arco-tag) {
    margin: 2px 4px 2px 0;
    background: #fff !important;
    border: 1px solid #e2e8f0 !important;
    color: #334155 !important;
    border-radius: 6px;
    font-size: 13px;
  }

  .tag {
    display: flex;
    align-items: center;
    color: #334155;
    font-size: 13px;

    .tag-name {
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .close {
      margin-left: 4px;
      cursor: pointer;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;

      &:hover {
        color: #64748b;
      }
    }
  }
}

.setTip {
  color: #94a3b8;
  font-size: 13px;
  line-height: 32px;
}

.access-input {
  align-content: center;
}

.publish-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  padding: 0 20px;
  z-index: 70;
}

.save-status {
  color: #64748b;
  font-size: 13px;
}

.publish-bottom-bar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-lib-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  min-height: 124px;
}

.icon-modal-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.icon-refresh {
  font-size: 12px;
  border: none;
  cursor: pointer;
  color: rgb(var(--primary-6));
  background: #eff6ff;
  border-radius: 8px;
  padding: 4px 8px;
}

.icon-lib-item,
.icon-lib-add {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
}

.icon-lib-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.icon-lib-item--active {
  border: 2px solid rgb(var(--primary-6)) !important;
}

.icon-lib-add {
  border: 2px dashed #cbd5e1;
  color: #64748b;
  flex-direction: column;
  gap: 2px;
}

.hidden-input {
  display: none;
}

.custom-preview {
  margin-top: 12px;
  display: flex;
  border-radius: 14px;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

.custom-preview img {
  width: 56px;
  height: 56px;
  object-fit: cover;
}

.publishing-box {
  padding: 8px 0;
}

.publishing-status {
  margin-top: 12px;
  margin-bottom: 0;
  color: #64748b;
  text-align: center;
}

.success-box {
  text-align: center;
  color: #334155;
}

.start-publish-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #22c55e;
  color: white;

  &:hover {
    background: #16a34a;
  }
}

.save-config-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0);
}
</style>



