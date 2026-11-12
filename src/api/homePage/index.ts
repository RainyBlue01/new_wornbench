import { Request } from '@/utils/request';

const request = new Request({});

export function home_count() {
  return request.get<any>('/business/v1/workbench/home_count');
}
export function getDictItem() {
  return request.get<any>('/system/v1/dict/getDictItem/FOOTER_PLATFORM');
}
export function myApp() {
  return request.get<any>('/business/v1/app/myApp');
}
export function application_square() {
  return request.get<any>('/business/v1/app/application_square');
}
export function myManageApp() {
  return request.get<any>('/business/v1/group/manage/app');
}
export function reqIsAdmin(params: any) {
  return request.get<any>('/business/v1/admin', { params });
}
//新增应用
export function addApp(data: any) {
  return request.post<any>('/internal/business/app/v1', data);
}
//修改应用 
export function putApp(data: any, id: any) {
  return request.put<any>(`/internal/business/app/v1/${id}`, data);
}
//销毁应用 
export function deleteApp(id: any) {
  return request.delete<any>(`/internal/business/app/v1/${id}`);
}
//数据清理 
export function dataClear(id: any) {
  return request.post<any>(`/internal/business/app/v1/dataClear/${id}`);
}
//应用转让 
export function transferApp(data: any, id: any) {
  return request.post<any>(`/internal/business/app/v1/transfer/${id}`, data);
}
//获取应用列表（关联数据组件） 
export function listByRelation() {
  return request.get<any>(`/internal/business/app/v1/listByRelation`);
}
//创建者应用-指定用户
export function getAppByUserId(userId: string | number) {
  return request.get<any>(`/internal/business/app/creator/v1/user/${userId}`);
}
// 创建者应用列表（离职转交等场景可传 userId 查询指定成员的应用）
export function getCreatorApp(userId?: string | number) {
  return request.get<any>(`/internal/business/app/creator/v1`, {
    params: userId != null && userId !== '' ? { userId } : undefined,
  });
}

/** 批量应用转让 */
export function batchAppTransfer(data: {
  transferApps: { appId: string | number; userId: string | number }[];
  creatorId?: string | number;
}) {
  return request.post<any>('/internal/business/app/v1/batchTransfer', data);
}
//访问对象配置 
export function setAccess(data: any, appId: any) {
  return request.post<any>(`/internal/business/app/v1/access/${appId}`, data);
}
//获取访问对象 
export function getAccess(appId: any) {
  return request.get<any>(`/internal/business/app/v1/access/${appId}`);
}
//webhook配置 
export function setWebhookConfig(data: any, appId: any) {
  return request.post<any>(`/internal/business/app/v1/webhook/${appId}`, data);
}
//获取webhook配置 
export function getWebhookConfig(appId: any) {
  return request.get<any>(`/internal/business/app/v1/webhook/${appId}`);
}
//获取应用详情
export function getCreatorDes(appId: any) {
  return request.get<any>(`/internal/business/app/creator/v1/${appId}`);
}

/** 发布应用请求体 */
export interface PublishAppPayload {
  appId?: number | string;
  deptIds: Array<number | string>;
  postIds: Array<number | string>;
  roleIds: Array<number | string>;
  userIds: Array<number | string>;
  categoryIds: Array<number | string>;
  appName: string;
  intro: string;
  icon: string;
}

/** 正式发布应用 */
export function publishApp(appId: string | number, data: PublishAppPayload) {
  return request.post<any>(`/internal/business/app/v1/publish/${appId}`, data);
}
//访问者分类应用列表
export function getVisitorApp() {
  return request.get<any>(`/internal/business/app/visitor/v1`);
}
//获取应用详情
export function getVisitorDes(appId: any) {
  return request.get<any>(`/internal/business/app/visitor/v1/${appId}`);
}
//应用分享配置
export function setShare(data: any, appId: any) {
  return request.post<any>(`/internal/business/app/v1/openNetwork/${appId}`, data);
}
//获取应用分享
export function getShare(appId: any) {
  return request.get<any>(`/internal/business/app/v1/openNetwork/${appId}`);
}
//是否为默认组用户
export function appTabPermission() {
  return request.get<any>(`/internal/business/security/group/v1/user/appTabPermission`);
}
//应用列表
export function getManagerApp() {
  return request.get<any>(`/internal/business/app/manager/v1`);
}
//获取应用详情
export function getManagerAppDes(appId: any) {
  return request.get<any>(`/internal/business/app/manager/v1/${appId}`);
}
//设置应用密钥
export function setClientSecret(data: any, appId: any) {
  return request.post<any>(`/internal/business/app/v1/setSmpAppConfig/${appId}`, data);
}
//获取应用密钥
export function getSmpAppConfig(appId: any) {
  return request.get<any>(`/internal/business/app/v1/getSmpAppConfig/${appId}`);
}

/**
 * 跨应用共享数据接口
 */

//设置跨应用共享配置
export function setCrossAppShare(data: { shareAppIds: (string | number)[] }, appId: any) {
  return request.post<any>(`/internal/business/app/dataShare/v1/${appId}`, data);
}

//获取跨应用共享配置
export function getCrossAppShare(appId: any) {
  return request.get<any>(`/internal/business/app/dataShare/v1/${appId}`);
}

//获取共享给我的应用列表（来源应用列表）
export function getSourceShareApps(shareAppId: any) {
  return request.get<any>(`/internal/business/app/dataShare/v1/source/${shareAppId}`);
}
//获取目标应用列表
export function getTargetAppList() {
  return request.get<any>(`/internal/business/app/v1/targetList`);
}