"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parcelaSchema } from "@/lib/validations/parcela";
import { cultivoSchema } from "@/lib/validations/cultivo";
import { mapPrismaError } from "@/lib/prisma-errors";
import { requirePerfil } from "@/lib/require-staff";
import type { ActionResult } from "@/lib/action-result";
import type { Parcela, Cultivo } from "@prisma/client";

export async function crearParcela(formData: FormData): Promise<ActionResult<Parcela>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    reganteId: formData.get("reganteId")?.toString() ?? "",
    tomaDeAguaId: formData.get("tomaDeAguaId")?.toString() ?? "",
    areaHectareas: formData.get("areaHectareas")?.toString() ?? "",
    ubicacion: formData.get("ubicacion")?.toString() || undefined,
  };

  const parsed = parcelaSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const parcela = await prisma.parcela.create({ data: parsed.data });
    revalidatePath(`/staff/regantes/${parsed.data.reganteId}`);
    return { success: true, data: parcela };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function crearCultivo(formData: FormData): Promise<ActionResult<Cultivo>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    parcelaId: formData.get("parcelaId")?.toString() ?? "",
    tipoCultivo: formData.get("tipoCultivo")?.toString() ?? "",
    campana: formData.get("campana")?.toString() ?? "",
    fechaSiembra: formData.get("fechaSiembra")?.toString() || undefined,
  };

  const parsed = cultivoSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const cultivo = await prisma.cultivo.create({
      data: {
        parcelaId: parsed.data.parcelaId,
        tipoCultivo: parsed.data.tipoCultivo,
        campana: parsed.data.campana,
        fechaSiembra: parsed.data.fechaSiembra ? new Date(parsed.data.fechaSiembra) : null,
      },
    });
    // crearCultivo only has parcelaId in scope, not the owning reganteId, so revalidate
    // every /staff/regantes/[id] page by dynamic-route pattern rather than one exact id.
    revalidatePath("/staff/regantes/[id]", "page");
    return { success: true, data: cultivo };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function actualizarParcela(
  id: string,
  formData: FormData
): Promise<ActionResult<Parcela>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    reganteId: formData.get("reganteId")?.toString() ?? "",
    tomaDeAguaId: formData.get("tomaDeAguaId")?.toString() ?? "",
    areaHectareas: formData.get("areaHectareas")?.toString() ?? "",
    ubicacion: formData.get("ubicacion")?.toString() || undefined,
  };

  const parsed = parcelaSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const parcela = await prisma.parcela.update({ where: { id }, data: parsed.data });
    revalidatePath(`/staff/regantes/${parsed.data.reganteId}`);
    return { success: true, data: parcela };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function eliminarParcela(id: string): Promise<ActionResult<null>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    await prisma.parcela.delete({ where: { id } });
    revalidatePath("/staff/regantes/[id]", "page");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function eliminarCultivo(id: string): Promise<ActionResult<null>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    await prisma.cultivo.delete({ where: { id } });
    revalidatePath("/staff/regantes/[id]", "page");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}
