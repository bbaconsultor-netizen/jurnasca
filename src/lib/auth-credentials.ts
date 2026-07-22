import { prisma } from "./prisma";
import { verificar } from "./crypto";

export type AuthUser = {
  id: string;
  name: string;
  role: "STAFF" | "REGANTE";
  perfil?: "ADMINISTRACION" | "TESORERIA" | "TECNICO";
};

export async function autenticarStaff(username: string, clave: string): Promise<AuthUser | null> {
  const staffUser = await prisma.staffUser.findUnique({ where: { username } });
  if (!staffUser || !staffUser.activo) return null;
  const valido = await verificar(clave, staffUser.passwordHash);
  if (!valido) return null;
  return { id: staffUser.id, name: staffUser.nombre, role: "STAFF", perfil: staffUser.perfil };
}

export async function autenticarRegante(dni: string, clave: string): Promise<AuthUser | null> {
  const regante = await prisma.regante.findUnique({ where: { dni } });
  if (!regante) return null;
  const valido = await verificar(clave, regante.codigoPadronHash);
  if (!valido) return null;
  return { id: regante.id, name: `${regante.nombres} ${regante.apellidos}`, role: "REGANTE" };
}
