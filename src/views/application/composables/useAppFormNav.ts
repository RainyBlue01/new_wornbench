import type { LocationQueryRaw, RouteLocationRaw } from 'vue-router';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

export type AppNavRole = 'create' | 'manage';
export type AppNavKey = 'form' | 'plugin' | 'rawdata' | 'datawrite' | 'webhook' | 'design' | 'manage';
export type AppFormFrom = 'application' | 'manager';

export interface AppNavItem {
  key: AppNavKey;
  label: string;
}

/** 与 myApps 右键菜单权限一致 */
export function getAppNavItems(role: AppNavRole, category?: number): AppNavItem[] {
  const cat = category ?? 1;
  const items: AppNavItem[] = [{ key: 'form', label: '表单信息' }];

  if (cat === 1 || cat === 2) {
    // items.push({ key: 'plugin', label: '表单插件' });
    items.push({ key: 'rawdata', label: '原始数据' });
    items.push({ key: 'datawrite', label: '数据写入' });
    items.push({ key: 'webhook', label: 'WebHook' });
  }
  if (cat === 1 || cat === 2 || cat === 3) {
    items.push({ key: 'design', label: '设计应用' });
  }
  if (role === 'create' || role === 'manage') {
    items.push({ key: 'manage', label: '应用管理' });
  }

  return items;
}

export function roleToFrom(role: AppNavRole): AppFormFrom {
  return role === 'create' ? 'application' : 'manager';
}

export function fromToRole(from?: string): AppNavRole {
  return from === 'manager' ? 'manage' : 'create';
}

/** 从当前路由解析来源页（应用填写 / 管理填写） */
export function resolveAppFormFrom(
  route: RouteLocationNormalizedLoaded,
  fallbackRole?: AppNavRole,
): AppFormFrom | undefined {
  const from = route.query.from as string | undefined;
  if (from === 'application' || from === 'manager') {
    return from;
  }
  if (fallbackRole) {
    return roleToFrom(fallbackRole);
  }
  return undefined;
}

/** 子页面跳转时携带 from，便于返回表单填写页 */
export function buildAppSubPageQuery(
  route: RouteLocationNormalizedLoaded,
  role: AppNavRole,
  extra: LocationQueryRaw = {},
): LocationQueryRaw {
  const id = route.query.id as string;
  const from = resolveAppFormFrom(route, role) ?? roleToFrom(role);
  return { id, from, ...extra };
}

export function getAppReturnRoute(route: RouteLocationNormalizedLoaded): RouteLocationRaw {
  const from = route.query.from as AppFormFrom | undefined;
  const id = route.query.id as string | undefined;

  if (from === 'application' && id) {
    return { name: 'application', query: { id } };
  }
  if (from === 'manager' && id) {
    return { name: 'manager', query: { id } };
  }
  return { name: 'myApps' };
}

export function getAppReturnLabel(route: RouteLocationNormalizedLoaded): string {
  const from = route.query.from as AppFormFrom | undefined;
  if (from === 'application' || from === 'manager') {
    return '返回表单填写';
  }
  return '返回应用管理';
}

const APP_VIEW_STORAGE_PREFIX = 'appFormActiveNav:';
const INLINE_NAV_KEYS: AppNavKey[] = ['form', 'plugin', 'rawdata', 'datawrite', 'webhook'];

export function getPersistedAppNav(appId?: string | null): AppNavKey {
  if (!appId) return 'form';
  const saved = localStorage.getItem(`${APP_VIEW_STORAGE_PREFIX}${appId}`);
  return INLINE_NAV_KEYS.includes(saved as AppNavKey) ? (saved as AppNavKey) : 'form';
}

export function setPersistedAppNav(appId: string | undefined | null, nav: AppNavKey) {
  if (!appId || !INLINE_NAV_KEYS.includes(nav)) return;
  localStorage.setItem(`${APP_VIEW_STORAGE_PREFIX}${appId}`, nav);
}

export function clearPersistedAppNav(appId: string | undefined | null) {
  if (!appId) return;
  localStorage.removeItem(`${APP_VIEW_STORAGE_PREFIX}${appId}`);
}
