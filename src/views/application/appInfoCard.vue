<template>
  <div class="app-info-card">
    <div class="app-info-content">
      <div class="app-icon">
        <AppIconImage :src="appdes.showIcon as string" :alt="appdes.appName || ''" eager />
      </div>
      <div class="app-info-details">
        <div class="app-name-row">
          <h2 class="app-name">{{ appdes.appName || '未命名应用' }}</h2>
          <span v-if="draftId" class="status-tag tag-pending">草稿</span>
        </div>
        <p v-if="appDescription" class="app-description">{{ appDescription }}</p>
      </div>
    </div>
    <div v-if="showMeta || showPublishTask" class="app-meta">
      <div class="app-meta-left">
        <span v-if="creatorName" class="app-meta-item">
          <icon-user class="app-meta-icon" />
          创建人：{{ creatorName }}
        </span>
        <span v-if="appdes.createTime" class="app-meta-item">
          <icon-clock-circle class="app-meta-icon" />
          创建时间：{{ appdes.createTime }}
        </span>
      </div>
      <div v-if="showPublishTask" class="app-publish-task">
        <button type="button" class="app-publish-task__btn" @click="emit('publishTask')">
          将当前表单发布为周期性填报任务
        </button>
        <a-tooltip content="周期性填报任务：指按照固定时间周期重复执行的数据填报工作">
          <icon-question-circle class="app-publish-task__tip" />
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIconImage from '@/components/AppIconImage.vue'
import type { Appdes } from '@/types/form'

const props = defineProps<{
  appdes: Appdes
  draftId?: string
  showPublishTask?: boolean
}>()

const emit = defineEmits<{
  publishTask: []
}>()

const appDescription = computed(
  () => props.appdes.intro || props.appdes.des || '',
)

const creatorName = computed(
  () => props.appdes.createUser || props.appdes.nickname || props.appdes.creatorName || '',
)

const showMeta = computed(() => Boolean(creatorName.value || props.appdes.createTime))
</script>

<style lang="scss" scoped>
.app-info-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 24px;
  margin-bottom: 16px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }
}

.app-info-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background: #eff6ff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.app-info-details {
  flex: 1;
  min-width: 0;
}

.app-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.app-name {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.tag-pending {
  background: #fff7ed;
  color: #f97316;
}

.app-description {
  margin: 2px 0 0;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f9fafb;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
}

.app-meta-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  min-width: 0;
}

.app-publish-task {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.app-publish-task__btn {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
  line-height: 1.4;

  &:hover {
    background: #f1f5f9;
    color: #334155;
    border-color: #cbd5e1;
  }
}

.app-publish-task__tip {
  font-size: 13px;
  color: #94a3b8;
  cursor: help;
}

.app-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.app-meta-icon {
  font-size: 12px;
  color: #9ca3af;
}
</style>
