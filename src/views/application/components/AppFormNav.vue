<template>
  <nav v-if="navItems.length" class="app-form-nav" aria-label="应用视图切换">
    <button
      v-for="item in navItems"
      :key="item.key"
      type="button"
      class="app-form-nav__btn"
      :class="activeKey === item.key ? 'app-form-nav__btn--active' : 'app-form-nav__btn--ghost'"
      @click="onNavClick(item.key)"
    >
      {{ item.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  buildAppSubPageQuery,
  getAppNavItems,
  type AppNavKey,
  type AppNavRole,
} from '../composables/useAppFormNav';

const props = defineProps<{
  role: AppNavRole;
  activeKey: AppNavKey;
  category?: number;
  appdes?: Record<string, any>;
  /** 表单信息/原始数据在同一页切换，不走路由 */
  inline?: boolean;
}>();

const emit = defineEmits<{
  openManage: [];
  navChange: [key: AppNavKey];
  designApp: [];
}>();

const route = useRoute();
const router = useRouter();

const navItems = computed(() =>
  getAppNavItems(props.role, props.category ?? props.appdes?.category),
);

const onNavClick = (key: AppNavKey) => {
  if (key === props.activeKey) return;

  if (
    props.inline &&
    (key === 'form' || key === 'plugin' || key === 'rawdata' || key === 'datawrite' || key === 'webhook')
  ) {
    emit('navChange', key);
    return;
  }

  const app = props.appdes ?? {};
  const category = props.category ?? app.category;
  const baseQuery = buildAppSubPageQuery(route, props.role);

  switch (key) {
    case 'form':
      router.push({
        path: props.role === 'create' ? '/application' : '/manager',
        query: { id: baseQuery.id },
      });
      break;
    case 'rawdata':
      router.push({
        path: '/originalData',
        query: {
          ...baseQuery,
          formId: app.formId,
          processId: app.processId,
          appName: app.appName,
        },
      });
      break;
    case 'design':
      emit('designApp');
      if (category === 3) {
        router.push({
          path: '/designer',
          query: { ...baseQuery, type: String(category) },
        });
      } else {
        router.push({
          path: '/form',
          query: { ...baseQuery, type: String(category) },
        });
      }
      break;
    case 'manage':
      emit('openManage');
      break;
  }
};
</script>

<style lang="scss" scoped>
.app-form-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-form-nav__btn {
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
  font-family: inherit;
  line-height: 1.4;

  &--ghost {
    background: transparent;
    color: #64748b;

    &:hover {
      background: #f1f5f9;
      color: #334155;
    }
  }

  &--active {
    background: #dbeafe;
    color: #2563eb;
    font-weight: 600;
  }

}
</style>
