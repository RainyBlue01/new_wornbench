import { Request } from "@/utils/request";

const request = new Request({});
//重置开发者密钥
export function resetSecret(id: any) {
  return request.post<any>(`/internal/business/developer/v1/${id}/resetSecret`);
}
//开发者详情
export function getDeveloper(id: any) {
  return request.get<any>(`/internal/business/developer/v1/${id}`);
}
//删除开发者
export function deleteDeveloper(id: any) {
  return request.delete<any>(`/internal/business/developer/v1/${id}`);
}
//新增开发者
export function setSeveloper(data: any) {
  return request.post<any>(`/internal/business/developer/v1/`, data);
}
//分页查询开发者
export function getPageRecord(data: any) {
  return request.get<any>(`/internal/business/developer/v1/pageRecord`, {
    data,
  });
}
//禁用/启用开发者账号
export function setState(data: any) {
  return request.post<any>(
    `/internal/business/developer/v1/${data.id}/${data.active}`,
  );
}
//修改开发者
export function putSeveloper(data: any, id: any) {
  return request.put<any>(`/internal/business/developer/v1/${id}`, data);
}
//订阅分页记录
export function getSubscribePage(params: any) {
  return request.get<any>(`/internal/business/subscribe/v1/pageRecord`, { params });
}
//订阅应用
export function setSubscribe(data: any) {
  return request.post<any>(`/internal/business/subscribe/v1`, data);
}
//移除订阅
export function deleteSubscribe(id: any) {
  return request.delete<any>(`/internal/business/subscribe/v1/${id}`);
}
//修改订阅
export function putSubscribe(data: any, id: any) {
  return request.put<any>(`/internal/business/subscribe/v1/${id}`, data);
}
//禁用订阅
export function disableSubscribe(id: any) {
  return request.post<any>(`/internal/business/subscribe/v1/disable/${id}`);
}
//启用订阅
export function enableSubscribe(id: any) {
  return request.post<any>(`/internal/business/subscribe/v1/enable/${id}`);
}
//订阅应用下拉列表
export function subscribeApps(id: any) {
  return request.get<any>(`/internal/business/subscribe/v1/unSubscribeApps/${id}`);
}
//测试连接
export function testConnect(data: any) {
  return request.post<any>(`/internal/business/developer/v1/test/connect`, data);
}

