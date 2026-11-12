import {Request} from "@/utils/request";

const request = new Request({});

//获取输出记录分页
export function getOutputRecordPage(params: any) {
    return request.get<any>("/internal/business/taskcenter/v1", {params});
}
//删除输出记录
export function deleteOutput(id: any) {
    return request.delete<any>("/internal/business/taskcenter/v1/" + id);
}
