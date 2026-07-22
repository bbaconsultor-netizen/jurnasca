"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { periodoDirectivoSchema } from "@/lib/validations/periodo-directivo";
import { autoridadSchema } from "@/lib/validations/autoridad";
import { mapPrismaError } from "@/lib/prisma-errors";
import { requireStaff } from "@/lib/require-staff";
import type { ActionResult } from "@/lib/action-result";
import type { PeriodoDirectivo, Autoridad } from "@prisma/client";

export async function abrirPeriodoDirectivo(
  formData: FormData
): Promise<ActionResult<PeriodoDirectivo>> {
  const auth = await requireStaff();
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = { fechaInicio: formData.get("fechaInicio")?.toString() ?? "" };
  const parsed = periodoDirectivoSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const periodo = await prisma.periodoDirectivo.create({
      data: { fechaInicio: new Date(parsed.data.fechaInicio) },
    });
    revalidatePath("/staff/junta");
    return { success: true, data: periodo };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function agregarAutoridad(formData: FormData): Promise<ActionResult<Autoridad>> {
  const auth = await requireStaff();
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    periodoId: formData.get("periodoId")?.toString() ?? "",
    cargo: formData.get("cargo")?.toString() ?? "",
    nombre: formData.get("nombre")?.toString() ?? "",
    dni: formData.get("dni")?.toString() ?? "",
    telefono: formData.get("telefono")?.toString() || undefined,
  };

  const parsed = autoridadSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const autoridad = await prisma.autoridad.create({ data: parsed.data });
    revalidatePath("/staff/junta");
    return { success: true, data: autoridad };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function cerrarPeriodoDirectivo(
  periodoId: string
): Promise<ActionResult<PeriodoDirectivo>> {
  const auth = await requireStaff();
  if (!auth.ok) return { success: false, error: auth.error };

  const periodo = await prisma.periodoDirectivo.findUnique({ where: { id: periodoId } });
  if (!periodo) {
    return { success: false, error: "El período no existe." };
  }
  if (periodo.estado === "CONCLUIDO") {
    return { success: false, error: "Este período ya está concluido." };
  }

  try {
    const actualizado = await prisma.periodoDirectivo.update({
      where: { id: periodoId },
      data: { estado: "CONCLUIDO", fechaFin: new Date() },
    });
    revalidatePath("/staff/junta");
    return { success: true, data: actualizado };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}
