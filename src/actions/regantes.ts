"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { reganteSchema } from "@/lib/validations/regante";
import { generarCodigoPadron } from "@/lib/codigo-padron";
import { hash } from "@/lib/crypto";
import { mapPrismaError } from "@/lib/prisma-errors";
import type { ActionResult } from "@/lib/action-result";
import type { Regante } from "@prisma/client";

export async function crearRegante(
  formData: FormData
): Promise<ActionResult<{ regante: Regante; codigoPadronPlano: string }>> {
  const raw = {
    dni: formData.get("dni")?.toString() ?? "",
    nombres: formData.get("nombres")?.toString() ?? "",
    apellidos: formData.get("apellidos")?.toString() ?? "",
    telefono: formData.get("telefono")?.toString() || undefined,
    direccion: formData.get("direccion")?.toString() || undefined,
  };

  const parsed = reganteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const codigoPadronPlano = generarCodigoPadron();
  const codigoPadronHash = await hash(codigoPadronPlano);

  try {
    const regante = await prisma.regante.create({
      data: { ...parsed.data, codigoPadronHash },
    });
    revalidatePath("/staff/regantes");
    return { success: true, data: { regante, codigoPadronPlano } };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function listarRegantes(): Promise<Regante[]> {
  return prisma.regante.findMany({ orderBy: { apellidos: "asc" } });
}

export async function obtenerRegante(id: string) {
  return prisma.regante.findUnique({
    where: { id },
    include: { parcelas: { include: { cultivos: true, tomaDeAgua: true } } },
  });
}

export async function actualizarEstadoHabil(
  id: string,
  estadoHabil: boolean
): Promise<ActionResult<Regante>> {
  try {
    const regante = await prisma.regante.update({ where: { id }, data: { estadoHabil } });
    revalidatePath("/staff/regantes");
    revalidatePath(`/staff/regantes/${id}`);
    return { success: true, data: regante };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}
