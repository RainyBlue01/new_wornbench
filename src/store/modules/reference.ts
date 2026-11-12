import { defineStore } from 'pinia';
import { ref } from 'vue';

interface CacheItem {
  data: any;
  timestamp: number;
}

export const useReferenceStore = defineStore('reference', () => {
  // 用户缓存 Map<userId, userInfo>
  const userCache = ref<Map<string, CacheItem>>(new Map());
  // 部门缓存 Map<deptId, deptInfo>
  const deptCache = ref<Map<string, CacheItem>>(new Map());
  const postCache = ref<Map<string, CacheItem>>(new Map());
  // 字典缓存 Map<dictCode, dictList>
  const dictCache = ref<Map<string, CacheItem>>(new Map());

  // 缓存有效期 (默认 5 分钟)
  const CACHE_TTL = 5 * 60 * 1000;

  /**
   * 获取用户信息（带缓存）
   */
  const getUser = (userId: string): any | null => {
    const item = userCache.value.get(userId);
    if (item && Date.now() - item.timestamp < CACHE_TTL) {
      return item.data;
    }
    return null;
  };

  /**
   * 设置用户缓存
   */
  const setUser = (userId: string, data: any) => {
    userCache.value.set(userId, { data, timestamp: Date.now() });
  };

  /**
   * 批量设置用户缓存
   */
  const setUsers = (users: any[]) => {
    users.forEach(user => {
      if (user.id || user.userId) {
        setUser(user.id || user.userId, user);
      }
    });
  };

  /**
   * 获取部门信息（带缓存）
   */
  const getDept = (deptId: string): any | null => {
    const item = deptCache.value.get(deptId);
    if (item && Date.now() - item.timestamp < CACHE_TTL) {
      return item.data;
    }
    return null;
  };

  /**
   * 设置部门缓存
   */
  const setDept = (deptId: string, data: any) => {
    deptCache.value.set(deptId, { data, timestamp: Date.now() });
  };

  /**
   * 批量设置部门缓存
   */
  const setDepts = (depts: any[]) => {
    depts.forEach(dept => {
      if (dept.id || dept.deptId) {
        setDept(dept.id || dept.deptId, dept);
      }
    });
  };

  const getPost = (postId: string): any | null => {
    const item = postCache.value.get(postId);
    return item && Date.now() - item.timestamp < CACHE_TTL ? item.data : null;
  };

  const setPosts = (posts: any[]) => {
    posts.forEach(post => {
      const id = post.id || post.postId;
      if (id) postCache.value.set(String(id), { data: post, timestamp: Date.now() });
    });
  };

  /**
   * 清除所有缓存
   */
  const clearAll = () => {
    userCache.value.clear();
    deptCache.value.clear();
    postCache.value.clear();
    dictCache.value.clear();
  };

  return {
    userCache,
    deptCache,
    postCache,
    dictCache,
    getUser,
    setUser,
    setUsers,
    getDept,
    setDept,
    setDepts,
    getPost,
    setPosts,
    clearAll,
  };
});
