export type SessionRole = "STAFF" | "REGANTE" | null;

export function rutaPermitida(pathname: string, role: SessionRole): boolean {
  if (pathname.startsWith("/staff")) return role === "STAFF";
  if (pathname.startsWith("/regante")) return role === "REGANTE";
  return true;
}
