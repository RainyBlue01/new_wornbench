import { Request } from '@/utils/request';

const request = new Request({});

export function getApp(params: any) {
  return request.get<any>(`/business/v1/app/${params}`);
}
export function tree(params: any) {
  return request.get<any>(`/business/v1/module/${params}`);
}
export function authorized(params: any) {
  return request.get<any>(`/business/v1/module/authorized/${params}`);
}

export function work_number(params: any) {
  return request.get<any>(`/business/v1/app_backlog/count/work_number`, { params });
}
export function addModule(data: any) {
  return request.post<any>(`/business/v1/module/addModule`, data);
}
export function modifyModule(data: any, id: any) {
  return request.put<any>(`/business/v1/module/modifyModule/${id}`, data);
}
export function addDirectory(data: any) {
  return request.post<any>(`/business/v1/module/addDirectory`, data);
}
export function deleteModule(id: any) {
  return request.delete<any>(`/business/v1/module/deleteModule/${id}`);
}
export function copy_form_module(data: any) {
  return request.post<any>(`/business/v1/module/copyFormModule`, data);
}
export function copy_report_module(moduleId: any) {
  return request.put<any>(`/business/v1/module/copyReportModule/${moduleId}`);
}
export function query_system_form(id: any) {
  return request.get<any>(`/business/v1/datasource/query_system_form/${id}`);
}
export function query_module(id: any) {
  return request.get<any>(`/business/v1/module/query_module/${id}`);
}
export function modifyParentDirectory(data: any) {
  return request.post<any>(`/business/v1/module/modifyParentDirectory`, data);
}
export function sort(data: any) {
  return request.post<any>(`/business/v1/module/sort`, data);
}
export function form_code() {
  return request.get<any>(`/business/v1/form/form_code`);
}
export function recycleList(params: any, val: any) {
  return request.get<any>(`/business/v1/recycle/${val}`, { params });
}
export function recover(params: any) {
  return request.put<any>(`/business/v1/recycle/recover/${params}`);
}
export function recycleDelete(params: any) {
  return request.delete<any>(`/business/v1/recycle/${params}`);
}
export function deleteAll(params: any) {
  return request.delete<any>(`/business/v1/recycle/deleteAll/${params}`);
}
export function uploadATTACH(data: any) {
  return request.post<any>(`/business/v1/file/uploadATTACH`, data);
}
//配置应用模板
export function printData(data: any, appid: any) {
  return request.post<any>(`/internal/business/print/v1/${appid}`, data);
}
//根据应用id 获取模板
export function getPrint(appid: any) {
  return request.get<any>(`/internal/business/print/v1/${appid}`);
}
//修改应用模板
export function updatePrint(data: any, id: any) {
  return request.put<any>(`/internal/business/print/v1/${id}`, data);
}
