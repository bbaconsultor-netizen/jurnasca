// Plain server-only reads (NOT server actions — no "use server" directive on purpose;
// exposing these as public action endpoints would leak staff account data).
import { prisma } from "@/lib/prisma";

export async function listarStaffUsers() {
  return prisma.staffUser.findMany({
    select: { id: true, nombre: true, username: true, perfil: true, activo: true, createdAt: true },
    orderBy: { nombre: "asc" },
  });
}
