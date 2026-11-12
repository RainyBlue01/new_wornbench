<template>
  <div class="iframe-preview-page">
    <div class="header">
      <div class="header-content">
        <h1 class="title">文件预览</h1>
        <div class="url-input-wrapper">
          <span class="label">源地址：</span>
          <input v-model="previewUrlInput" class="url-input" placeholder="请输入预览地址" @keyup.enter="refreshPreview" />
          <button class="refresh-btn" @click="refreshPreview" :disabled="statusType === 'loading'">
            <icon-refresh :spin="statusType === 'loading'" />
            <span>{{ statusType === 'loading' ? '加载中...' : '刷新' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div ref="imageViewer" class="iframe-container" :class="{ 'iframe-container--image': isImagePreview }">
      <!-- <div class="status-bar" :class="statusClass" v-if="statusText">
        {{ statusText }}
      </div> -->
      <template v-if="isImagePreview">
        <div class="image-toolbar">
          <div class="image-toolbar__file" :title="previewFileName">
            <span class="image-toolbar__file-icon" aria-hidden="true"></span>
            <span class="image-toolbar__file-name">{{ previewFileName }}</span>
          </div>
          <div class="image-toolbar__actions">
            <button class="viewer-action" type="button" title="缩小" :disabled="zoomPercent <= MIN_ZOOM"
              @click="zoomOut">
              <IconZoomOut />
            </button>
            <button class="zoom-value" type="button" title="恢复 100%" @click="resetImageView">
              {{ zoomPercent }}%
            </button>
            <button class="viewer-action" type="button" title="放大" :disabled="zoomPercent >= MAX_ZOOM"
              @click="zoomIn">
              <IconZoomIn />
            </button>
            <span class="toolbar-divider"></span>
            <button class="viewer-action" type="button" title="适应窗口" :class="{ active: fitToScreen }"
              @click="fitImageToScreen">
              <IconOriginalSize />
            </button>
            <button class="viewer-action" type="button" title="向左旋转" @click="rotateImage(-90)">
              <IconRotateLeft />
            </button>
            <button class="viewer-action" type="button" title="向右旋转" @click="rotateImage(90)">
              <IconRotateRight />
            </button>
            <button class="viewer-action" type="button" title="重置" @click="resetImageView">
              <IconRefresh />
            </button>
            <span class="toolbar-divider"></span>
            <button class="viewer-action" type="button" :title="isFullscreen ? '退出全屏' : '全屏'"
              @click="toggleFullscreen">
              <IconFullscreenExit v-if="isFullscreen" />
              <IconFullscreen v-else />
            </button>
          </div>
        </div>
        <div ref="imageStage" class="image-stage" @wheel.ctrl.prevent="handleZoomWheel">
          <div class="image-canvas">
            <img class="image-preview" :style="imageStyle" :src="previewUrl" :alt="previewFileName"
              @load="handleImageLoad" @error="handleError" />
          </div>
        </div>
      </template>
      <iframe v-else ref="previewFrame" :src="previewUrl" allowfullscreen frameborder="0" @load="handleLoad"
        @error="handleError"></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, nextTick, onMounted, onUnmounted, watch, useTemplateRef } from 'vue';
import type { CSSProperties } from 'vue';
import { useRoute } from 'vue-router';
import { buildAttachmentPreviewUrl, isImageAttachment, resolveAttachmentUrl } from '@/utils/attachmentUrl';
import {
  IconFullscreen,
  IconFullscreenExit,
  IconOriginalSize,
  IconRefresh,
  IconRotateLeft,
  IconRotateRight,
  IconZoomIn,
  IconZoomOut,
} from '@arco-design/web-vue/es/icon';

const route = useRoute();

// 完整的预览地址（使用代理路径避免跨域；无路由参数时作为测试默认值）
const defaultPreviewUrl =
  '';

// 输入框中的地址
const previewUrlInput = ref(defaultPreviewUrl);

// iframe 实际使用的地址
const previewUrl = ref(defaultPreviewUrl);

const isImagePreview = computed(() =>
  isImageAttachment(firstQuery(route.query.fileName)) || isImageAttachment(previewUrl.value),
);

const MIN_ZOOM = 25;
const MAX_ZOOM = 400;
const ZOOM_STEP = 25;
const zoomPercent = ref(100);
const rotation = ref(0);
const fitToScreen = ref(true);
const isFullscreen = ref(false);
const imageViewerRef = useTemplateRef<HTMLElement>('imageViewer');
const imageStageRef = useTemplateRef<HTMLElement>('imageStage');
const naturalSize = shallowRef({ width: 0, height: 0 });

const previewFileName = computed(() => {
  const queryName = firstQuery(route.query.fileName);
  if (queryName) return queryName;
  try {
    const pathname = new URL(previewUrl.value).pathname;
    return decodeURIComponent(pathname.split('/').pop() || '图片预览');
  } catch {
    return '图片预览';
  }
});

const imageStyle = computed<CSSProperties>(() => ({
  transform: `rotate(${rotation.value}deg)`,
  width: naturalSize.value.width
    ? `${naturalSize.value.width * zoomPercent.value / 100}px`
    : 'auto',
  height: 'auto',
  maxWidth: 'none',
  maxHeight: 'none',
}));

const setZoom = (value: number) => {
  zoomPercent.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  fitToScreen.value = false;
};

const zoomIn = () => setZoom(zoomPercent.value + ZOOM_STEP);
const zoomOut = () => setZoom(zoomPercent.value - ZOOM_STEP);

const fitImageToScreen = async () => {
  await nextTick();
  const stage = imageStageRef.value;
  const { width, height } = naturalSize.value;
  if (!stage || !width || !height) return;

  const quarterTurn = rotation.value % 180 !== 0;
  const displayWidth = quarterTurn ? height : width;
  const displayHeight = quarterTurn ? width : height;
  const availableWidth = Math.max(stage.clientWidth - 64, 1);
  const availableHeight = Math.max(stage.clientHeight - 64, 1);
  const scale = Math.min(availableWidth / displayWidth, availableHeight / displayHeight, 1);
  zoomPercent.value = Math.max(MIN_ZOOM, Math.round(scale * 100));
  fitToScreen.value = true;
};

const rotateImage = (degrees: number) => {
  rotation.value = (rotation.value + degrees + 360) % 360;
  fitToScreen.value = false;
};

const resetImageView = () => {
  zoomPercent.value = 100;
  rotation.value = 0;
  fitToScreen.value = false;
};

const prepareImageView = () => {
  zoomPercent.value = 100;
  rotation.value = 0;
  fitToScreen.value = true;
  naturalSize.value = { width: 0, height: 0 };
};

const handleImageLoad = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement;
  naturalSize.value = {
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
  handleLoad();
  if (fitToScreen.value) void fitImageToScreen();
};

const handleZoomWheel = (event: WheelEvent) => {
  if (event.deltaY < 0) zoomIn();
  else zoomOut();
};

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    await imageViewerRef.value?.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
};

