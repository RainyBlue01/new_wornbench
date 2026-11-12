import { Request } from "@/utils/request";
import type { OriginalImportPayload, OriginalImportResult } from '@/types/originalImport'
import type { LinkageComponentDataParams } from '@/types/linkageComponentData'
import type { SelectComponentDataItem, SelectComponentDataParams } from '@/types/selectComponentData'

const request = new Request({});

export function originalPageRecordApi(params: any) {
  return request.post<any>("/internal/business/original/v1/record", params);
}

/** 下拉组件（其他表单数据源）查询选项 */
export function selectComponentDataApi(params: SelectComponentDataParams) {
  return request.post<SelectComponentDataItem[]>(
    '/internal/business/original/v1/selectComponentData',
    params,
  );
}

/** 数据联动：根据条件查询联动字段值 */
export function linkageComponentDataApi(params: LinkageComponentDataParams) {
  return request.post<any>(
    '/internal/business/original/v1/componentDataLinkage',
    params,
  );
}

export function getOriginalApi(formId: string, dataId: string) {
  return request.get<any>(`/internal/business/original/v1/${formId}/${dataId}`);
}

export function updateOriginalApi(formId: string, dataId: string, params: any) {
  return request.post<any>(
    `/internal/business/original/v1/${formId}/${dataId}`,
    params,
  );
}

export function deleteOriginalApi(params: any) {
  return request.delete<any>(
    `/internal/business/original/v1/${params.formId}/${params.dataId}`,
  );
}

// 原始数据导出-按选择
export function batchExportOriginal(data: any) {
  return request.post<any>("/internal/business/original/v1/batchExport", data);
}

// 原始数据导出-按筛选结果
export function filterExportOriginal(data: any) {
  return request.post<any>("/internal/business/original/v1/filterExport", data);
}

// 原始数据导出-全部
export function allExportOriginal(data: any) {
  return request.post<any>("/internal/business/original/v1/allExport", data);
}

// 原始数据删除-按选择
export function batchDeleteOriginal(data: any) {
  return request.post<any>("/internal/business/original/v1/batchDelete", data);
}

// 原始数据删除-按筛选结果
export function filterDeleteOriginal(data: any) {
  return request.post<any>("/internal/business/original/v1/filterDelete", data);
}

// 原始数据删除-全部
export function allDeleteOriginal(data: any) {
  return request.post<any>("/internal/business/original/v1/allDelete", data);
}

//数据生命周期详情查询
export function dataLifecycleRecord(params: any) {
  return request.get<any>(
    `/internal/business/dataLifecycle/v1/record`,
    { params },
  );
}
//数据生命周期详情查询
export function dataLifecycleDes(id: any) {
  return request.get<any>(
    `/internal/business/dataLifecycle/v1/${id}`,
  );
}

// 原始数据导入模板下载
export function downloadImportTemplate(formId: string) {
  return request.get<any>(
    `/internal/business/original/v1/template/${formId}`,
    { responseType: 'blob' },
  );
}

// 原始数据导入
export function importOriginalData(payload: OriginalImportPayload) {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append(
    'importOriginal',
    new Blob([payload.importOriginal], { type: 'application/json' }),
  )

  return request.post<OriginalImportResult>(
    '/internal/business/original/v1/import',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
}