import { Request } from "@/utils/request";

const request = new Request({});
//流程统计
export function processTotal() {
    return request.get<any>("/internal/business/processCenter/v1/processTotal");
}
//获取应用流程列表
export function appList(params: any) {
    return request.get<any>("/internal/business/processCenter/v1/appList", { params });
}
//获取流程记录列表
export function recordList(params: any) {
    return request.post<any>("/internal/business/processCenter/v1/record", params);
}
//催办
export function urgent(processInstanceId: string) {
    return request.post<any>(`/internal/business/processCenter/reminder/${processInstanceId}`);
}
//填写
export function input(data) {
    return request.post<any>(`/internal/business/processCenter/input`, data);
}
//填写任务转交
export function inputAssign(data) {
    return request.post<any>(`/internal/business/processCenter/inputAssign`, data);
}
//流程审批通过
export function approvePass(data) {
    return request.post<any>(`/internal/business/processCenter/approvePass`, data);
}
//流程审批拒绝
export function approveRefuse(data) {
    return request.post<any>(`/internal/business/processCenter/approveRefuse`, data);
}
//流程审批转交
export function approveAssign(data) {
    return request.post<any>(`/internal/business/processCenter/approveAssign`, data);
}
//流程审批退回
export function approveBack(data) {
    return request.post<any>(`/internal/business/processCenter/approveBack`, data);
}
//流程审批退回
export function stopProcessCenter(id) {
    return request.post<any>(`/internal/business/processCenter/stop/${id}`);
}