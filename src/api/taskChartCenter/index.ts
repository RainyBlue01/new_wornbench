import {Request} from "@/utils/request";

const request = new Request({});

//填报任务统计
export function statisticTaskInfo() {
    return request.get<any>(`/internal/business/fill/report/v1/taskInfo`)
}

//填报批次统计
export function statisticTaskBatch() {
    return request.get<any>(`/internal/business/fill/report/v1/taskBatch`)
}

//近七日填报任务人次
export function statisticAotuFill(params: any) {
    return request.get<any>(`/internal/business/fill/report/v1/aotuFill`, {params})
}

//当天填报统计
export function statisticAutoFrequencyFill(params: any) {
    return request.get<any>(`/internal/business/fill/report/v1/autoFrequencyFill`, {params})
}
