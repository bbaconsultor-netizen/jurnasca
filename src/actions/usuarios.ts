"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { staffUserSchema } from "@/lib/validations/staff-user";
import { hash } from "@/lib/crypto";
import { mapPrismaError } from "@/lib/prisma-errors";
import { requirePerfil } from "@/lib/require-staff";
import type { ActionResult } from "@/lib/action-result";
import type { PerfilStaff, StaffUser } from "@prisma/client";

export async function crearStaffUser(formData: FormData): Promise<ActionResult<StaffUser>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = {
    nombre: formData.get("nombre")?.toString() ?? "",
    username: formData.get("username")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    perfil: formData.get("perfil")?.toString() ?? "",
  };

  const parsed = staffUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const passwordHash = await hash(parsed.data.password);

  try {
    const usuario = await prisma.staffUser.create({
      data: {
        nombre: parsed.data.nombre,
        username: parsed.data.username,
        passwordHash,
        cargoInterno: "",
        perfil: parsed.data.perfil,
      },
    });
    revalidatePath("/staff/usuarios");
    return { success: true, data: usuario };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function cambiarPerfil(
  id: string,
  perfil: PerfilStaff
): Promise<ActionResult<StaffUser>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const usuario = await prisma.staffUser.update({ where: { id }, data: { perfil } });
    revalidatePath("/staff/usuarios");
    return { success: true, data: usuario };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function setActivo(id: string, activo: boolean): Promise<ActionResult<StaffUser>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  const session = await getServerSession(authOptions);
  if (session?.user?.id === id && activo === false) {
    return { success: false, error: "No puedes desactivarte a ti mismo." };
  }

  try {
    const usuario = await prisma.staffUser.update({ where: { id }, data: { activo } });
    revalidatePath("/staff/usuarios");
    return { success: true, data: usuario };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}

export async function resetearClave(id: string, formData: FormData): Promise<ActionResult<null>> {
  const auth = await requirePerfil("ADMINISTRACION");
  if (!auth.ok) return { success: false, error: auth.error };

  const password = formData.get("password")?.toString() ?? "";
  if (password.length < 8) {
    return { success: false, error: "La contraseña debe tener al menos 8 caracteres" };
  }

  const passwordHash = await hash(password);

  try {
    await prisma.staffUser.update({ where: { id }, data: { passwordHash } });
    revalidatePath("/staff/usuarios");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: mapPrismaError(error) };
  }
}
