import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearCompuerta, eliminarCompuerta } from "./compuertas";
import { prisma } from "@/lib/prisma";
import { requirePerfil } from "@/lib/require-staff";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    compuerta: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
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

describe("crearCompuerta", () => {
  it("rechaza perfil no autorizado sin llamar a Prisma", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });
    const result = await crearCompuerta(buildFormData({ canalId: "canal-1", nombre: "Compuerta A" }));
    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.compuerta.create).not.toHaveBeenCalled();
  });

  it("rechaza nombre corto sin llamar a Prisma", async () => {
    const result = await crearCompuerta(buildFormData({ canalId: "canal-1", nombre: "A" }));
    expect(result.success).toBe(false);
    expect(prisma.compuerta.create).not.toHaveBeenCalled();
  });

  it("crea la compuerta con datos válidos", async () => {
    vi.mocked(prisma.compuerta.create).mockResolvedValue({ id: "compuerta-1" } as never);
    const result = await crearCompuerta(buildFormData({ canalId: "canal-1", nombre: "Compuerta A" }));
    expect(result.success).toBe(true);
  });
});

describe("eliminarCompuerta", () => {
  it("elimina la compuerta cuando está autorizado", async () => {
    vi.mocked(prisma.compuerta.delete).mockResolvedValue({ id: "compuerta-1" } as never);
    const result = await eliminarCompuerta("compuerta-1");
    expect(result).toEqual({ success: true, data: null });
  });

  it("rechaza perfil no autorizado sin llamar a Prisma", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });
    const result = await eliminarCompuerta("compuerta-1");
    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.compuerta.delete).not.toHaveBeenCalled();
  });
});
