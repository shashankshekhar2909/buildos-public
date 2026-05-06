export function getAuthMode(): "local" | "auth0" {
  const mode = (process.env.NEXT_PUBLIC_AUTH_MODE || "local").toLowerCase();
  return mode === "auth0" ? "auth0" : "local";
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const parts = document.cookie.split(";").map((v) => v.trim());
  const found = parts.find((part) => part.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}
