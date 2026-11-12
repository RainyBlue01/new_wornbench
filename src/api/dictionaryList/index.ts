import { Request } from '@/utils/request';

const request = new Request({});
//新增字典目录
export function addCatalogue(params: any) {
  return request.post<any>('/internal/business/dict/v1/catalogue', params);
}
//修改字典目录
export function putCatalogue(params: any, data: any) {
  return request.put<any>(`/internal/business/dict/v1/catalogue/${params}`, data);
}
//目录列表
export function getCatalogue(params: any) {
  return request.get<any>(`/internal/business/dict/v1/catalogue`, { params });
}
//新增字典项
export function addDict(params: any) {
  return request.post<any>(`/internal/business/dict/v1/item`, params);
}
//修改字典项
export function putDict(params: any, data: any) {
  return request.put<any>(`/internal/business/dict/v1/item/${params}`, data);
}
//字典项列表
export function getDict(params: any) {
  return request.get<any>(`/internal/business/dict/v1/item/${params}`);
}
//更改字典项状态
export function changeItemActive(params: any) {
  return request.put<any>(`/internal/business/dict/v1/changeItemActive/${params}`);
}