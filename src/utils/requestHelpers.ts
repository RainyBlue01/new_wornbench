const publicRequestPrefixes: string[] = [];

export const isPublicRequest = (url = "") =>
  publicRequestPrefixes.some((prefix) => url.startsWith(prefix));

export const stripAppBasePath = (path: string, basePath: string) =>
  path === basePath
    ? "/"
    : path.startsWith(`${basePath}/`)
      ? path.slice(basePath.length)
      : path;

export const getHttpErrorMessage = (status?: number, code?: string) => {
  if (code === "ECONNABORTED" || code === "ETIMEDOUT") return "请求超时";

  const messages: Record<number, string> = {
    400: "请求错误(400)",
    401: "未授权，请重新登录(401)",
    403: "拒绝访问(403)",
    404: "请求出错(404)",
    408: "请求超时(408)",
    500: "服务器错误(500)",
    501: "服务未实现(501)",
    502: "网络错误(502)",
    503: "服务不可用(503)",
    504: "网络超时(504)",
    505: "HTTP版本不受支持(505)",
  };

  return status
    ? messages[status] || `连接出错(${status})!`
    : "网络连接失败，请检查网络";
};
