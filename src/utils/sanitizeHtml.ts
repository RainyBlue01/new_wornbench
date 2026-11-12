import DOMPurify from "dompurify";

export const sanitizeHtml = (value: unknown) => {
  if (typeof value !== "string" || !value) return "";
  return DOMPurify.sanitize(value, { USE_PROFILES: { html: true } });
};
