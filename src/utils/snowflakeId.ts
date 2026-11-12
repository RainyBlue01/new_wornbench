/** 将雪花 ID 等超长整型统一为字符串，避免 JS Number 精度丢失 */
export function toSnowflakeIdString(id: unknown): string {
  if (id == null || id === "") return "";
  if (typeof id === "string") return id;
  if (typeof id === "bigint") return id.toString();
  return String(id);
}

/** 在 JSON.parse 前把 16 位及以上未加引号的数字转为字符串 */
export function parseJsonWithLongIntegers(text: string): unknown {
  const normalized = text.replace(
    /([{,[\s])(-?\d{16,})(\s*[,}\]])/g,
    (_, prefix, num, suffix) => `${prefix}"${num}"${suffix}`,
  );
  return JSON.parse(normalized);
}
