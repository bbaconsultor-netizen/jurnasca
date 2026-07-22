"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canalSchema } from "@/lib/validations/canal";
import { tomaDeAguaSchema } from "@/lib/validations/toma-de-agua";
import { mapPrismaError } from "@/lib/prisma-errors";
import { requireStaff } from "@/lib/require-staff";
import type { ActionResult } from "@/lib/action-result";
import type { Canal, TomaDeAgua } from "@prisma/client";

export async function crearCanal(formData: FormData): Promise<ActionResult<Canal>> {
  const auth = await requireStaff();
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    nombre: formData.get("nombre")?.toString() ?? "",
    subsector: formData.get("subsector")?.toString() ?? "",
  };

  const parsed = canalSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const canal = await prisma.canal.create({ data: parsed.data });
    revalidatePath("/staff/canales");
    return { success: true, data: canal };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function crearTomaDeAgua(formData: FormData): Promise<ActionResult<TomaDeAgua>> {
  const auth = await requireStaff();
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    nombre: formData.get("nombre")?.toString() ?? "",
    canalId: formData.get("canalId")?.toString() ?? "",
    caudalLps: formData.get("caudalLps")?.toString() ?? "",
    ubicacion: formData.get("ubicacion")?.toString() || undefined,
  };

  const parsed = tomaDeAguaSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const toma = await prisma.tomaDeAgua.create({ data: parsed.data });
    revalidatePath("/staff/canales");
    return { success: true, data: toma };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}
