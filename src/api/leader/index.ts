import { Request } from '@/utils/request';
import { toSnowflakeIdString } from '@/utils/snowflakeId';

const request = new Request({});

/** 添加/更新分管领导 */
export interface ChargeParams {
  userIds: (string | number)[];
  deptIds: (string | number)[];
}

export interface ChargePageParams {
  username?: string;
  current?: number;
  size?: number;
}

export interface ChargeLeaderRecord {
  id: string | number;
  nickname?: string;
  deptIds?: (string | number)[];
  [key: string]: unknown;
}

export interface ChargePageResult {
  records?: ChargeLeaderRecord[];
  total?: number;
}

/** 分页查询分管领导用户 */
export function pageRecord(params: ChargePageParams) {
  return request.get<ChargePageResult>(
    '/internal/business/charge/v1/pageRecord',
    { params },
  );
}

/** 添加分管领导（支持批量用户 + 分管部门） */
export function charge(params: ChargeParams) {
  return request.post<unknown>('/internal/business/charge/v1', {
    userIds: params.userIds.map((id) => toSnowflakeIdString(id)),
    deptIds: params.deptIds.map((id) => toSnowflakeIdString(id)),
  });
}

/** 移除用户分管领导 */
export function removeChargeLeader(userId: string | number) {
  const uid = toSnowflakeIdString(userId);
  return request.delete<unknown>(`/internal/business/charge/v1/${uid}`);
}

/** @deprecated 请使用 removeChargeLeader */
export const putUser = removeChargeLeader;
