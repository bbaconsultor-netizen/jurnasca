import type { Prisma } from "@prisma/client";

export type FiltrosRegante = {
  q?: string;
  estado?: "HABIL" | "NO_HABIL" | "TODOS";
  comisionId?: string;
};

export function construirFiltroRegantes(filtros: FiltrosRegante): Prisma.ReganteWhereInput {
  const condiciones: Prisma.ReganteWhereInput[] = [];

  const q = filtros.q?.trim();
  if (q) {
    condiciones.push({
      OR: [
        { nombres: { contains: q, mode: "insensitive" } },
        { apellidos: { contains: q, mode: "insensitive" } },
        { numeroDocumento: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (filtros.estado === "HABIL") {
    condiciones.push({ estadoHabil: true });
  } else if (filtros.estado === "NO_HABIL") {
    condiciones.push({ estadoHabil: false });
  }

  if (filtros.comisionId) {
    condiciones.push({
      parcelas: { some: { tomaDeAgua: { canal: { comisionId: filtros.comisionId } } } },
    });
  }

  if (condiciones.length === 0) return {};
  if (condiciones.length === 1) return condiciones[0];
  return { AND: condiciones };
}
