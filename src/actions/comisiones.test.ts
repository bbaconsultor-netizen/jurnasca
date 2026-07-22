import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearComision, eliminarComision, crearComite } from "./comisiones";
import { prisma } from "@/lib/prisma";
import { requirePerfil } from "@/lib/require-staff";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    comision: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    comite: { create: vi.fn(), delete: vi.fn() },
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

describe("crearComision", () => {
  it("rechaza perfil no autorizado sin llamar a Prisma", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });
    const result = await crearComision(buildFormData({ nombre: "Comisión A", subsector: "S1" }));
    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.comision.create).not.toHaveBeenCalled();
  });

  it("rechaza nombre vacío sin llamar a Prisma", async () => {
    const result = await crearComision(buildFormData({ nombre: "", subsector: "S1" }));
    expect(result.success).toBe(false);
    expect(prisma.comision.create).not.toHaveBeenCalled();
  });
});

describe("eliminarComision", () => {
  it("mapea el bloqueo por comités/canales asociados a un error amigable", async () => {
    const { Prisma } = await import("@prisma/client");
    vi.mocked(prisma.comision.delete).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
        code: "P2003",
        clientVersion: "6.0.0",
      })
    );
    const result = await eliminarComision("com-1");
    expect(result).toEqual({ success: false, error: "La referencia seleccionada no existe." });
  });
});

describe("crearComite", () => {
  it("crea un comité válido", async () => {
    vi.mocked(prisma.comite.create).mockResolvedValue({ id: "comite-1" } as never);
    const result = await crearComite(
      buildFormData({ comisionId: "com-1", nombre: "Comité Canal Norte", tipo: "CANAL" })
    );
    expect(result.success).toBe(true);
    expect(prisma.comite.create).toHaveBeenCalledWith({
      data: { comisionId: "com-1", nombre: "Comité Canal Norte", tipo: "CANAL" },
    });
  });
});
