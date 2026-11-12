/**
 * 菜单数据缓存服务
 * 提供菜单数据的持久化缓存和权限过滤功能
 */

interface MenuItem {
  menuCode: string;
  label: string;
  frontendCode?: string;
  children?: MenuItem[];
  [key: string]: any;
}

/** 创建应用菜单 frontendCode */
export const CREATE_APP_FRONTEND_CODE = "createApp";

interface MenuCache {
  data: MenuItem[];
  timestamp: number;
}

// 内存缓存
let menuCache: MenuCache | null = null;
/** 进行中的 menus 请求，用于合并并发调用 */
let inflightMenusRequest: Promise<MenuItem[]> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟

/**
 * 获取缓存的菜单数据
 * @param forceRefresh 是否强制刷新
 * @param fetchFn 获取菜单的异步函数
 * @returns 菜单数据
 */
export async function getCachedMenus(
  forceRefresh = false,
  fetchFn: () => Promise<MenuItem[]>
): Promise<MenuItem[]> {
  const now = Date.now();

  // 如果不强制刷新且缓存有效，直接返回缓存
  if (!forceRefresh && menuCache && (now - menuCache.timestamp) < CACHE_DURATION) {
    return menuCache.data;
  }

  // 合并并发请求，避免首页 banner 与 FAB 权限同时各打一次 menus
  if (!forceRefresh && inflightMenusRequest) {
    return inflightMenusRequest;
  }

  const request = (async () => {
    try {
      const data = await fetchFn();
      menuCache = {
        data: data || [],
        timestamp: Date.now(),
      };
      return menuCache.data;
    } catch (error) {
      console.error("获取菜单失败:", error);
      if (menuCache) {
        return menuCache.data;
      }
      return [];
    } finally {
      inflightMenusRequest = null;
    }
  })();

  if (!forceRefresh) {
    inflightMenusRequest = request;
  }

  return request;
}

/**
 * 清除菜单缓存
 */
export function clearMenuCache(): void {
  menuCache = null;
  inflightMenusRequest = null;
}

/**
 * 菜单树中是否包含指定 frontendCode（含子菜单）
 */
export function hasMenuFrontendCode(
  menus: MenuItem[],
  frontendCode: string,
): boolean {
  if (!frontendCode || !menus?.length) return false;

  for (const menu of menus) {
    if (menu.frontendCode === frontendCode || menu.menuCode === frontendCode) {
      return true;
    }
    if (menu.children?.length && hasMenuFrontendCode(menu.children, frontendCode)) {
      return true;
    }
  }
  return false;
}

/**
 * 根据权限过滤菜单（只显示有权限的菜单）
 * @param menus 原始菜单列表
 * @param allowedCodes 允许的菜单代码列表
 * @returns 过滤后的菜单列表
 */
export function filterMenusByPermission(
  menus: MenuItem[],
  allowedCodes: string[]
): MenuItem[] {
  if (!allowedCodes || allowedCodes.length === 0) {
    return menus;
  }

  return menus.filter((menu) => {
    // 检查当前菜单是否有权限
    const hasPermission = allowedCodes.includes(menu.menuCode);
    
    // 如果有子菜单，递归过滤
    if (menu.children && menu.children.length > 0) {
      menu.children = filterMenusByPermission(menu.children, allowedCodes);
    }
    
    return hasPermission || (menu.children && menu.children.length > 0);
  });
}

/**
 * 从 localStorage 获取用户有权限的菜单代码
 * @returns 菜单代码数组
 */
export function getUserAllowedMenuCodes(): string[] {
  try {
    const userInfo = localStorage.getItem("wornbench_useinfo");
    if (!userInfo) return [];
    
    const user = JSON.parse(userInfo);
    // 假设用户信息中包含 menuCodes 字段
    return user.menuCodes || user.permissions || [];
  } catch (error) {
    console.error("解析用户权限失败:", error);
    return [];
  }
}

/**
 * 获取并过滤菜单（结合缓存和权限）
 * @param fetchFn 获取菜单的异步函数
 * @param usePermission 是否使用权限过滤
 * @returns 过滤后的菜单数据
 */
export async function getFilteredMenus(
  fetchFn: () => Promise<MenuItem[]>,
  usePermission = true
): Promise<MenuItem[]> {
  // 获取缓存的菜单数据
  const menus = await getCachedMenus(false, fetchFn);
  
  // 如果不需要权限过滤，直接返回
  if (!usePermission) {
    return menus;
  }
  
  // 获取用户权限
  const allowedCodes = getUserAllowedMenuCodes();
  
  // 如果没有权限限制，返回所有菜单
  if (!allowedCodes || allowedCodes.length === 0) {
    return menus;
  }
  
  // 根据权限过滤菜单
  return filterMenusByPermission(menus, allowedCodes);
}
