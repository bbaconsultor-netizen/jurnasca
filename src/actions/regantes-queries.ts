// Plain (non-"use server") read functions — intentionally NOT exported as Server Actions.
// Adding "use server" here would make these directly, publicly invocable endpoints that
// return codigoPadronHash and full PII (bypassing any UI), so they are consumed only from
// Server Components.
import { prisma } from "@/lib/prisma";
import { construirFiltroRegantes, type FiltrosRegante } from "@/lib/validations/regante-filtros";
import type { Regante } from "@prisma/client";

export async function listarRegantes(filtros: FiltrosRegante = {}): Promise<Regante[]> {
  return prisma.regante.findMany({
    where: construirFiltroRegantes(filtros),
    orderBy: { apellidos: "asc" },
  });
}

export async function obtenerRegante(id: string) {
  return prisma.regante.findUnique({
    where: { id },
    include: {
      parcelas: {
        include: { cultivos: true, tomaDeAgua: { include: { canal: { include: { comision: true } } } } },
      },
    },
  });
}

/** Nombres únicos de las comisiones a las que pertenece el regante (derivadas de sus parcelas). */
export function comisionesDeRegante(
  regante: NonNullable<Awaited<ReturnType<typeof obtenerRegante>>>
): string[] {
  const nombres = regante.parcelas
    .map((p) => p.tomaDeAgua.canal.comision?.nombre)
    .filter((n): n is string => Boolean(n));
  return [...new Set(nombres)];
}
