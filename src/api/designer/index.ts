import { Request } from "@/utils/request";

const request = new Request({});

// 保存报表设计
export function saveReportDesign(data: any, appId: any) {
  return request.put<any>(`/internal/business/app/v1/reportDesign/${appId}`, data);
}

// 报表查询关联表单数据
export function queryReportData(data: any) {
  return request.post<any>(`/internal/business/report/v1/queryReportData`, data);
}

// 报表数据导出
export function exportReportData(data: any) {
  return request.post<any>(`/internal/business/report/v1/exportReportData`, data);
}


