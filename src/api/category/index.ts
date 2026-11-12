import { Request } from '@/utils/request';

const request = new Request({});
//新增应用分类
export function addCategory(data: any) {
    return request.post<any>('/internal/business/app/category/v1', data);
}
//修改应用分类
export function putCategory(data: any, id: any) {
    return request.put<any>(`/internal/business/app/category/v1/${id}`, data);
}
//删除应用分类
export function deleteCategory(id: any) {
    return request.delete<any>(`/internal/business/app/category/v1/${id}`);
}
//应用分类列表
export function getCategory(params: any) {
    return request.get<any>(`/internal/business/app/category/v1`, params);
}