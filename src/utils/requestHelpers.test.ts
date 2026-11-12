import { describe, expect, it } from "vitest";

import {
  getHttpErrorMessage,
  isPublicRequest,
  stripAppBasePath,
} from "./requestHelpers";

describe("request helpers", () => {
  it("does not bypass authentication by URL prefix", () => {
    expect(isPublicRequest("/internal/business/config/v1/theme")).toBe(false);
    expect(isPublicRequest("/eap/captcha?id=1")).toBe(false);
    expect(isPublicRequest("/internal/business/user/v1")).toBe(false);
  });

  it("only removes an actual application base path", () => {
    expect(stripAppBasePath("/wornbench/form?id=1", "/wornbench")).toBe(
      "/form?id=1",
    );
    expect(stripAppBasePath("/workflow/form", "/workflow")).toBe("/form");
    expect(stripAppBasePath("/wornbench-other/form", "/wornbench")).toBe(
      "/wornbench-other/form",
    );
  });

  it("normalizes HTTP and network error messages", () => {
    expect(getHttpErrorMessage(500)).toBe("服务器错误(500)");
    expect(getHttpErrorMessage(429)).toBe("连接出错(429)!");
    expect(getHttpErrorMessage(undefined, "ECONNABORTED")).toBe("请求超时");
    expect(getHttpErrorMessage()).toBe("网络连接失败，请检查网络");
  });
});
