// index.ts
import axios from "axios";
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { Message } from "@arco-design/web-vue";
import { parseJsonWithLongIntegers } from "@/utils/snowflakeId";
import {
  getHttpErrorMessage,
  isPublicRequest,
  stripAppBasePath,
} from "@/utils/requestHelpers";

export type Result<T = unknown> = {
  code: number;
  message: string;
  data: T;
  success: boolean;
};
const win = window as any;
const APP_BASE_PATH = "/wornbench";
const preservePaths = ["/form", "/flowPath", "/report", "/targets"];
const authStorageKeys = [
  "isAdmin",
  "wornbench_userId",
  "wornbench_token",
  "wornbench_info",
  "activeName",
  "activeTab",
  "homePageMineTab",
  "homePagePlazaCategory",
  "homePagePlazaSearch",
  "taskFillCenterAppId",
];
let isRedirectingToLogin = false;

const handleUnauthorized = () => {
  if (isRedirectingToLogin) return;
  isRedirectingToLogin = true;

  const currentPath = stripAppBasePath(
    window.location.pathname + window.location.search,
    APP_BASE_PATH,
  );
  if (currentPath && !currentPath.includes("/login")) {
    localStorage.setItem("redirect_url", currentPath);
  }

  authStorageKeys.forEach((key) => localStorage.removeItem(key));
  if (!preservePaths.some((path) => currentPath.startsWith(path))) {
    localStorage.removeItem("flowList");
    localStorage.removeItem("formList");
  }

  window.location.href = win.api.apiURL;
};

// 导出Request类，可以用来自定义传递配置来创建实例
export class Request {
  // axios 实例

  instance: AxiosInstance;

  // 基础配置，url和超时时间
  baseConfig: AxiosRequestConfig = { baseURL: "/api", timeout: 60000 };

  constructor(config: AxiosRequestConfig) {
    // 使用axios.create创建axios实例
    this.instance = axios.create(
      Object.assign(
        {
          transformResponse: [
            (data: unknown) => {
              if (typeof data !== "string" || !data) return data;
              try {
                return parseJsonWithLongIntegers(data);
              } catch {
                try {
                  return JSON.parse(data);
                } catch {
                  return data;
                }
              }
            },
          ],
        },
        this.baseConfig,
        config,
      ),
    );

    this.instance.interceptors.request.use(
      (config) => {
        // 一般会请求拦截里面加token，用于后端的验证
        config.headers.client_id = "339d13a0034b4398939fe8fe89b0af0a";
        const token = localStorage.getItem("wornbench_token") as string;
        if (!isPublicRequest(config.url) && token) {
          config.headers.token = token;
        }

        return config;
      },
      (err: any) => {
        // 请求错误，这里可以用全局提示框进行提示
        return Promise.reject(err);
      },
    );

    this.instance.interceptors.response.use(
      async (res: AxiosResponse<Result>) => {
        if (
          res.config.responseType === "arraybuffer" ||
          res.config.responseType === "blob"
        ) {
          return res.data;
        }

        if (res.data.code === 401) handleUnauthorized();

        if (!res.data.success) {
          if (res.data.code !== 401) {
            Message.error(res.data.message);
          }
          return Promise.reject(res.data.message || "网络错误！");
        }

        return res.data.data;
      },
      async (err: AxiosError) => {
        if (axios.isCancel(err) || err.code === "ERR_CANCELED") {
          return Promise.reject(err);
        }

        const status = err.response?.status;
        if (status === 401) {
          handleUnauthorized();
        } else {
          Message.error(getHttpErrorMessage(status, err.code));
        }
        return Promise.reject(err.response ?? err);
      },
    );
  }

  // 定义请求方法
  public request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request<unknown, T>(config);
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.post<unknown, T>(url, data, config);
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.put<unknown, T>(url, data, config);
  }

  public patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.patch<unknown, T>(url, data, config);
  }

  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.delete<unknown, T>(url, config);
  }
}

// 默认导出Request实例
export default new Request({});
