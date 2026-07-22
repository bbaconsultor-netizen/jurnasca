// Plain server-only reads (no "use server" — must not be public action endpoints).
import { prisma } from "@/lib/prisma";

export async function listarComisiones() {
  return prisma.comision.findMany({
    include: { comites: { orderBy: { nombre: "asc" } }, canales: { orderBy: { nombre: "asc" } } },
    orderBy: { nombre: "asc" },
  });
}
