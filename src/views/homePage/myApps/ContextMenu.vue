<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="app-context-menu-overlay" 
      @click="$emit('close')"
      @contextmenu.prevent
    >
      <div 
        class="app-context-menu" 
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
        @click.stop
      >
        <div 
          v-for="btn in buttons" 
          :key="btn.key" 
          class="app-context-menu-item"
          @click="$emit('action', btn.key)"
        >
          <span class="item-label">{{ btn.label }}</span>
        </div>
        <div v-if="buttons.length === 0" class="app-context-menu-empty">暂无可用操作</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">

interface MenuButton {
  key: string;
  label: string;
}

defineProps<{
  visible: boolean;
  position: { x: number; y: number };
  buttons: MenuButton[];
}>();

defineEmits<{
  close: [];
  action: [key: string];
}>();
</script>

<style lang="scss" scoped>
.app-context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

.app-context-menu {
  position: fixed;
  min-width: 140px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: contextMenuFadeIn 0.15s ease-out;
}

.app-context-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #334155;
  
  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
  
  &:active {
    background: #e2e8f0;
  }
}

.app-context-menu-empty {
  padding: 12px 14px;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
