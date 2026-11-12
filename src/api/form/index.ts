import { Request } from "@/utils/request";
import { serializeFormDesignLogicValues } from '../../utils/formConditionValue'

const request = new Request({});
//应用设计
export function designApp(data: any, appId: any) {
  return request.put<any>(`/internal/business/app/v1/design/${appId}`, serializeFormDesignLogicValues(data));
}
//保存表单设计
export function formDesign(data: any, appId: any) {
  return request.put<any>(`/internal/business/app/v1/formDesign/${appId}`, serializeFormDesignLogicValues(data));
}
//我创建表单设计
export function getCreatorApp(appId: any) {
  return request.get<any>(`/internal/business/app/creator/v1/design/${appId}`);
}
//我管理的表单设计
export function getDesignApp(appId: any) {
  return request.get<any>(`/internal/business/app/manager/v1/design/${appId}`);
}
//可访问的表单设计
export function getVisitorApp(appId: any) {
  return request.get<any>(`/internal/business/app/visitor/v1/preview/${appId}`);
}
//表单提交数据
export function submitData(data:any,appId:any) {
  return request.post<any>(`/internal/business/submit/form/v1/${appId}`,data);
}
//提交草稿数据
export function draftData(data:any,appId:any) {
  return request.post<any>(`/internal/business/submit/form/v1/draft/${appId}`,data);
}
//获取草稿数据
export function getDraftData(appId:any) {
  return request.get<any>(`/internal/business/submit/form/v1/draft/${appId}`);
}
//获取应用流程历史
export function processHistory(appId:any) {
  return request.get<any>(`/internal/business/app/v1/processHistory/${appId}`);
}
//按钮连接器执行
export function buttonConnector(data: any) {
  return request.post<any>(`/internal/business/connector/scene/v1/buttonExecute`, data);
}
