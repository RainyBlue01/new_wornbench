import { Request } from '@/utils/request';

const request = new Request({});
//部门树
export function getDeptTree() {
  return request.get<any>('/internal/business/common/v1/deptTree');
}
//角色列表
export function getRoleList() {
  return request.get<any>('/internal/business/common/v1/roleList');
}
//职位列表
export function getPostList() {
  return request.get<any>('/internal/business/common/v1/postList');
}
//用户列表
export function getUserList(params: any) {
  return request.get<any>(`/internal/business/common/v1/userList`, { params });
}
//用户字典目录
export function userCatalogues() {
  return request.get<any>(`/internal/business/dict/cache/v1/userCatalogues`);
}
//目录字典项
export function getCacheList(catalogueCode: any) {
  return request.get<any>(`/internal/business/dict/cache/v1/${catalogueCode}`);
}
//应用分类列表
export function getCategoryCache() {
  return request.get<any>(`/internal/business/app/category/v1/list`);
}
//批量获取开发者
export function getDevelper() {
  return request.get<any>(`/internal/business/develper/cache/v1/batch`);
}
//查询授权菜单
export function getMenus() {
  return request.get<any>(`/internal/business/security/group/v1/user/menus`);
}
//根据名称及部门id查询可选人员
export function userComponentList(params: any) {
  return request.get<any>(`/internal/business/user/v1/userComponentList`, { params });
}
//根据用户id查询用户
export function getUsersByIds(data: any) {
  return request.post<any>(`/internal/business/user/v1/getUsersByIds`, data);
}
//根据部门id查询部门
export function getDeptsByIds(data: any) {
  return request.post<any>(`/internal/business/dept/v1/getDeptsByIds`, data);
}
//根据当前用户查询部门
export function getDeptByUser(params: any) {
  return request.get<any>(`/internal/business/dept/v1/getDeptByUser`, { params });
}
//管理应用下拉数据
export function getAppList() {
  return request.get<any>(`/internal/business/fill/manager/v1/getAppList`);
}
//获取应用表单设计
export function getAppForm(id: any) {
  return request.get<any>(`/internal/business/app/manager/v1/form/${id}`);
}

//关联组件查询下拉数据
export function relationComponentData(data: any) {
  return request.post<any>(`/internal/business/original/v1/relationComponentData`,data);
}