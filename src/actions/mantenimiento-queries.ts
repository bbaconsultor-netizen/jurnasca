// Plain server-only reads (no "use server" — must not be public action endpoints).
import { prisma } from "@/lib/prisma";

/** Registros de un canal + los de sus tomas y compuertas, más recientes primero. */
export async function listarRegistrosPorCanal(canalId: string) {
  return prisma.registroMantenimiento.findMany({
    where: {
      OR: [
        { canalId },
        { tomaDeAgua: { canalId } },
        { compuerta: { canalId } },
      ],
    },
    include: { tomaDeAgua: true, compuerta: true },
    orderBy: { fecha: "desc" },
  });
}
