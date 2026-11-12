<template>
  <div class="public-share-page">
    <div class="public-share-header">
      <h2 class="public-share-title">公网配置</h2>
      <p class="public-share-desc">
        配置应用在公网环境下的访问策略、地址访问方式和微信提交限制。
      </p>
    </div>

    <a-form ref="refChangeForm" :model="formData" :rules="rules" layout="vertical" class="public-share-form"
      scroll-to-first-error>
      <section class="config-section config-section--toggle">
        <div class="setting-copy">
          <div class="setting-label">是否开启公网配置</div>
          <div class="setting-desc">开启后可通过公网链接访问该应用。</div>
        </div>
        <a-form-item field="active" hide-label class="setting-control setting-control--switch">
          <a-switch v-model="formData.active" :checked-value="1" :unchecked-value="0" />
        </a-form-item>
      </section>

      <template v-if="formData.active === 1">
        <section class="config-section" style="border-bottom: 0">
          <a-form-item label="到期时间" class="field-item">
            <a-date-picker style="width: 100%;" v-model="formData.expireTime" class="date-input" placeholder="到期时间"
              show-time format="YYYY-MM-DD HH:mm:ss" />
            <template #extra>到达设定时间后，公网访问会自动失效。</template>
          </a-form-item>
          <a-form-item label="IP白名单" class="field-item field-item--wide">
            <a-textarea style="width: 100%;" v-model="formData.ipWhitelist" class="ip-textarea"
              placeholder="使用 ; 分隔 IP 地址，例如：192.168.1.100;10.0.0.0/24" :auto-size="{ minRows: 4, maxRows: 4 }"
              :max-length="1000" allow-clear />
            <template #extra>仅允许白名单中的 IP 访问，支持 CIDR 格式，留空则不限制。</template>
          </a-form-item>
          <a-form-item label="公开查询地址" class="field-item field-item--public">
            <div class="public-url-box">
              <a-input :model-value="formData.externalUrl" readonly placeholder="保存后生成公网地址" />
              <a-button type="outline" class="public-url-copy-btn" :disabled="!formData.externalUrl"
                @click="copyExternalUrl">
                <icon-copy />
              </a-button>
            </div>

            <template #extra>
              <div v-if="formData.externalUrl" class="public-qrcode-panel">
                <div class="public-qrcode-divider">或</div>
                <div class="public-qrcode-card">
                  <img :src="qrCodeUrl" alt="公网地址二维码" class="public-qrcode-image"
                    :class="{ 'is-loading': qrCodeDownloading }" @click="downloadQrCode" />
                  <a-button type="text" size="mini" class="public-qrcode-download" :loading="qrCodeDownloading"
                    @click="downloadQrCode">
                    点击二维码下载
                  </a-button>
                </div>
              </div>
            </template>
          </a-form-item>


        </section>

        <section class="config-section config-section--toggle">
          <div class="setting-copy">
            <div class="setting-label">在微信中提交</div>
            <div class="setting-desc">开启后仅允许在微信环境中提交表单。</div>
          </div>
          <a-form-item hide-label class="setting-control setting-control--switch">
            <a-switch disabled v-model="formData.wechatSubmitConfig.enabled" />
          </a-form-item>
        </section>

        <section v-if="formData.wechatSubmitConfig.enabled" class="wechat-panel">
          <div class="wechat-row">
            <div class="field-label">信息获取</div>
            <div class="wechat-checks">
              <a-checkbox :model-value="true" disabled>微信 OPENID</a-checkbox>
              <a-checkbox v-model="formData.wechatSubmitConfig.avatar">微信头像</a-checkbox>
              <a-checkbox v-model="formData.wechatSubmitConfig.nickname">微信昵称</a-checkbox>
            </div>
          </div>

          <div class="wechat-row">
            <div class="field-label">填写限制</div>
            <a-space direction="vertical" :size="10" class="limit-options">
              <a-checkbox v-model="formData.wechatSubmitConfig.onlyOnce">
                每个用户只能填写一次
              </a-checkbox>
              <a-checkbox v-model="formData.wechatSubmitConfig.allowViewSubmittedData">
                允许查看自己提交的数据
              </a-checkbox>
              <a-checkbox v-model="formData.wechatSubmitConfig.allowEditSubmittedData">
                允许修改自己提交的数据（审批前）
              </a-checkbox>
            </a-space>
          </div>
        </section>
      </template>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute } from 'vue-router'
