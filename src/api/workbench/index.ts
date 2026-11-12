import { Request } from "@/utils/request";

const request = new Request({});

//获取当前用户待办事项的应用列表
export function getWorkbenchCount(params: any) {
  return request.get<any>("/internal/business/workbench/v1/count", { params });
}

//获取当前用户待办事项的应用列表
export function getPendingApps() {
  return request.get<any>("/internal/business/workbench/pending/v1/apps");
}

//查询待办事项分页数据
export function pendingRecord(params: any) {
  return request.get<any>("/internal/business/workbench/pending/v1/record", {
    params,
  });
}

//任务转交
export function delegate(data: any) {
  return request.post<any>("/internal/business/workbench/pending/v1/delegate", data);
}

//填写完成
export function inputComplete(data: any) {
  return request.post<any>("/internal/business/workbench/pending/v1/inputComplete", data);
}

//审批通过
export function approvePass(data: any) {
  return request.post<any>("/internal/business/workbench/pending/v1/approvePass", data);
}

//审批拒绝
export function approveReject(data: any) {
  return request.post<any>("/internal/business/workbench/pending/v1/approveReject", data);
}

//审批退回
export function approveBack(data: any) {
  return request.post<any>("/internal/business/workbench/pending/v1/approveBack", data);
}

//获取当前用户申请记录的应用列表
export function getApplyApps() {
  return request.get<any>("/internal/business/workbench/apply/v1/apps");
}

//查询申请记录分页数据
export function applyRecord(params: any) {
  return request.get<any>("/internal/business/workbench/apply/v1/record", {
    params,
  });
}

//撤回申请
export function revokeApply(data: any) {
  return request.post<any>("/internal/business/workbench/apply/v1/revoke?processInstanceId=" + data.processInstanceId);
}

//终止申请
export function terminateApply(data: any) {
  return request.post<any>("/internal/business/workbench/apply/v1/terminate", data);
}

//加急处理
export function urgentApply(data: any) {
  return request.post<any>("/internal/business/workbench/apply/v1/urgent?processInstanceId=" + data.processInstanceId);
}

//获取当前用户已办事项的应用列表
export function getHandlerApps() {
  return request.get<any>("/internal/business/workbench/handler/v1/apps");
}

//查询已办事项分页数据
export function handlerRecord(params: any) {
  return request.get<any>("/internal/business/workbench/handler/v1/record", {
    params,
  });
}

//获取当前用户抄送的应用列表
export function getNoticeApps() {
  return request.get<any>("/internal/business/workbench/notice/v1/apps");
}

//查询抄送分页数据
export function noticeRecord(params: any) {
  return request.get<any>("/internal/business/workbench/notice/v1/record", {
    params,
  });
}

//抄送已读
export function readNotice(noticeId: any) {
  return request.post<any>(`/internal/business/workbench/notice/v1/read/${noticeId}`);
}
//获取流程审批日志
export function processInstanceIdLog(processInstanceId: any) {
  return request.get<any>(`/internal/business/process/v1/log/${processInstanceId}`);
}
//获取流程详情—待办
export function pendingWorkbench(taskId: any) {
  return request.get<any>(`/internal/business/workbench/pending/v1/${taskId}`);
}
//获取流程详情—发起
export function applyWorkbench(processInstanceId: any) {
  return request.get<any>(`/internal/business/workbench/apply/v1/${processInstanceId}`);
}
//获取流程详情—已办
export function handlerWorkbench(taskId: any) {
  return request.get<any>(`/internal/business/workbench/handler/v1/${taskId}`);
}

//已办撤回
export function revokeHandler(data: { taskId: number | string; reason?: string }) {
  return request.post<any>("/internal/business/workbench/handler/v1/revoke", data);
}
//获取流程详情—抄送
export function noticeWorkbench(executionId: any) {
  return request.get<any>(`/internal/business/workbench/notice/v1/${executionId}`);
}
//获取流程执行候选人
export function processCandidates(processInstanceId: any) {
  return request.get<any>(`/internal/business/processCenter/processCandidates/${processInstanceId}`);
}
//获取流程节点执行候选人
export function executionCandidates(processInstanceId: any, executionId: any) {
  return request.get<any>(`/internal/business/processCenter/executionCandidates/${processInstanceId}/${executionId}`);
}
//打印
export function exportWorkbench(data: any, type: any) {
  return request.post<any>(`/internal/business/processCenter/export/${type}`, data, {
    responseType: 'blob'
  });
}
//打印
export function printForm(formId: any) {
  return request.get<any>(`/internal/business/print/v1/form/${formId}`);
}
// 获取完成流程最后一个历史活动id
export function getProcessId(processInstanceId: any) {
  return request.get<any>(`/internal/business/process/v1/execution/activity/${processInstanceId}`);
}
// 变更记录
export function compareRecord(params: any) {
  return request.get<any>(`/internal/business/dataLifecycle/v1/compareRecord`, { params });
}

// 获取流程结束状态
export function getFinishStatus(processInstanceId: any) {
  return request.get<any>(`/internal/business/workbench/finishStatus/${processInstanceId}`);
}