// Plain (non-"use server") read functions — intentionally NOT exported as Server Actions,
// so they are consumed only from Server Components rather than being directly invocable.
import { prisma } from "@/lib/prisma";

export async function obtenerJunta() {
  return prisma.junta.findFirst();
}

export async function listarPeriodos() {
  return prisma.periodoDirectivo.findMany({
    include: { autoridades: true },
    orderBy: { fechaInicio: "desc" },
  });
}
