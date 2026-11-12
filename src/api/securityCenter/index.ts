import { Request } from "@/utils/request";

const request = new Request({});
//新增安全组
export function addGroup(data: any) {
  return request.post<any>(`/internal/business/security/group/v1`, data);
}
//修改安全组
export function putGroup(id: any, data: any) {
  return request.put<any>(`/internal/business/security/group/v1/${id}`, data);
}
//删除安全组
export function deleteGroup(id: any) {
  return request.delete<any>(`/internal/business/security/group/v1/${id}`);
}

//列表查询
export function getGroupList() {
  return request.get<any>(`/internal/business/security/group/v1/listRecord`);
}

//获取应用
export function getApps() {
  return request.get<any>(`/internal/business/app/v1/allApp`);
}

//菜单树
export function getMenuTree() {
  return request.get<any>(`/internal/business/menu/v1/tree`);
}
//菜单授权
export function addMenuGrant(id: any, data: any) {
  return request.post<any>(
    `/internal/business/security/group/v1/menu/grant/${id}`,
    data,
  );
}
//授权菜单ids查询
export function getMenuGrantIds(groupId: any) {
  return request.get<any>(
    `/internal/business/security/group/v1/menu/grantIds/${groupId}`,
  );
}
//新增安全组用户
export function addUserGrant(groupId: any, data: any) {
  return request.post<any>(
    `/internal/business/security/group/v1/user/grant/${groupId}`,
    data,
  );
}
//移除安全组用户
export function deleteUserGrant(id: any, data: any) {
  return request.delete<any>(
    `/internal/business/security/group/v1/user/grant/${id}`,
    { data },
  );
}
//授权用户查询
export function grantUsers(id: any) {
  return request.get<any>(
    `/internal/business/security/group/v1/user/grantUsers/${id}`,
  );
}
//未授权用户查询
export function unGrantUsers(id: any) {
  return request.get<any>(
    `/internal/business/security/group/v1/user/unGrantUsers/${id}`,
  );
}
//新增应用授权
export function addGrantApp(id: any, data: any) {
  return request.post<any>(
    `/internal/business/security/group/v1/app/grant/${id}`,
    data,
  );
}
//移除应用授权
export function deleteGrantApp(id: any, data: any) {
  return request.delete<any>(
    `/internal/business/security/group/v1/app/grant/${id}`,
    { data },
  );
}
//授权应用查询
export function grantApps(id: any) {
  return request.get<any>(
    `/internal/business/security/group/v1/app/grantApps/${id}`,
  );
}
