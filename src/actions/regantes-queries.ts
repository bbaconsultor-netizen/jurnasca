// Plain (non-"use server") read functions — intentionally NOT exported as Server Actions.
// Adding "use server" here would make these directly, publicly invocable endpoints that
// return codigoPadronHash and full PII (bypassing any UI), so they are consumed only from
// Server Components.
import { prisma } from "@/lib/prisma";
import type { Regante } from "@prisma/client";

export async function listarRegantes(): Promise<Regante[]> {
  return prisma.regante.findMany({ orderBy: { apellidos: "asc" } });
}

export async function obtenerRegante(id: string) {
  return prisma.regante.findUnique({
    where: { id },
    include: { parcelas: { include: { cultivos: true, tomaDeAgua: true } } },
  });
}
