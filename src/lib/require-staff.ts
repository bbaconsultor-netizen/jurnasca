import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireStaff(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STAFF") {
    return { ok: false, error: "No autorizado." };
  }
  return { ok: true };
}