const syncFullscreenState = () => {
  isFullscreen.value = document.fullscreenElement === imageViewerRef.value;
  if (fitToScreen.value) void fitImageToScreen();
};

const handleViewportResize = () => {
  if (fitToScreen.value) void fitImageToScreen();
};

// 解码后的文件地址（用于显示）
const decodedUrl = ref('');

/** 从输出中心等页面传入 fileId 时，拼预览服务地址（内层 url 为可访问的文件下载地址） */
function buildPreviewUrlFromFile(fileIdRaw: string, fileNameRaw: string) {
  const win = window as { api?: { dowUrl?: string } };
  const id = fileIdRaw.split(',')[0]?.trim() || fileIdRaw;
  const base =
    typeof win.api?.dowUrl === 'string' && win.api.dowUrl.length > 0
      ? win.api.dowUrl
      : `${window.location.origin}/api/internal/business/file/v1/download?fileId=`;
  let fileDownloadUrl = `${base}${id}`;
  const token = localStorage.getItem('wornbench_token');
  if (token) {
    fileDownloadUrl += `&token=${encodeURIComponent(token)}`;
  }
  const name = fileNameRaw || 'file';
  return buildAttachmentPreviewUrl(fileDownloadUrl, name, fileIdRaw);
}

function firstQuery(val: unknown): string {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return '';
}

