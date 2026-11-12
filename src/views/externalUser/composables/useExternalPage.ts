import { ref, computed } from "vue";
import {
  getExtUserGroupList,
  createExtUserGroup,
  updateExtUserGroup,
  deleteExtUserGroup,
  getExtUsersByGroupId,
  addExtUser,
  batchDeleteExtUsers,
  putExtUser,
  getExtUserPageRecord,
  batchUpdateUserExternalGroup,
} from "@/api/externalUser/index";
import { toSnowflakeIdString } from "@/utils/snowflakeId";

const ACTIVE_GROUP_KEY = "externalActiveGroupId";

export class ExternalGroupDeleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExternalGroupDeleteError";
  }
}

export interface ExternalGroup {
  id: string | number;
  name: string;
  groupDesc?: string;
  isDefault?: boolean;
}

function loadActiveGroupId(): string | number | null {
  try {
    const raw = localStorage.getItem(ACTIVE_GROUP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function saveActiveGroupId(id: string | number) {
  localStorage.setItem(ACTIVE_GROUP_KEY, JSON.stringify(toSnowflakeIdString(id)));
}

function mapGroupItem(item: any): ExternalGroup {
  const name = item.groupName ?? item.name ?? "";
  return {
    id: toSnowflakeIdString(item.id),
    name,
    groupDesc: item.groupDesc,
    isDefault: item.isDefault === true || name === "默认分组",
  };
}

function mergeUserDetail(base: any, detail?: any) {
  if (!detail) return base;
  return {
    ...base,
    ...detail,
    id: toSnowflakeIdString(base.id ?? detail.id),
    nickname: detail.nickname ?? base.nickname,
    phone: detail.phone ?? base.phone,
    sex: detail.sex ?? base.sex,
    email: detail.email ?? base.email,
  };
}

export function useExternalPage() {
  const groups = ref<ExternalGroup[]>([]);
  const activeGroupId = ref<string | number | null>(loadActiveGroupId());
  const searchKeyword = ref("");
  const selectedIds = ref<(string | number)[]>([]);
  const allRecords = ref<any[]>([]);
  const loading = ref(false);
  const groupsLoading = ref(false);

  const pagination = ref({
    total: 0,
    pageNum: 1,
    pageSize: 10,
  });

  const defaultGroupId = computed(() => {
    const g = groups.value.find((item) => item.isDefault);
    return g?.id ?? groups.value[0]?.id ?? null;
  });

  const activeGroup = computed(() =>
    groups.value.find((g) => String(g.id) === String(activeGroupId.value)),
  );

  const pageTitle = computed(() => {
    const name = activeGroup.value?.name || "外部成员";
    return `${name} 成员`;
  });

  const filteredRecords = computed(() => {
    const kw = searchKeyword.value.trim().toLowerCase();
    if (!kw) return allRecords.value;
    return allRecords.value.filter(
      (u) =>
        (u.nickname || "").toLowerCase().includes(kw) ||
        (u.phone || "").includes(kw),
    );
  });

  const pageRecords = computed(() => {
    const start = (pagination.value.pageNum - 1) * pagination.value.pageSize;
    return filteredRecords.value.slice(start, start + pagination.value.pageSize);
  });

  const fetchGroups = async () => {
    groupsLoading.value = true;
    try {
      const res = await getExtUserGroupList();
      const list = Array.isArray(res) ? res : [];
      groups.value = list.map(mapGroupItem);
      if (!groups.value.length) {
        activeGroupId.value = null;
        return;
      }
      const stored = loadActiveGroupId();
      const exists = groups.value.some((g) => String(g.id) === String(stored));
      if (stored != null && exists) {
        activeGroupId.value = stored;
      } else {
        activeGroupId.value = defaultGroupId.value ?? groups.value[0].id;
      }
      saveActiveGroupId(activeGroupId.value as string | number);
    } finally {
      groupsLoading.value = false;
    }
  };

  const enrichMemberDetails = async (members: any[]) => {
    if (!members.length) return members;
    try {
      const page = await getExtUserPageRecord({
        userType: 2,
        active: 1,
        current: 1,
        size: 100,
        username: searchKeyword.value.trim() || undefined,
      });
      const detailMap = new Map<string, any>();
      (page?.records || []).forEach((u: any) => {
        detailMap.set(String(u.id), u);
      });
      return members.map((m) => mergeUserDetail(m, detailMap.get(String(m.id))));
    } catch {
      return members;
    }
  };

  const fetchList = async () => {
    if (activeGroupId.value == null) {
      allRecords.value = [];
      pagination.value.total = 0;
      return;
    }
    loading.value = true;
    try {
      const res = await getExtUsersByGroupId(activeGroupId.value);
      const members = (Array.isArray(res.records) ? res.records : []).map((m: any) => ({
        ...m,
        id: toSnowflakeIdString(m.id),
      }));
      allRecords.value = await enrichMemberDetails(members);
      pagination.value.total = res.total;
      const maxPage = Math.max(
        1,
        Math.ceil(pagination.value.total / pagination.value.pageSize),
      );
      if (pagination.value.pageNum > maxPage) {
        pagination.value.pageNum = 1;
      }
    } finally {
      loading.value = false;
    }
  };

  const search = () => {
    pagination.value.pageNum = 1;
    selectedIds.value = [];
    fetchList();
  };

  const selectGroup = async (id: string | number) => {
    activeGroupId.value = toSnowflakeIdString(id);
    saveActiveGroupId(activeGroupId.value);
    // 切换分组时清空搜索关键词，确保新分组数据完整显示
    searchKeyword.value = "";
    pagination.value.pageNum = 1;
    selectedIds.value = [];
    await fetchList();
  };

  const addGroup = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("分组名称不能为空");
    await createExtUserGroup({ groupName: trimmed });
    await fetchGroups();
    const created = groups.value.find((g) => g.name === trimmed);
    return created?.id ?? groups.value[groups.value.length - 1]?.id;
  };

  const getGroupMemberCount = async (id: string | number) => {
    try {
      const list = await getExtUsersByGroupId(id);
      return Array.isArray(list) ? list.length : 0;
    } catch {
      return 0;
    }
  };

  const updateGroup = async (id: string | number, name: string) => {
    const group = groups.value.find((g) => String(g.id) === String(id));
    if (group?.isDefault) {
      throw new Error("默认分组不可修改");
    }
    const trimmed = name.trim();
    if (!trimmed) throw new Error("分组名称不能为空");
    await updateExtUserGroup(id, {
      groupName: trimmed,
      groupDesc: group?.groupDesc,
    });
    await fetchGroups();
  };

  const deleteGroup = async (id: string | number) => {
    const group = groups.value.find((g) => String(g.id) === String(id));
    if (group?.isDefault) {
      throw new Error("默认分组不可删除");
    }
    const count = await getGroupMemberCount(id);
    if (count > 0) {
      throw new ExternalGroupDeleteError("该分组下仍有成员，请先移出成员");
    }
    await deleteExtUserGroup(id);
    if (String(activeGroupId.value) === String(id)) {
      activeGroupId.value = defaultGroupId.value;
      if (activeGroupId.value != null) saveActiveGroupId(activeGroupId.value);
    }
    await fetchGroups();
    await fetchList();
  };

  const createExternalUser = async (payload: {
    nickname: string;
    sex: number;
    phone: string;
    email: string;
    groupId: string | number;
  }) => {
    await addExtUser({
      groupId: payload.groupId,
      nickname: payload.nickname,
      sex: payload.sex,
      phone: payload.phone,
      email: payload.email,
    });
    try {
      await fetchGroups();
      await fetchList();
    } catch {
      /* 新增已成功，列表刷新失败不阻断关闭弹窗 */
    }
  };

  const deleteExternalUser = async (userId: string | number) => {
    await batchDeleteExtUsers([userId]);
    selectedIds.value = selectedIds.value.filter(
      (id) => String(id) !== String(userId),
    );
    await fetchGroups();
    await fetchList();
  };

  const batchDeleteExternalUsers = async (userIds: (string | number)[]) => {
    if (!userIds.length) return;
    await batchDeleteExtUsers(userIds);
    const removed = new Set(userIds.map((id) => String(id)));
    selectedIds.value = selectedIds.value.filter(
      (id) => !removed.has(String(id)),
    );
    await fetchGroups();
    await fetchList();
  };

  const moveUsersToGroup = async (
    userIds: (string | number)[],
    targetGroupId: string | number,
    sourceGroupId: string | number,
  ) => {
    if (!userIds.length) return;
    try {
      await batchUpdateUserExternalGroup({
        userIds,
        groupId: targetGroupId,
        sourceGroupId,
      });
    } catch {
      const idSet = new Set(userIds.map((id) => String(id)));
      const targets = allRecords.value.filter((u) => idSet.has(String(u.id)));
      await Promise.all(
        targets.map((u) =>
          putExtUser(u.id, {
            userType: 2,
            nickname: u.nickname,
            sex: u.sex ?? 1,
            phone: u.phone ?? "",
            email: u.email ?? "",
            documentType: u.documentType ?? "",
            documentNumber: u.documentNumber ?? "",
            externalGroupId: toSnowflakeIdString(targetGroupId),
          }),
        ),
      );
    }
  };

  const batchMoveToGroup = async (
    userIds: (string | number)[],
    targetGroupId: string | number,
  ) => {
    const sourceId = activeGroupId.value;
    if (sourceId == null) return;
    await moveUsersToGroup(userIds, targetGroupId, sourceId);
    selectedIds.value = [];
    await fetchGroups();
    const stillOnSource = String(activeGroupId.value) === String(sourceId);
    const nowOnTarget = String(activeGroupId.value) === String(targetGroupId);
    if (stillOnSource || nowOnTarget) {
      await fetchList();
    }
  };

  const removeUserFromGroup = async (userId: string | number) => {
    const targetId = defaultGroupId.value;
    if (targetId == null) return;
    if (String(activeGroupId.value) === String(targetId)) return;
    await moveUsersToGroup([userId], targetId, activeGroupId.value!);
    await fetchGroups();
    await fetchList();
  };

  const batchRemoveFromGroup = async (userIds: (string | number)[]) => {
    const targetId = defaultGroupId.value;
    if (targetId == null || !userIds.length) return;
    await moveUsersToGroup(userIds, targetId, activeGroupId.value!);
    selectedIds.value = [];
    await fetchGroups();
    await fetchList();
  };

  const onPageChange = (page: number) => {
    pagination.value.pageNum = page;
  };

  const onPageSizeChange = (size: number) => {
    pagination.value.pageSize = size;
    pagination.value.pageNum = 1;
  };

  const init = async () => {
    await fetchGroups();
    await fetchList();
  };

  return {
    groups,
    defaultGroupId,
    activeGroupId,
    activeGroup,
    pageTitle,
    searchKeyword,
    selectedIds,
    loading,
    groupsLoading,
    pagination,
    pageRecords,
    filteredRecords,
    fetchGroups,
    fetchList,
    init,
    search,
    selectGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    getGroupMemberCount,
    createExternalUser,
    deleteExternalUser,
    batchDeleteExternalUsers,
    batchMoveToGroup,
    batchRemoveFromGroup,
    removeUserFromGroup,
    onPageChange,
    onPageSizeChange,
  };
}
