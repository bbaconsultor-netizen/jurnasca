import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { PerfilStaff } from "@prisma/client";

export async function requireStaff(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STAFF") {
    return { ok: false, error: "No autorizado." };
  }
  return { ok: true };
}

export async function requirePerfil(
  ...perfiles: PerfilStaff[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STAFF") {
    return { ok: false, error: "No autorizado." };
  }
  if (!session.user.perfil || !perfiles.includes(session.user.perfil as PerfilStaff)) {
    return { ok: false, error: "No autorizado." };
  }
  return { ok: true };
}
