import { getDeptsByIds, getUsersByIds } from '@/api/common/index'
import { useReferenceStore } from '@/store/modules/reference'


/**
 * 分批处理工具函数
 */
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * 递归提取表单中所有需要批量查询的 ID
 */
export const extractAllRelatedIds = (
  formList: any[],
  formData: any,
  ids: { userIds: Set<string>; deptIds: Set<string> } = { userIds: new Set(), deptIds: new Set() }
) => {
  formList.forEach(item => {
    const value = formData[item.__vModel__];

    // 处理用户选择器
    if (item.type === 'USER' && value) {
      const uIds = Array.isArray(value) ? value : [value];
      uIds.forEach(id => id && ids.userIds.add(String(id)));
    }

    // 处理部门选择器
    if (item.type === 'DEPT' && value) {
      const dIds = Array.isArray(value) ? value : [value];
      dIds.forEach(id => id && ids.deptIds.add(String(id)));
    }

    // 递归处理子表单
    if (item.children && item.children.length > 0 && Array.isArray(value)) {
      value.forEach((subData: any) => {
        extractAllRelatedIds(item.children, subData, ids);
      });
    }
  });
  return ids;
};

// 批量查询用户信息
const batchGetUsers = async (userIds: string[]): Promise<Map<string, any>> => {
  const referenceStore = useReferenceStore();
  const needQueryIds: string[] = [];
  const result = new Map<string, any>();

  // 1. 检查缓存
  userIds.forEach(id => {
    const cached = referenceStore.getUser(id);
    if (cached) {
      result.set(id, cached);
    } else {
      needQueryIds.push(id);
    }
  });

  if (needQueryIds.length === 0) return result;

  // 2. 分批请求 (每批 200 个)
  const batches = chunkArray(needQueryIds, 200);
  const promises = batches.map(async (batchIds) => {
    try {
      const res = await getUsersByIds(batchIds);
      if (Array.isArray(res)) {
        referenceStore.setUsers(res);
        res.forEach(u => result.set(u.id, u));
      }
    } catch (error) {
      // console.error('Batch get users failed:', error);
    }
  });

  await Promise.all(promises);
  return result;
};

// 批量查询部门信息
const batchGetDepts = async (deptIds: string[]): Promise<Map<string, any>> => {
  const referenceStore = useReferenceStore();
  const needQueryIds: string[] = [];
  const result = new Map<string, any>();

  // 1. 检查缓存
  deptIds.forEach(id => {
    const cached = referenceStore.getDept(id);
    if (cached) {
      result.set(id, cached);
    } else {
      needQueryIds.push(id);
    }
  });

  if (needQueryIds.length === 0) return result;

  // 2. 分批请求 (每批 200 个)
  const batches = chunkArray(needQueryIds, 200);
  const promises = batches.map(async (batchIds) => {
    try {
      const res = await getDeptsByIds(batchIds);
      if (Array.isArray(res)) {
        const depts = res.map(dept => ({ id: dept.id, label: dept.deptName, deptName: dept.deptName }));
        referenceStore.setDepts(depts);
        depts.forEach(d => result.set(d.id, d));
      }
    } catch (error) {
      // console.error('Batch get depts failed:', error);
    }
  });

  await Promise.all(promises);
  return result;
};

export { batchGetUsers, batchGetDepts }