import { getShare, setShare } from '@/api/homePage/index'

const route = useRoute()
const refChangeForm = ref()
const qrCodeDownloading = ref(false)

const getAppId = inject('appId', () => route.query.id) as () => any

defineProps<{
  appdes: any;
}>()

const emits = defineEmits(['handleCancel'])

interface WechatSubmitConfig {
  enabled: boolean;
  openid: boolean;
  avatar: boolean;
  nickname: boolean;
  onlyOnce: boolean;
  allowViewSubmittedData: boolean;
  allowEditSubmittedData: boolean;
}

interface FormDataType {
  active?: string | number;
  expireTime?: string;
  ipWhitelist?: string;
  externalUrl?: string;
  wechatSubmitConfig: WechatSubmitConfig;
}

const defaultWechatSubmitConfig = (): WechatSubmitConfig => ({
  enabled: true,
  openid: true,
  avatar: true,
  nickname: true,
  onlyOnce: false,
  allowViewSubmittedData: false,
  allowEditSubmittedData: false,
})

const formData = reactive<FormDataType>({
  active: '',
  expireTime: '',
  ipWhitelist: '',
  externalUrl: '',
  wechatSubmitConfig: defaultWechatSubmitConfig(),
})

const qrCodeUrl = computed(() => {
  if (!formData.externalUrl) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(formData.externalUrl)}`
})

const loadShareConfig = async () => {
  const appId = getAppId()
  if (!appId) return

  const res = await getShare(appId)
  formData.active = res.active
  formData.expireTime = res.expireTime
  formData.ipWhitelist = res.ipWhitelist
  formData.externalUrl = res.externalUrl || ''
  formData.wechatSubmitConfig = {
    ...defaultWechatSubmitConfig(),
    ...(res.wechatSubmitConfig || {}),
    openid: true,
  }
}

loadShareConfig()

const rules = ref({
  active: [
    {
      required: true,
      message: '请选择是否开启公网配置',
    },
  ],
})

const fallbackCopyToClipboard = (text: string) => {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textarea)

    if (successful) {
      Message.success('公网地址已复制到剪贴板')
      return
    }

    Message.error('复制失败，请手动复制')
  } catch (error) {
    console.error('copy external url failed:', error)
    Message.error('复制失败，请手动复制')
  }
}

const copyExternalUrl = async () => {
  if (!formData.externalUrl) {
    Message.warning('请先保存生成公网地址')
    return
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(formData.externalUrl)
      Message.success('公网地址已复制到剪贴板')
      return
    } catch (error) {
      console.error('clipboard copy external url failed:', error)
    }
  }

  fallbackCopyToClipboard(formData.externalUrl)
}

const downloadQrCode = async () => {
  if (!formData.externalUrl || !qrCodeUrl.value) {
    Message.warning('请先保存生成公网地址')
    return
  }

  if (qrCodeDownloading.value) return

  qrCodeDownloading.value = true
  try {
    const response = await fetch(qrCodeUrl.value)
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = `public-share-${getAppId() || 'qrcode'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(objectUrl)
    Message.success('二维码下载成功')
  } catch (error) {
    console.error('download qrcode failed:', error)
    window.open(qrCodeUrl.value, '_blank')
    Message.warning('下载失败，已为您打开二维码图片')
  } finally {
    qrCodeDownloading.value = false
  }
}

const handClear = () => {
  formData.active = ''
  formData.expireTime = ''
  formData.ipWhitelist = ''
  formData.externalUrl = ''
  formData.wechatSubmitConfig = defaultWechatSubmitConfig()
  emits('handleCancel')
}

