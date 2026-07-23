import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearRegistro, resolverRegistro } from "./mantenimiento";
import { prisma } from "@/lib/prisma";
import { requirePerfil } from "@/lib/require-staff";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    registroMantenimiento: { create: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/require-staff", () => ({
  requirePerfil: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requirePerfil).mockResolvedValue({ ok: true });
});

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe("crearRegistro", () => {
  it("rechaza perfil no autorizado sin llamar a Prisma", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });
    const result = await crearRegistro(
      buildFormData({ tipo: "INCIDENCIA", fecha: "2026-07-22", descripcion: "Fuga", canalId: "canal-1" })
    );
    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.registroMantenimiento.create).not.toHaveBeenCalled();
  });

  it("rechaza cero targets sin llamar a Prisma", async () => {
    const result = await crearRegistro(
      buildFormData({ tipo: "INCIDENCIA", fecha: "2026-07-22", descripcion: "Fuga detectada" })
    );
    expect(result.success).toBe(false);
    expect(prisma.registroMantenimiento.create).not.toHaveBeenCalled();
  });

  it("crea el registro con un único target válido", async () => {
    vi.mocked(prisma.registroMantenimiento.create).mockResolvedValue({ id: "registro-1" } as never);
    const result = await crearRegistro(
      buildFormData({ tipo: "INCIDENCIA", fecha: "2026-07-22", descripcion: "Fuga detectada", tomaDeAguaId: "toma-1" })
    );
    expect(result.success).toBe(true);
  });
});

describe("resolverRegistro", () => {
  it("rechaza perfil no autorizado sin llamar a Prisma", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });
    const result = await resolverRegistro("registro-1");
    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.registroMantenimiento.update).not.toHaveBeenCalled();
  });

  it("marca el registro como resuelto", async () => {
    vi.mocked(prisma.registroMantenimiento.update).mockResolvedValue({ id: "registro-1" } as never);
    const result = await resolverRegistro("registro-1");
    expect(result.success).toBe(true);
    expect(prisma.registroMantenimiento.update).toHaveBeenCalledWith({
      where: { id: "registro-1" },
      data: { estado: "RESUELTO" },
    });
  });
});
