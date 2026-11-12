<template>
  <div class="fab-container" :class="{ 'fab-container-inner': inner }" v-show="visible">
    <transition name="fab-menu">
      <div class="fab-menu" v-if="showMenu">
        <div class="fab-menu-item" @click="$emit('create-form')">
          <div class="item-icon form-icon">
            <icon-apps />
          </div>
          <div class="item-content">
            <div class="item-title">创建表单应用</div>
            <div class="item-desc">数据收集填报</div>
          </div>
        </div>
        <div class="fab-menu-item" @click="$emit('create-flow')">
          <div class="item-icon flow-icon">
            <icon-share-alt />
          </div>
          <div class="item-content">
            <div class="item-title">创建流程应用</div>
            <div class="item-desc">审批流转办理</div>
          </div>
        </div>
        <div class="fab-menu-item" @click="$emit('create-report')">
          <div class="item-icon report-icon">
            <icon-bar-chart />
          </div>
          <div class="item-content">
            <div class="item-title">创建报表应用</div>
            <div class="item-desc">数据可视化分析</div>
          </div>
        </div>
      </div>
    </transition>
    <div 
      class="fab-button" 
      :class="{ 'fab-button-inner': inner, 'active': showMenu }" 
      @click="$emit('toggle')"
    >
      <icon-plus />
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  visible: boolean;
  showMenu: boolean;
  inner?: boolean;
}>();

defineEmits<{
  toggle: [];
  'create-form': [];
  'create-flow': [];
  'create-report': [];
}>();
</script>

<style lang="scss" scoped>
.fab-container {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.fab-container-inner {
  position: absolute;
  bottom: 32px;
  right: 32px;
  z-index: 10;
}

.fab-menu {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 8px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;

    .item-icon {
      transform: scale(1.1);
    }
  }

  .item-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    transition: transform 0.2s ease;

    &.form-icon {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: rgb(var(--primary-6));
    }

    &.flow-icon {
      background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
      color: #8b5cf6;
    }

    &.report-icon {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #f59e0b;
    }
  }

  .item-content {
    flex: 1;

    .item-title {
      font-size: 14px;
      color: #1e293b;
      line-height: 20px;
    }

    .item-desc {
      font-size: 12px;
      color: #94a3b8;
      line-height: 16px;
      margin-top: 2px;
    }
  }
}

.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(var(--primary-6)) 0%, #6366f1 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  z-index: 2;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);

    &:hover {
      box-shadow: 0 12px 32px rgba(239, 68, 68, 0.5);
    }

    svg {
      transform: rotate(45deg);
    }
  }

  svg {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.fab-button-inner {
  // 内部定位的 FAB 按钮样式继承自 .fab-button
}

.fab-menu-enter-active,
.fab-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom right;
}

.fab-menu-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.fab-menu-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
</style>
