<template>
    <div :class="['q-input', { 'q-input--with-preview': showUrlPreview }]">
        <a-input :allowClear="comDes.props.allowClear" :placeholder="comDes.props.placeholder"
            :readonly="comDes.props.readonly" :disabled="comDes.props.disabled"
            :max-length="comDes.props.showWordLimit ? comDes.props.maxLength : 10000"
            :show-word-limit="comDes.props.showWordLimit" v-model="comDes.props.value" />
        <a-button v-if="showUrlPreview" type="outline" :disabled="!urlValue" @click.stop="openPreview">
            {{ previewButtonText }}
        </a-button>
    </div>

    <a-modal v-model:visible="previewVisible" width="1120px" :footer="false"
        :render-to-body="true" :unmount-on-close="true" :modal-style="previewModalStyle"
        :body-style="previewBodyStyle"
        :modal-class="previewModalClass"
        :fullscreen="previewFullscreen" @close="resetPreviewModal">
        <template #title>
            <span>URL 预览</span>
            <a-tooltip :content="previewFullscreen ? '退出全屏' : '全屏'">
                <button class="q-url-preview__fullscreen-button" type="button"
                    :aria-label="previewFullscreen ? '退出全屏' : '全屏'" @click.stop="toggleFullscreen">
                    <icon-fullscreen-exit v-if="previewFullscreen" />
                    <icon-fullscreen v-else />
                </button>
            </a-tooltip>
        </template>
        <div class="q-url-preview__content">
            <div class="q-url-preview__viewport">
                <a-spin :loading="previewLoading" class="q-url-preview__loading">
                    <iframe v-if="previewUrl" class="q-url-preview__frame" :src="previewUrl"
                        :title="`${comDes.title || 'URL'}预览`" referrerpolicy="strict-origin-when-cross-origin"
                        @load="previewLoading = false" />
                </a-spin>
            </div>
        </div>
    </a-modal>
</template>

<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconFullscreen, IconFullscreenExit } from '@arco-design/web-vue/es/icon'

const props = defineProps<{
    comDes: any,
    showEdit: any,
    formConfs: any,
}>()

const previewVisible = shallowRef(false)
const previewLoading = shallowRef(false)
const previewFullscreen = shallowRef(false)
const previewUrl = shallowRef('')
const previewModalClass = computed(() => previewFullscreen.value
    ? 'q-url-preview-modal q-url-preview-modal--fullscreen'
    : 'q-url-preview-modal')
const previewModalStyle = computed(() => ({
    maxWidth: previewFullscreen.value ? '100vw' : 'calc(100vw - 48px)',
    height: previewFullscreen.value ? '100%' : 'min(648px, calc(100vh - 48px))',
    maxHeight: '100%',
    display: 'inline-flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: previewFullscreen.value ? '0' : '12px',
}))
const previewBodyStyle = computed(() => ({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
    width: '100%',
    minHeight: '0',
    height: 'calc(100% - 48px)',
    maxHeight: 'none',
    overflow: 'hidden',
    padding: '16px 24px',
}))
const urlValue = computed(() => String(props.comDes?.props?.value ?? '').trim())
const previewButtonText = computed(() =>
    String(props.comDes?.props?.previewText ?? '').trim() || '预览',
)
const isUrlComponent = computed(() =>
    String(props.comDes?.type ?? props.comDes?.inputType ?? '').trim().toUpperCase() === 'URL',
)
const isPreviewEnabled = computed(() => {
    const value = props.comDes?.props?.previewEnabled
    return value === true || value === 1 || value === '1' || value === 'true'
})
const showUrlPreview = computed(() =>
    isUrlComponent.value && isPreviewEnabled.value,
)

const getSafePreviewUrl = (value: string) => {
    try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
    } catch {
        return ''
    }
}

const openPreview = () => {
    const safeUrl = getSafePreviewUrl(urlValue.value)
    if (!safeUrl) {
        Message.warning('请输入有效的 http 或 https URL')
        return
    }
    previewUrl.value = safeUrl
    previewLoading.value = true
    previewFullscreen.value = false
    previewVisible.value = true
}

const toggleFullscreen = () => {
    previewFullscreen.value = !previewFullscreen.value
}

const resetPreviewModal = () => {
    previewFullscreen.value = false
    previewLoading.value = false
}

</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.q-input {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.q-input--with-preview :deep(.arco-input-wrapper) {
    flex: 1;
    min-width: 0;
}

.q-url-preview__content {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}

.q-url-preview__fullscreen-button {
    position: absolute;
    top: 8px;
    right: 48px;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    color: #94a3b8;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 8px;
    transition: all 0.2s;
}

.q-url-preview__fullscreen-button:hover {
    color: #475569;
    background: #f1f5f9;
}

.q-url-preview__viewport {
    flex: 1;
    height: 0;
    min-height: 0;
    overflow: hidden;
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    background: var(--color-fill-1);
}

.q-url-preview__loading {
    display: flex;
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 0;
}

.q-url-preview__loading :deep(.arco-spin-children) {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 0;
}

.q-url-preview__frame {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
}

:global(.q-url-preview-modal) {
    display: inline-flex !important;
    flex-direction: column;
    overflow: hidden;
}

:global(.q-url-preview-modal .arco-modal-body) {
    display: flex;
    flex: 1 1 0 !important;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: calc(100% - 48px) !important;
    min-height: 0;
    max-height: none !important;
    overflow: hidden;
}

:global(.q-url-preview-modal--fullscreen) {
    height: 100% !important;
    max-height: 100% !important;
}

</style>
