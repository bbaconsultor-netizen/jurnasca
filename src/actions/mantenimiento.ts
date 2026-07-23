"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { registroSchema } from "@/lib/validations/registro-mantenimiento";
import { mapPrismaError } from "@/lib/prisma-errors";
import { requirePerfil } from "@/lib/require-staff";
import type { ActionResult } from "@/lib/action-result";
import type { RegistroMantenimiento } from "@prisma/client";

export async function crearRegistro(formData: FormData): Promise<ActionResult<RegistroMantenimiento>> {
  const auth = await requirePerfil("ADMINISTRACION", "TECNICO");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    tipo: formData.get("tipo")?.toString() ?? "",
    fecha: formData.get("fecha")?.toString() ?? "",
    descripcion: formData.get("descripcion")?.toString() ?? "",
    canalId: formData.get("canalId")?.toString() || undefined,
    tomaDeAguaId: formData.get("tomaDeAguaId")?.toString() || undefined,
    compuertaId: formData.get("compuertaId")?.toString() || undefined,
  };

  const parsed = registroSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const registro = await prisma.registroMantenimiento.create({
      data: {
        tipo: parsed.data.tipo,
        fecha: new Date(parsed.data.fecha),
        descripcion: parsed.data.descripcion,
        canalId: parsed.data.canalId,
        tomaDeAguaId: parsed.data.tomaDeAguaId,
        compuertaId: parsed.data.compuertaId,
      },
    });
    revalidatePath("/staff/canales");
    return { success: true, data: registro };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function resolverRegistro(id: string): Promise<ActionResult<RegistroMantenimiento>> {
  const auth = await requirePerfil("ADMINISTRACION", "TECNICO");
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const registro = await prisma.registroMantenimiento.update({
      where: { id },
      data: { estado: "RESUELTO" },
    });
    revalidatePath("/staff/canales");
    return { success: true, data: registro };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}
