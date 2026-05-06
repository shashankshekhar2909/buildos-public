export function shouldUseSecureCookie(): boolean {
  const baseUrl = process.env.APP_BASE_URL || "";
  if (baseUrl.startsWith("https://")) return true;
  if (baseUrl.startsWith("http://")) return false;
  return process.env.NODE_ENV === "production";
}
