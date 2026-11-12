import { Request } from "@/utils/request";

const request = new Request({});

//图标列表
export function getIconCacheList() {
  return request.get<any>("/internal/business/icon/cache/v1");
}

//图标列表
export function getIconList() {
  return request.get<any>("/internal/business/icon/v1");
}

//新增图标
export function uploadIcon(data: any) {
  return request.post<any>("/internal/business/icon/v1", data);
}

//删除图标
export function deleteIcon(id: any) {
  return request.delete<any>(`/internal/business/icon/v1/${id}`);
}
