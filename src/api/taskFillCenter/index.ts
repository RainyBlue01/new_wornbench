import { Request } from "@/utils/request";

const request = new Request({});

//填报数据
export function fillTaskData(data: any) {
    return request.post<any>(`/internal/business/fill/object/v1`, data)
}

//查询填报批次任务
export function fillBatchTaskPage(params: any) {
    return request.get<any>(`/internal/business/fill/object/v1/fillBatchTaskPage`, {
        params,
    });
}

//查询填报任务列表（工作台用）
export function fillBatchTaskList() {
    return request.get<any>(`/internal/business/fill/object/v1/fillBatchTaskList`);
}

//查看填报详情
export function getFillBatchTask(objectId: any) {
    return request.get<any>(`/internal/business/fill/common/v1/getFillBatchTask/${objectId}`)
}

//数据纠错记录-填报对象
export function fixRecordObjectPage(objectId: any, params: any) {
    return request.get<any>(`/internal/business/fill/fix/v1/object/recordPage/${objectId}`, {
        params,
    });
}

//查询审批进度
export function getApprovalProgress(processInstanceId: any) {
    return request.get<any>(`/internal/business/fill/common/v1/getApprovalProgress/${processInstanceId}`);
}
//导出填报数据
export function exportData(data: any, type: any) {
    return request.post<any>(`/internal/business/fill/common/v1/export/${type}`, data, {
        responseType: 'blob'
    });
}

// 判断流程重新发起是否存在填报任务详情
export function checkResetTaskDetail(processInstanceId: any) {
    return request.get<any>(`/internal/business/fill/object/v1/checkResetTaskDetail/${processInstanceId}`);
}
