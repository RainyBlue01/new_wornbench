import { Request } from "@/utils/request";
import { toSnowflakeIdString } from "@/utils/snowflakeId";

const request = new Request({});

/** 分组列表 */
export function getExtUserGroupList() {
  return request.get<any>("/internal/business/externalGroup/list");
}

/** 新增分组 */
export function createExtUserGroup(data: {
  groupName: string;
  groupDesc?: string;
}) {
  return request.post<any>("/internal/business/externalGroup/v1", data);
}

/** 修改分组 */
export function updateExtUserGroup(
  id: string | number,
  data: { groupName: string; groupDesc?: string },
) {
  return request.put<any>(`/internal/business/externalGroup/v1/${id}`, {
    id: toSnowflakeIdString(id),
    groupName: data.groupName,
    groupDesc: data.groupDesc,
  });
}

/** 删除分组 */
export function deleteExtUserGroup(id: string | number) {
  return request.delete<any>(`/internal/business/externalGroup/v1/${id}`);
}

/** 根据分组 id 获取用户列表 */
export function getExtUsersByGroupId(groupId: string | number) {
  return request.get<any>(`/internal/business/externalGroup/users/${groupId}`);
}

/** 新增外部用户 */
export function addExtUser(data: {
  groupId: string | number;
  nickname: string;
  sex: number;
  phone: string;
  email: string;
}) {
  return request.post<any>("/internal/business/externalGroup/addUser", {
    nickname: data.nickname,
    sex: data.sex,
    phone: data.phone,
    email: data.email,
    groupId: toSnowflakeIdString(data.groupId),
  });
}

/** 批量移除用户（逻辑删除，status=1） */
export function batchDeleteExtUsers(userIds: (string | number)[]) {
  const ids = userIds.map((id) => toSnowflakeIdString(id));
  return request.post<any>("/internal/business/externalGroup/batchDeleteUser", ids);
}

/** 移除单个外部用户（逻辑删除） */
export function deleteExtUser(userId: string | number) {
  return batchDeleteExtUsers([userId]);
}

/** 修改外部用户 */
export function putExtUser(userId: string | number, data: Record<string, any>) {
  return request.put<any>(`/internal/business/user/v1/${userId}`, data);
}

/** 分页查询用户（补充详情字段） */
export function getExtUserPageRecord(params: Record<string, any>) {
  return request.get<any>("/internal/business/user/v1/pageRecord", { params });
}

/** 根据用户 id 批量查询 */
export function getExtUsersByIds(ids: (string | number)[]) {
  return request.post<any>("/internal/business/user/v1/getUsersByIds", ids);
}

/** 批量移入用户到其他分组 */
export function batchUpdateUserExternalGroup(data: {
  userIds: (string | number)[];
  groupId: string | number;
  sourceGroupId: string | number;
}) {
  return request.post<any>("/internal/business/externalGroup/moveUser", {
    userIds: data.userIds.map((id) => toSnowflakeIdString(id)),
    groupId: toSnowflakeIdString(data.groupId),
    sourceGroupId: toSnowflakeIdString(data.sourceGroupId),
  });
}

/** 批量应用转让（应用归属转让，非移组） */
export { batchAppTransfer } from '@/api/homePage/index';
