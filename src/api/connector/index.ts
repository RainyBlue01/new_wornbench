import {Request} from "@/utils/request";

const request = new Request({});

export interface ConnectorProcessPayload {
    nodeId: string | number
    sceneId: string | number
    processId: string | number
    oldProcessId: string | number
}

//获取连接器列表
export function getConnectorList(params: any) {
    return request.get<any>(`/internal/business/connector/v1`, {params})
}

//创建连接器
export function createConnector(data: any) {
    return request.post<any>(`/internal/business/connector/v1`, data)
}

//修改连接器
export function modifyConnector(connectorId: number, data: any) {
    return request.put<any>(`/internal/business/connector/v1/${connectorId}`, data)
}

//删除连接器
export function deleteConnector(connectorId: number) {
    return request.delete<any>(`/internal/business/connector/v1/${connectorId}`)
}

//获取连接器详情
export function getConnectorDes(connectorId: number) {
    return request.get<any>(`/internal/business/connector/v1/${connectorId}`)
}

//获取连接器详情场景分页
export function getConnectorScenePage(connectorId: number, params: any) {
    return request.get<any>(`/internal/business/connector/scene/v1/${connectorId}/page`, {params})
}

//连接器通信配置
export function setConnectorConfig(connectorId: number, data: any) {
    return request.put<any>(`/internal/business/connector/v1/${connectorId}/connect`, data)
}

//连接器通信鉴权配置
export function setConnectorAuthConfig(connectorId: number, data: any) {
    return request.put<any>(`/internal/business/connector/v1/${connectorId}/auth`, data)
}

//开启/关闭鉴权
export function setSceneEnableAuth(sceneId: number, data: any) {
    return request.put<any>(`/internal/business/connector/scene/v1/enableAuth/${sceneId}`, null, {params: data})
}

//开启/关闭回调
export function setSceneCallback(sceneId: number, data: any) {
    return request.put<any>(`/internal/business/connector/scene/v1/callback/${sceneId}`, null, {params: data})
}

//开启/关闭上架
export function setSceneState(sceneId: number, data: any) {
    return request.put<any>(`/internal/business/connector/scene/v1/release/${sceneId}`, null, {params: data})
}

//设置同步/异步
export function setSceneSyncType(sceneId: number, data: any) {
    return request.put<any>(`/internal/business/connector/scene/v1/sync/${sceneId}`, null, {params: data})
}

//获取场景详情
export function getSceneConfig(sceneId: number) {
    return request.get<any>(`/internal/business/connector/scene/v1/${sceneId}`)
}

//修改场景配置
export function modifySceneConfig(sceneId: number, data: any) {
    return request.put<any>(`/internal/business/connector/scene/v1/${sceneId}`, data)
}

//删除场景配置
export function deleteSceneConfig(sceneId: number) {
    return request.delete<any>(`/internal/business/connector/scene/v1/${sceneId}`)
}

//新增场景配置
export function addSceneConfig(data: any) {
    return request.post<any>(`/internal/business/connector/scene/v1`, data)
}

//获取场景日志分页
export function getLogRecordPage(sceneId: number, params: any) {
    return request.get<any>(`/internal/business/connector/record/v1/recordPage/${sceneId}`, {params})
}

//获取场景日志流程下拉
export function getLogProcessSelect(sceneId: number, params: any) {
    return request.get<any>(`/internal/business/connector/record/v1/select/${sceneId}`, {params})
}

//调试
export function sceneDebug(sceneId: number, data: any) {
    return request.post<any>(`/internal/business/connector/scene/v1/debug/${sceneId}`, data)
}
//调试
export function getScene(id: number) {
    return request.get<any>(`/internal/business/connector/scene/v1/list/${id}`)
}

//关联连接器场景与流程
export function connectProcess(data: ConnectorProcessPayload) {
    return request.post<any>(`/internal/business/connector/process/v1/connect`, data)
}

