<template>
  <div class="app-icon-selector">
    <div class="icon-selector-header">
      <span class="form-label">{{ label }}</span>
      <button type="button" class="icon-refresh" @click="refreshIcons">
        <IconRefresh /> 换一换
      </button>
    </div>
    <div class="icon-selector">
      <template v-for="icon in displayIcons" :key="icon.id">
        <button
          type="button"
          class="icon-option"
          :class="{ selected: isSelectedIcon(icon.id) }"
          :aria-label="isSelectedIcon(icon.id) ? '当前选中图标' : '选择此图标'"
          :aria-pressed="isSelectedIcon(icon.id)"
          @click="selectIcon(icon.id)"
        >
          <img :src="icon.url" alt="" />
          <span v-if="isSelectedIcon(icon.id)" class="selected-mark" aria-hidden="true">
            <IconCheck />
          </span>
        </button>
      </template>
      <a-upload
        action="/"
        accept="image/*"
        :show-file-list="false"
        :custom-request="customRequest"
      >
        <template #upload-button>
          <div class="icon-upload">
            <IconPlus />
          </div>
        </template>
      </a-upload>
      <button
        v-if="customIcon"
        type="button"
        class="icon-option icon-preview-custom"
        :class="{ selected: isSelectedIcon(customIcon.id) }"
        :aria-label="isSelectedIcon(customIcon.id) ? '当前选中图标' : '选择自定义图标'"
        :aria-pressed="isSelectedIcon(customIcon.id)"
        @click="selectCustomIcon"
      >
        <img :src="customIcon.url" alt="" />
        <span v-if="isSelectedIcon(customIcon.id)" class="selected-mark" aria-hidden="true">
          <IconCheck />
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { IconCheck, IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { getIconCacheList } from '@/api/iconLibrary/index'
import { upload } from '@/api/user'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    showIcon?: string | number | null
    label?: string
  }>(),
  {
    modelValue: null,
    showIcon: null,
    label: '图标',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'update:showIcon': [value: string | number | null]
}>()

const win = window as any
const ICON_PAGE_SIZE = 12
const allIcons = ref<any[]>([])
const iconPage = ref(0)
const customIcon = ref<{ id: string | number; url: string } | null>(null)
const isSameIconId = (
  first: string | number | null | undefined,
  second: string | number | null | undefined,
) => first != null && second != null && String(first) === String(second)

const isSelectedIcon = (iconId: string | number) =>
  isSameIconId(props.modelValue, iconId)

const displayIcons = computed(() => {
  const list = allIcons.value
  if (!list.length) return []
  const start = (iconPage.value * ICON_PAGE_SIZE) % list.length
  const count = Math.min(ICON_PAGE_SIZE, list.length)
  return Array.from({ length: count }, (_, i) => list[(start + i) % list.length])
})

const mapIconItem = (v: any) => ({
  ...v,
  url: v.id
    ? `${win.api.dowUrl}${v.id}&token=${localStorage.getItem('wornbench_token')}`
    : '',
})

const getIcons = () => {
  getIconCacheList().then((res) => {
    const uniqueIcons = new Map<string, any>()
    res.map(mapIconItem).forEach((icon: any) => {
      const key = String(icon.id)
      if (!uniqueIcons.has(key)) uniqueIcons.set(key, icon)
    })
    allIcons.value = [...uniqueIcons.values()]
    iconPage.value = 0
  })
}

const refreshIcons = () => {
  if (!allIcons.value.length) return
  iconPage.value += 1
}

const buildIconUrl = (iconId: string | number) =>
  `${win.api.dowUrl}${iconId}&token=${localStorage.getItem('wornbench_token')}`

const selectIcon = (iconId: string | number) => {
  emit('update:modelValue', iconId)
  emit('update:showIcon', buildIconUrl(iconId))
}

const selectCustomIcon = () => {
  if (!customIcon.value) return
  emit('update:modelValue', customIcon.value.id)
  emit('update:showIcon', customIcon.value.url)
}

const customRequest = (option: any) => {
  const { fileItem } = option
  const uploadForm = new FormData()
  uploadForm.append(
    'fileProfile',
    new Blob([JSON.stringify({ folder: 'appIcon' })], { type: 'application/json' }),
  )
  uploadForm.append('file', fileItem.file)

  upload(uploadForm).then((res: any) => {
    const iconId = res.data || res
    const url = buildIconUrl(iconId)
    customIcon.value = { id: iconId, url }
    emit('update:modelValue', iconId)
    emit('update:showIcon', url)
  })
}

watch(
  [() => props.modelValue, () => props.showIcon, displayIcons],
  ([iconId, url]) => {
    if (iconId === null || iconId === undefined || iconId === '') {
      customIcon.value = null
      return
    }

    const existsInCurrentPage = displayIcons.value.some((item) =>
      isSameIconId(item.id, iconId),
    )
    if (existsInCurrentPage) {
      customIcon.value = null
      return
    }

    const libraryIcon = allIcons.value.find((item) =>
      isSameIconId(item.id, iconId),
    )
    const previewUrl = libraryIcon?.url || (url ? String(url) : '')
    customIcon.value = previewUrl ? { id: iconId, url: previewUrl } : null
  },
  { immediate: true },
)

onMounted(() => {
  getIcons()
})

defineExpose({ refreshIcons, getIcons })
</script>

<style lang="scss" scoped>
.app-icon-selector {
  width: 100%;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.icon-selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.icon-refresh {
  font-size: 12px;
  color: rgb(var(--primary-6));
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.2s;
  line-height: 1;

  &:hover {
    background: #eff6ff;
  }

  :deep(.arco-icon) {
    font-size: 11px;
  }
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  :deep(.arco-upload) {
    width: auto;
    line-height: 1;
  }
}

.icon-option {
  position: relative;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid transparent;
  background: transparent;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.14);
  }

  &.selected {
    border-color: #fff;
    box-shadow:
      0 0 0 2px rgb(var(--primary-6)),
      0 6px 14px rgba(59, 130, 246, 0.22);
  }

  &:focus-visible {
    outline: 3px solid rgba(59, 130, 246, 0.22);
    outline-offset: 3px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
}

.selected-mark {
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgb(var(--primary-6));
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3);

  :deep(.arco-icon) {
    font-size: 8px;
    stroke-width: 4;
  }
}

.icon-upload {
  width: 44px;
  height: 44px;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
  flex-shrink: 0;

  &:hover {
    border-color: rgb(var(--primary-6));
    color: rgb(var(--primary-6));
    background: #eff6ff;
  }

  :deep(.arco-icon) {
    font-size: 16px;
  }
}
</style>
