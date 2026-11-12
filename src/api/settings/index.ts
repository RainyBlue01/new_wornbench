import { Request } from "@/utils/request";

const request = new Request({});

//使用配置
export function applyConfig(configCode: any) {
  return request.get<any>(`/internal/business/config/apply/v1/${configCode}`);
}

//获取配置
export function getConfig(configCode: any) {
  return request.get<any>(`/internal/business/config/v1/${configCode}`);
}

//修改配置
export function updateConfig(id: any, data: any) {
  return request.put<any>(`/internal/business/config/v1/${id}`, data);
}
