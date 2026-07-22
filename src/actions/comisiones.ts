"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { comisionSchema } from "@/lib/validations/comision";
import { comiteSchema } from "@/lib/validations/comite";
import { mapPrismaError } from "@/lib/prisma-errors";
import { requirePerfil } from "@/lib/require-staff";
import type { ActionResult } from "@/lib/action-result";
import type { Comision, Comite } from "@prisma/client";

export async function crearComision(formData: FormData): Promise<ActionResult<Comision>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    nombre: formData.get("nombre")?.toString() ?? "",
    subsector: formData.get("subsector")?.toString() ?? "",
  };

  const parsed = comisionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const comision = await prisma.comision.create({ data: parsed.data });
    revalidatePath("/staff/junta");
    revalidatePath("/staff/canales");
    return { success: true, data: comision };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function actualizarComision(
  id: string,
  formData: FormData
): Promise<ActionResult<Comision>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    nombre: formData.get("nombre")?.toString() ?? "",
    subsector: formData.get("subsector")?.toString() ?? "",
  };

  const parsed = comisionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const comision = await prisma.comision.update({ where: { id }, data: parsed.data });
    revalidatePath("/staff/junta");
    revalidatePath("/staff/canales");
    return { success: true, data: comision };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function eliminarComision(id: string): Promise<ActionResult<null>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    await prisma.comision.delete({ where: { id } });
    revalidatePath("/staff/junta");
    revalidatePath("/staff/canales");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function crearComite(formData: FormData): Promise<ActionResult<Comite>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    comisionId: formData.get("comisionId")?.toString() ?? "",
    nombre: formData.get("nombre")?.toString() ?? "",
    tipo: formData.get("tipo")?.toString() ?? "",
  };

  const parsed = comiteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const comite = await prisma.comite.create({ data: parsed.data });
    revalidatePath("/staff/junta");
    return { success: true, data: comite };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function eliminarComite(id: string): Promise<ActionResult<null>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    await prisma.comite.delete({ where: { id } });
    revalidatePath("/staff/junta");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}
