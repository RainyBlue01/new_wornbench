import { Request } from '@/utils/request';

const request = new Request({});
//新增部门
export function addDept(params: any) {
  return request.post<any>('/internal/business/dept/v1', params);
}
//删除部门
export function deleteDept(params: any) {
  return request.delete<any>(`/internal/business/dept/v1/${params}`);
}
//修改部门
export function putDept(params: any, data: any) {
  return request.put<any>(`/internal/business/dept/v1/${params}`, data);
}
//部门树
export function getDept() {
  return request.get<any>(`/internal/business/dept/v1/tree`);
}
//导入
export function importDept(data:any) {
  return request.post<any>(`/internal/business/dept/v1/import`,data);
}
// 同步部门
export function syncDepts() {
  return request.get<any>('/internal/business/v1/sync/depts');
}
