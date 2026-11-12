import { Request } from '@/utils/request';

const request = new Request({});

export function dowload(params: any) {
  return request.get<any>('/internal/business/file/v1/download', {params,
    responseType: 'blob',});
}

export function upload(data: any) {
  return request.post<any>('/internal/business/file/v1/upload', data);
}

export function batchUpload(data: any) {
  return request.post<any>('/internal/business/file/v1/batchUpload', data);
}