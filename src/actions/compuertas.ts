"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { compuertaSchema } from "@/lib/validations/compuerta";
import { mapPrismaError } from "@/lib/prisma-errors";
import { requirePerfil } from "@/lib/require-staff";
import type { ActionResult } from "@/lib/action-result";
import type { Compuerta } from "@prisma/client";

export async function crearCompuerta(formData: FormData): Promise<ActionResult<Compuerta>> {
  const auth = await requirePerfil("ADMINISTRACION", "TECNICO");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    canalId: formData.get("canalId")?.toString() ?? "",
    nombre: formData.get("nombre")?.toString() ?? "",
    ubicacion: formData.get("ubicacion")?.toString() || undefined,
    caracteristicas: formData.get("caracteristicas")?.toString() || undefined,
    estadoConservacion: formData.get("estadoConservacion")?.toString() || undefined,
  };

  const parsed = compuertaSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const compuerta = await prisma.compuerta.create({ data: parsed.data });
    revalidatePath("/staff/canales");
    return { success: true, data: compuerta };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function actualizarCompuerta(
  id: string,
  formData: FormData
): Promise<ActionResult<Compuerta>> {
  const auth = await requirePerfil("ADMINISTRACION", "TECNICO");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    canalId: formData.get("canalId")?.toString() ?? "",
    nombre: formData.get("nombre")?.toString() ?? "",
    ubicacion: formData.get("ubicacion")?.toString() || undefined,
    caracteristicas: formData.get("caracteristicas")?.toString() || undefined,
    estadoConservacion: formData.get("estadoConservacion")?.toString() || undefined,
  };

  const parsed = compuertaSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const compuerta = await prisma.compuerta.update({ where: { id }, data: parsed.data });
    revalidatePath("/staff/canales");
    return { success: true, data: compuerta };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function eliminarCompuerta(id: string): Promise<ActionResult<null>> {
  const auth = await requirePerfil("ADMINISTRACION", "TECNICO");
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    await prisma.compuerta.delete({ where: { id } });
    revalidatePath("/staff/canales");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}
