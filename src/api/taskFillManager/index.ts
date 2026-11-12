import { Request } from "@/utils/request";

const request = new Request({});

//最近一次任务时间
export function getRecentlyTaskDate(data: any) {
    return request.post<any>('/internal/business/fill/manager/v1/getRecentlyTaskDate', data)
}

//创建填报任务
export function createFillTask(data: any) {
    return request.post<any>('/internal/business/fill/manager/v1', data)
}

//应用分类下拉框
export function getCategoryList() {
    return request.get<any>(`/internal/business/fill/manager/v1/getCategoryList`)
}

//获取任务列表
export function getFillTaskList(params: any) {
    return request.get<any>('/internal/business/fill/manager/v1/getFillTaskList', { params })
}

//获取任务批次列表
export function getTaskBatchList(taskId: number, params: any) {
    return request.get<any>(`/internal/business/fill/manager/v1/${taskId}/batchList`, { params })
}
//获取任务批次（任务填报人）
export function getTaskListByTaskId(taskId: string) {
    return request.get<any>(`/internal/business/fill/object/v1/batchList/${taskId}`)
}
//获取批次下填报对象分页
export function getTaskBatchObjectList(params: any) {
    return request.get<any>(`/internal/business/fill/manager/v1/objectList`, { params })
}

//获取待纠错数量
export function getFixRecordCount(batchId: number) {
    return request.get<any>(`/internal/business/fill/fix/v1/recordCount/${batchId}`)
}

//数据纠错
export function fillObjectDataFix(data: number) {
    return request.post<any>(`/internal/business/fill/fix/v1`, data)
}

//发起填报催办
export function fillObjectUrge(data: any) {
    return request.post<any>(`/internal/business/fill/manager/v1/urging`, data)
}

//发起重新填报
export function fillObjectLaunchReset(data: any) {
    return request.post<any>(`/internal/business/fill/manager/v1/launchReset`, data)
}

//批量发起重新填报
export function fillBatchLaunchReset(data: any) {
    return request.post<any>(`/internal/business/fill/manager/v1/batchLaunchReset`, data)
}


//修改任务状态
export function modifyTaskStatus(data: any) {
    return request.post<any>(`/internal/business/fill/manager/v1/modifyTaskStatus`, data)
}

//恢复填报任务
export function continueTask(taskId: number) {
    return request.post<any>(`/internal/business/fill/manager/v1/continueTask/${taskId}`)
}

//注销任务
export function revokeTask(taskId: number) {
    return request.post<any>(`/internal/business/fill/manager/v1/revokeTask/${taskId}`)
}

//修改任务名称
export function modifyTaskName(data: any) {
    return request.post<any>(`/internal/business/fill/manager/v1/modifyTaskName`, data)
}

//修改任务发布部门
export function modifyTaskPublisher(data: any) {
    return request.post<any>(`/internal/business/fill/manager/v1/modifyTaskPublisher`, data)
}

//修改任务监督人
export function modifyTaskSupervisor(data: any) {
    return request.post<any>(`/internal/business/fill/manager/v1/modifyTaskSupervisor`, data)
}

//修改任务周期
export function modifyTaskPeriod(data) {
    return request.post<any>(`/internal/business/fill/manager/v1/modifyTaskPeriod`, data)
}

//纠错记录
export function fixRecordPage(data) {
    return request.get<any>(`/internal/business/fill/fix/v1/recordPage`, { params: data })
}

//数据纠错审核
export function fixAudit(data) {
    return request.post<any>(`/internal/business/fill/fix/v1/audit`, data)
}
//导出excel pdf或word
export function printList(data: any, type: any) {
    return request.post<any>(`/internal/business/fill/manager/v1/printList/${type}`, data)
}
//获取详情
export function getFillBatchTask(objectId: any) {
    return request.get<any>(`/internal/business/fill/common/v1/getFillBatchTask/${objectId}`)
}

// 获取当前用户是否有任务监督权限
export function getSupervisorPermission() {
    return request.get<boolean>(`/internal/business/fill/common/v1/supervisorPermission`)
}

// 查询填报批次任务-任务监督员
export function getSupervisorFillBatchTaskList(params?: Record<string, any>) {
    return request.get<any>(`/internal/business/fill/object/v1/supervisorFillBatchTaskList`, { params })
}

// 获取任务监督批次详情
export function getFillBatchDetail(batchId: string | number) {
    return request.get<any>(`/internal/business/fill/object/v1/getFillBatchDetail/${batchId}`)
}

// 获取任务详情（含批次列表）
export function getFillTaskDetail(taskId: string | number) {
    return request.get<any>(`/internal/business/fill/object/v1/getFillTaskDetail/${taskId}`)
}

