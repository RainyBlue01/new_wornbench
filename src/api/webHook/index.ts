import { Request } from '@/utils/request';

const request = new Request({});
//获取应用webhook列表
export function webhooklogApplist(params: any) {
  return request.get<any>('/internal/business/app/webhooklog/v1/applist', params);
}
//获取webhook日志
export function webhooklogPageRecord(params: any) {
  return request.get<any>('/internal/business/app/webhooklog/v1/pageRecord', { params: params });
}

/** webhook 日志统计 */
export interface WebhookLogStatistics {
  todayPushTotal?: number;
  successRate?: number;
  waitRetryCount?: number;
  avgResponseTime?: number;
}

export function webhooklogStatistics(params?: Record<string, any>) {
  return request.get<WebhookLogStatistics>(
    '/internal/business/app/webhooklog/v1/statistics',
    { params },
  );
}
//获取日志详情
export function webhooklogDes(id: any) {
  return request.get<any>(`/internal/business/app/webhooklog/v1/${id}`);
}
//修改开发者配置
export function developerConfig(data:any, id: any) {
  return request.put<any>(`/internal/business/developer/v1/config/${id}`, data);
}
//获取密钥
export function secret() {
  return request.put<any>(`/internal/business/developer/v1/secret`);
}
//重新推送 webhooks 日志
export function rePushWebhook(data: any) {
  return request.post<any>(`/internal/business/app/webhooklog/v1/${data}`)
}
//开发者下拉框
export function developerSelect() {
  return request.get<any>('/internal/business/developer/v1/select');
}

/** Webhook 配置 */
export interface WebhookConfig {
  id?: number;
  subscribeId?: number;
  developerId?: number;
  appId?: number;
  serverAddress?: string;
  secret?: string;
  events?: string;
  mapping?: string;
}

/** 获取 Webhook 配置 */
export function getWebhookConfig(id: string | number) {
  return request.get<WebhookConfig>(`/internal/business/subscribe/v1/webhook/${id}`);
}

/** 设置 Webhook 配置 */
export function setWebhookConfig(id: string | number, data: WebhookConfig) {
  return request.post<void>(`/internal/business/subscribe/v1/webhook/${id}`, data);
}

/** 生成密钥 */
export function generateSecret() {
  return request.get<string>(`/internal/business/subscribe/v1/webhook/secret`);
}