import { Request } from "@/utils/request";

const request = new Request({});
//新增职位
export function addJob(params: any) {
  return request.post<any>("/internal/business/post/v1", params);
}
//删除职位
export function deleteJob(params: any) {
  return request.delete<any>(`/internal/business/post/v1/${params}`);
}
//修改职位
export function putJob(params: any, data: any) {
  return request.put<any>(`/internal/business/post/v1/${params}`, data);
}
//分页查询职位列表
export function getJob(params: any) {
  return request.get<any>(`/internal/business/post/v1/pageRecord`, { params });
}

//职位列表
export function getPostList() {
  return request.get<any>(`/internal/business/post/v1`);
}