const formSubmit = () => {
  refChangeForm.value.validate(async (error: any) => {
    if (error) return

    const params = {
      ...formData,
      wechatSubmitConfig: {
        ...formData.wechatSubmitConfig,
        openid: true,
      },
    }

    const res = await setShare(params, getAppId())
    formData.externalUrl = res?.externalUrl || formData.externalUrl || ''
    Message.success('保存成功')
    handClear()
  })
}

defineExpose({
  formSubmit,
  handClear,
})
</script>

<style lang="scss" scoped>
@use '@/styles/app-manage.scss' as appManage;

.public-share-page {
  max-height: 400px;
  overflow-y: auto;
  padding: 32px 36px 40px;
  color: #334155;
  background: #fff;
}

.public-share-header {
  margin-bottom: 28px;
}

.public-share-title {
  margin: 0 0 24px;
  color: #1e293b;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
}

.public-share-desc,
.setting-desc {
  color: #8aa0bd;
  font-size: 13px;
  line-height: 1.6;
}

.public-share-desc {
  margin: 0;
}

.public-share-form {
  max-width: 594px;
  @include appManage.app-manage-form;
}

.config-section {
  padding: 0 0 22px;
  margin-bottom: 20px;
  border-bottom: 1px solid #edf2f7;
}

.config-section--toggle {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
}

.setting-copy {
  width: 100%;
  min-width: 0;
}

.setting-label,
.field-label {
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
}

.setting-control {
  width: auto;
  margin: 0;
  justify-self: end;
}

.setting-control--switch {
  :deep(.arco-form-item) {
    width: auto;
  }

  :deep(.arco-form-item-content) {
    width: auto;
  }

  :deep(.arco-form-item-wrapper-col) {
    min-height: auto;
  }
}

.field-item {
  max-width: 100%;
  margin-bottom: 22px;
}

.field-item--wide {
  max-width: 100%;
  margin-bottom: 0;
}

.field-item--public {
  max-width: 100%;

  :deep(.arco-form-item-extra) {
    width: 100%;

    .public-qrcode-panel {
      width: 100%;
    }
  }
}

.date-input,
.ip-textarea {
  width: 100%;
}

.public-url-box {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.public-url-copy-btn {
  width: 40px;
  padding: 0;
}

.public-qrcode-panel {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding-top: 8px;
}

.public-qrcode-divider {
  color: #94a3b8;
  font-size: 13px;
  line-height: 20px;
}

.public-qrcode-card {
  display: grid;
  justify-items: center;
  gap: 8px;
}

.public-qrcode-image {
  width: 164px;
  height: 164px;
  padding: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.public-qrcode-image.is-loading {
  cursor: wait;
  opacity: 0.7;
  pointer-events: none;
}

.public-qrcode-download {
  padding: 0;
}

.ip-textarea {
  :deep(.arco-textarea) {
    line-height: 1.55;
  }
}

.wechat-panel {
  padding-bottom: 2px;
}

.wechat-row {
  margin-bottom: 22px;
}

.wechat-row:last-child {
  margin-bottom: 0;
}

.field-label {
  margin-bottom: 8px;
}

.wechat-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.limit-options {
  width: 100%;
}

:deep(.arco-switch) {
  background-color: #cbd5e1;
}

:deep(.arco-switch-checked) {
  background-color: #3b82f6;
}

:deep(.arco-checkbox-label),
:deep(.arco-radio-label) {
  color: #475569;
  font-size: 13px;
}

:deep(.arco-checkbox-disabled) {
  opacity: 1;
}

:deep(.arco-checkbox-disabled .arco-checkbox-icon) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

@media (max-width: 640px) {
  .public-share-page {
    padding: 24px;
  }

  .config-section--toggle {
    align-items: flex-start;
  }

  .public-share-form,
  .field-item,
  .field-item--wide,
  .field-item--public {
    max-width: 100%;
  }
}
</style>