async function applyRouteQuery() {
  const q = route.query;
  const fullUrl = firstQuery(q.url);
  if (fullUrl) {
    previewUrlInput.value = fullUrl;
    previewUrl.value = fullUrl;
    updateDecodedUrl(fullUrl);
    statusType.value = 'loading';
    statusText.value = '正在加载文件预览...';
    if (timeoutTimer) clearTimeout(timeoutTimer);
    checkTimeout();
    return;
  }
  const fileId = firstQuery(q.fileId);
  const path = firstQuery(q.path) || fileId;
  const type = firstQuery(q.type);
  const fileName = firstQuery(q.fileName);
  if (path) {
    const built = Number(type) === 2
      ? buildAttachmentPreviewUrl(
          await resolveAttachmentUrl({ path, type }),
          fileName || 'file',
          path,
        )
      : buildPreviewUrlFromFile(path, fileName);
    previewUrlInput.value = built;
    previewUrl.value = built;
    updateDecodedUrl(built);
    statusType.value = 'loading';
    statusText.value = '正在加载文件预览...';
    if (timeoutTimer) clearTimeout(timeoutTimer);
    checkTimeout();
    return;
  }
  previewUrlInput.value = defaultPreviewUrl;
  previewUrl.value = defaultPreviewUrl;
  updateDecodedUrl(defaultPreviewUrl);
  statusType.value = 'loading';
  statusText.value = '正在加载文件预览...';
  if (timeoutTimer) clearTimeout(timeoutTimer);
  checkTimeout();
}

// 状态管理
const statusText = ref('正在加载文件预览...');
const statusType = ref<'loading' | 'success' | 'error'>('loading');
const previewFrame = ref<HTMLIFrameElement | null>(null);
let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

// 计算状态样式类
const statusClass = computed(() => {
  switch (statusType.value) {
    case 'success':
      return 'status-success';
    case 'error':
      return 'status-error';
    default:
      return 'status-loading';
  }
});

// 更新解码后的地址显示（用 searchParams 避免与外层 &fileName= 混淆）
const updateDecodedUrl = (url: string) => {
  try {
    const u = new URL(url);
    const inner = u.searchParams.get('url');
    decodedUrl.value = inner ? decodeURIComponent(inner) : url;
  } catch {
    decodedUrl.value = url;
  }
};

const hideIframeFooter = () => {
  try {
    const doc = previewFrame.value?.contentDocument;
    if (!doc) return;

    const styleId = 'hide-fileview-footer-style';
    if (doc.getElementById(styleId)) return;

    const style = doc.createElement('style');
    style.id = styleId;
    style.textContent = `
      .index-module_footer_VLuTl,
      [class^="index-module_footer_"],
      [class*=" index-module_footer_"] {
        display: none !important;
      }
    `;
    (doc.head || doc.documentElement).appendChild(style);
  } catch {
    // Cross-origin iframe content cannot be styled from the parent page.
  }
};

// 刷新预览
const refreshPreview = () => {
  if (!previewUrlInput.value.trim()) {
    statusType.value = 'error';
    statusText.value = '❌ 请输入预览地址';
    return;
  }

  previewUrl.value = previewUrlInput.value;
  updateDecodedUrl(previewUrlInput.value);

  statusType.value = 'loading';
  statusText.value = '正在加载文件预览...';

  // 重置超时检测
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
  }
  checkTimeout();
};

// 加载成功处理
const handleLoad = () => {
  statusType.value = 'success';
  hideIframeFooter();
  setTimeout(hideIframeFooter, 300);
  statusText.value = '✅ 文件加载完成';

  // 3秒后隐藏状态栏
  setTimeout(() => {
    statusText.value = '';
  }, 3000);
};

// 加载失败处理
const handleError = () => {
  statusType.value = 'error';
  statusText.value = '❌ 文件加载失败，请检查网络连接';
};

// 超时检测
const checkTimeout = () => {
  timeoutTimer = setTimeout(() => {
    const frame = previewFrame.value as any;
    if (frame && frame.readyState !== 'complete') {
      statusType.value = 'error';
      statusText.value = '⚠️ 加载超时，如果内容未显示请检查地址是否可访问';
    }
  }, 30000);
};

onMounted(() => {
  applyRouteQuery();
  document.addEventListener('fullscreenchange', syncFullscreenState);
  window.addEventListener('resize', handleViewportResize);
});

