import { Request } from '@/utils/request';

const request = new Request({});

/** 数据解析 / 更新条件字段 */
export interface DataWriteOutputParam {
  field?: string;
  name?: string;
  path?: string;
  classify?: string;
  children?: DataWriteOutputParam[];
}

/** 数据更新规则 */
export interface DataUpdateRule {
  /** 1: 全部 2: 任一 */
  option?: number;
  conditions?: DataWriteOutputParam[];
}

/** 数据写入配置（响应） */
export interface DataWriteConfig {
  desc?: string;
  apiUrl?: string;
  approve?: boolean;
  /** 0-json 1-xml 2-form */
  resolveType?: number;
  fieldConfig?: DataWriteOutputParam[];
  dataUpdate?: boolean;
  updateRule?: DataUpdateRule[];
  whiteList?: string;
  /** 1: 启用 0: 禁用 */
  active?: number;
}

export interface DataWriteSavePayload {
  desc?: string;
  apiUrl?: string;
  approve?: boolean;
  resolveType?: number;
  fieldConfig?: DataWriteOutputParam[];
  dataUpdate?: boolean;
  updateRule?: DataUpdateRule[];
  whiteList?: string;
}

export interface DataWriteActivePayload {
  active: number;
}

const configPath = (appId: string | number) => `/internal/business/app/dataWrite/v1/config/${appId}`;

const activePath = (appId: string | number) => `/internal/business/app/dataWrite/v1/active/${appId}`;

/** 获取数据写入配置 */
export function getDataWriteConfig(appId: string | number) {
  return request.get<DataWriteConfig>(configPath(appId));
}

/** 保存数据写入配置 */
export function saveDataWriteConfig(appId: string | number, data: DataWriteSavePayload) {
  return request.post<void>(configPath(appId), data);
}

/** 开启/关闭数据写入 */
export function setDataWriteActive(appId: string | number, data: DataWriteActivePayload) {
  return request.put<void>(activePath(appId), data);
}

/** 外部调用 URL 默认值 */
export function getDefaultDataWriteUrl(appId: string | number) {
  const dataWriteUrl = (window as any).api?.dataWriteUrl || '';
  return `${dataWriteUrl}${appId || ''}`;
}
