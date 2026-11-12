import { Request } from "@/utils/request";
import { toSnowflakeIdString } from "@/utils/snowflakeId";

const request = new Request({});
//新增角色
export function addRole(params: any) {
  return request.post<any>("/internal/business/role/v1", params);
}
//删除角色
export function deleteRole(params: any) {
  return request.delete<any>(`/internal/business/role/v1/${params}`);
}
//修改角色
export function putRole(params: any, data: any) {
  return request.put<any>(`/internal/business/role/v1/${params}`, data);
}
//分页查询角色列表
export function getRole(params: any) {
  return request.get<any>(`/internal/business/role/v1/pageRecord`, { params });
}

//角色列表
export function getRoleList() {
  return request.get<any>(`/internal/business/role/v1`);
}

/** 为用户添加角色（角色成员管理） */
export function addRoleUser(
  userId: string | number,
  roleId: string | number,
) {
  const uid = toSnowflakeIdString(userId);
  return request.post<any>(`/internal/business/role/user/${uid}`, {
    roleId: toSnowflakeIdString(roleId),
  });
}

/** 批量添加用户到角色 */
export function addRoleBatchUser(
  roleId: string | number,
  userIds: (string | number)[],
) {
  return request.post<any>("/internal/business/role/addRoleBatchUser", {
    roleId: toSnowflakeIdString(roleId),
    userIds: userIds.map((id) => toSnowflakeIdString(id)),
  });
}

/** 移除用户角色（角色成员管理） */
export function removeRoleUser(
  userId: string | number,
  roleId: string | number,
) {
  const uid = toSnowflakeIdString(userId);
  return request.delete<any>(`/internal/business/role/user/${uid}`, {
    data: { roleId: toSnowflakeIdString(roleId) },
  });
}