watch(
  () => route.fullPath,
  () => {
    prepareImageView();
    applyRouteQuery();
  },
);

onUnmounted(() => {
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
  }
  document.removeEventListener('fullscreenchange', syncFullscreenState);
  window.removeEventListener('resize', handleViewportResize);
});
</script>

<style lang="scss" scoped>
.iframe-preview-page {
  width: 100%;
  height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: white;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
  flex-shrink: 0;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
    white-space: nowrap;
  }

  .url-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f1f5f9;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: rgb(var(--primary-6));
      background: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .label {
      color: #1e293b;
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
    }

    .url-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 12px;
      color: #64748b;
      font-family: 'Courier New', monospace;
      line-height: 1.5;

      &::placeholder {
        color: #94a3b8;
      }
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      svg {
        font-size: 14px;
      }
    }
  }
}

.iframe-container {
  flex: 1;
  background: white;
  margin: 16px 24px 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  min-height: 0;

  &--image {
    background: #e9eef4;
  }

  &:fullscreen {
    margin: 0;
    border: 0;
    border-radius: 0;
  }

  .image-toolbar {
    height: 46px;
    padding: 0 14px 0 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.98);
    border-bottom: 1px solid #d7dee8;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    z-index: 2;

    &__file {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #1e293b;
      font-size: 13px;
      font-weight: 600;
    }

    &__file-icon {
      width: 3px;
      height: 18px;
      border-radius: 99px;
      background: rgb(var(--primary-6));
      box-shadow: 5px 0 0 rgba(var(--primary-6), 0.18);
      flex-shrink: 0;
    }

    &__file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: 3px;
      flex-shrink: 0;
    }
  }

  .viewer-action,
  .zoom-value {
    height: 30px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.16s ease, color 0.16s ease, transform 0.16s ease;

    &:hover:not(:disabled) {
      color: rgb(var(--primary-6));
      background: #edf4ff;
    }

    &:active:not(:disabled) {
      transform: scale(0.94);
    }

    &:disabled {
      color: #cbd5e1;
      cursor: not-allowed;
    }

    &.active {
      color: rgb(var(--primary-6));
      background: #e8f2ff;
    }
  }

  .viewer-action {
    width: 32px;
    font-size: 16px;
  }

  .zoom-value {
    min-width: 54px;
    padding: 0 8px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .toolbar-divider {
    width: 1px;
    height: 18px;
    margin: 0 5px;
    background: #dbe2ea;
  }

  .status-bar {
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    transition: all 0.3s ease;
    flex-shrink: 0;

    &.status-loading {
      background: #fef3c7;
      color: #92400e;
      border-bottom: 1px solid #fde68a;
    }

    &.status-success {
      background: #d1fae5;
      color: #065f46;
      border-bottom: 1px solid #a7f3d0;
    }

    &.status-error {
      background: #fee2e2;
      color: #991b1b;
      border-bottom: 1px solid #fecaca;
    }
  }

  iframe {
    flex: 1;
    width: 100%;
    border: none;
    display: block;
    min-height: 0;

  }

  .image-stage {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    background:
      linear-gradient(45deg, rgba(148, 163, 184, 0.06) 25%, transparent 25%) 0 0 / 24px 24px,
      linear-gradient(-45deg, rgba(148, 163, 184, 0.06) 25%, transparent 25%) 0 12px / 24px 24px,
      #e9eef4;
  }

  .image-canvas {
    width: max-content;
    height: max-content;
    min-width: 100%;
    min-height: 100%;
    padding: 32px;
    box-sizing: border-box;
    display: grid;
    place-items: center;
  }

  .image-preview {
    display: block;
    flex: 0 0 auto;
    object-fit: contain;
    background: white;
    border-radius: 4px;
    box-shadow: 0 14px 38px rgba(30, 41, 59, 0.18), 0 2px 8px rgba(30, 41, 59, 0.12);
    transition: width 0.18s ease, transform 0.18s ease;
    transform-origin: center center;
  }
}

@media (max-width: 720px) {
  .iframe-container .image-toolbar {
    height: auto;
    min-height: 46px;
    padding: 8px 10px;
    flex-wrap: wrap;

    &__file {
      width: 100%;
    }

    &__actions {
      width: 100%;
      overflow-x: auto;
    }
  }
}
</style>
