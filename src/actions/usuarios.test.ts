import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearStaffUser, setActivo } from "./usuarios";
import { prisma } from "@/lib/prisma";
import { requirePerfil } from "@/lib/require-staff";
import { getServerSession } from "next-auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    staffUser: { create: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/require-staff", () => ({
  requirePerfil: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requirePerfil).mockResolvedValue({ ok: true });
  vi.mocked(getServerSession).mockResolvedValue({
    user: { id: "admin-1", role: "STAFF", perfil: "ADMINISTRACION" },
  } as never);
});

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe("crearStaffUser", () => {
  it("rechaza sesión sin perfil ADMINISTRACION sin llamar a Prisma", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });
    const result = await crearStaffUser(
      buildFormData({ nombre: "Ana", username: "ana", password: "clave-segura", perfil: "TECNICO" })
    );
    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.staffUser.create).not.toHaveBeenCalled();
  });

  it("rechaza contraseña corta sin llamar a Prisma", async () => {
    const result = await crearStaffUser(
      buildFormData({ nombre: "Ana", username: "ana", password: "corta", perfil: "TECNICO" })
    );
    expect(result.success).toBe(false);
    expect(prisma.staffUser.create).not.toHaveBeenCalled();
  });

  it("crea el usuario con la contraseña hasheada (nunca en texto plano)", async () => {
    vi.mocked(prisma.staffUser.create).mockResolvedValue({
      id: "staff-2",
      nombre: "Ana",
      username: "ana",
      passwordHash: "hashed",
      cargoInterno: "",
      perfil: "TECNICO",
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await crearStaffUser(
      buildFormData({ nombre: "Ana", username: "ana", password: "clave-segura", perfil: "TECNICO" })
    );

    expect(result.success).toBe(true);
    const createArgs = vi.mocked(prisma.staffUser.create).mock.calls[0][0];
    expect(createArgs.data).toHaveProperty("passwordHash");
    expect(createArgs.data.passwordHash).not.toBe("clave-segura");
    expect(createArgs.data).not.toHaveProperty("password");
  });
});

describe("setActivo", () => {
  it("bloquea la auto-desactivación", async () => {
    const result = await setActivo("admin-1", false);
    expect(result).toEqual({ success: false, error: "No puedes desactivarte a ti mismo." });
    expect(prisma.staffUser.update).not.toHaveBeenCalled();
  });

  it("desactiva a otro usuario", async () => {
    vi.mocked(prisma.staffUser.update).mockResolvedValue({ id: "staff-2", activo: false } as never);
    const result = await setActivo("staff-2", false);
    expect(result.success).toBe(true);
    expect(prisma.staffUser.update).toHaveBeenCalledWith({
      where: { id: "staff-2" },
      data: { activo: false },
    });
  });

  it("rechaza perfil no autorizado", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });
    const result = await setActivo("staff-2", false);
    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.staffUser.update).not.toHaveBeenCalled();
  });
});
