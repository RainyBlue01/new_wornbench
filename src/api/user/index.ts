import { Request } from '@/utils/request';

const request = new Request({});
//新增用户信息
export function addUser(params: any) {
  return request.post<any>('/internal/business/user/v1', params);
}
//删除用户信息
export function deleteUser(params: any) {
  return request.delete<any>(`/internal/business/user/v1/${params}`);
}
//修改用户信息
export function putUser(params: any, data: any) {
  return request.put<any>(`/internal/business/user/v1/${params}`, data);
}
//分页查询用户
export function getUser(params: any) {
  return request.get<any>(`/internal/business/user/v1/pageRecord`, { params });
}
//修改用户在职状态
export function changeActive(params: any) {
  return request.post<any>(`/internal/business/user/v1/changeActive`, params);
}
//修改用户登录状态
export function changeState(params: any) {
  return request.post<any>(`/internal/business/user/v1/changeState`, params);
}
//重置用户登录密码
export function resetPassword(params: any) {
  return request.post<any>(`/internal/business/user/v1/resetPassword`, params);
}
//修改用户身份信息
export function changeIdentity(params: any) {
  return request.post<any>(`/internal/business/user/v1/changeIdentity`, params);
}
//添加用户兼任部门
export function addPartTimeDept(params: any) {
  return request.post<any>(`/internal/business/user/v1/addPartTimeDept`, params);
}
//免去兼任部门职位
export function dismissPartTimeDept(params: any) {
  return request.post<any>(`/internal/business/user/v1/dismissPartTimeDept`, params);
}
//设置部门负责人
export function setupDeptLeader(params: any) {
  return request.post<any>(`/internal/business/user/v1/setupDeptLeader`, params);
}
//批量离职
export function batchLeave(params: any) {
  return request.post<any>(`/internal/business/user/v1/batchLeave`, params);
}
//获取在职无部门人数
export function getNoDeptNum(param) {
  return request.get<any>(`/internal/business/user/v1/getNoDeptNum`, { params: param });
}
//获取在职无部门人数
export function updateRole(data:any) {
  return request.post<any>(`/internal/business/user/v1/updateRole`,data);
}
//修改所属部门
export function updateDept(data:any) {
  return request.post<any>(`/internal/business/user/v1/updateDept`,data);
}

//批量移除用户角色
export function updateUserBatch(data:any) {
  return request.post<any>(`/internal/business/role/userBatch`,data);
}
//批量移除用户分管领导
export function updateUserChargeBatch(data:any) {
  return request.post<any>(`/internal/business/charge/userBatch`,data);
}
export interface UserExportPayload {
  /** 1-下载选中 2-下载当前职位/全部成员 */
  exportType: 1 | 2;
  /** 职位 ID 列表，无职位筛选时传空数组 */
  postIds: string[];
  /** exportType=1 时传选中用户 ID */
  userIds?: string[];
}

// 批量导出用户（异步任务，前往任务中心下载）
export function exportBatch(data: UserExportPayload) {
  return request.post<any>(`/internal/business/user/exportBatch`, data);
}

// 导入用户
export function importUser(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<any>(`/internal/business/user/v1/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
// 同步用户
export function syncUsers() {
  return request.get<any>('/internal/business/v1/sync/users');
}
