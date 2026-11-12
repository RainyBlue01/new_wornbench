import { Request } from "@/utils/request";

const request = new Request({});

export function checkUser(params: any) {
  return request.get<any>("/business/v1/system/checkUser", { params });
}
export function get_user_info(params: any) {
  return request.get<any>("/authentication/oauth2/userinfo", { params });
}
export function isAdmin() {
  return request.get<any>("/business/v1/admin");
}
//表单登录
export function login(data: any) {
  return request.post<any>("/internal/business/form/login", data);
}
//服务中台登录
export function servicePlatformLogin(data: any) {
  return request.post<any>("/internal/business/servicePlatform/login?openId=" + data.open_id + '&accessToken=' + data.accessToken);
}
//社交账号生成状态码
export function socialState(socialType: any, data: any) {
  return request.post<any>(
    `/internal/business/socialState/${socialType}`,
    data,
  );
}
//微信公众号登录
export function wechatOfficialLogin(data: any) {
  return request.post<any>(`/internal/business/wechatOfficial/login`, data);
}
//微信开放平台登录
export function wechatOpenPlatformLogin(data: any) {
  return request.post<any>(`/internal/business/wechatOpenPlatform/login`, data);
}
//获取登录用户信息
export function getUserinfo() {
  return request.get<any>(`/internal/business/userinfo`);
}

//获取当前用户角色
export function getUserRole() {
  return request.get<any>(`/internal/business/func/v1/getUserRole`);
}

//获取当前用户部门
export function getUserDept(params: any) {
  return request.get<any>(`/internal/business/func/v1/getUserDept`, { params });
}

//获取当前用户职位
export function getUserPost(params: any) {
  return request.get<any>(`/internal/business/func/v1/getUserPost`, { params });
}

//获取当用户部门负责人
export function getUserDeptLeader() {
  return request.get<any>(`/internal/business/func/v1/getUserDeptLeader`);
}

//获取当前用户部门层级
export function getUserDeptLevel() {
  return request.get<any>(`/internal/business/func/v1/getUserDeptLevel`);
}

//获取当前用户部门路径
export function getUserDeptPath() {
  return request.get<any>(`/internal/business/func/v1/getUserDeptPath`);
}
