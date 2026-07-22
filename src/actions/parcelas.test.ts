import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearParcela, crearCultivo } from "./parcelas";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    parcela: { create: vi.fn() },
    cultivo: { create: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/require-staff", () => ({
  requireStaff: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireStaff).mockResolvedValue({ ok: true });
});

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe("crearParcela", () => {
  it("rejects a non-positive area without calling Prisma", async () => {
    const formData = buildFormData({
      reganteId: "regante-1",
      tomaDeAguaId: "toma-1",
      areaHectareas: "0",
    });

    const result = await crearParcela(formData);

    expect(result.success).toBe(false);
    expect(prisma.parcela.create).not.toHaveBeenCalled();
  });

  it("maps a non-existent tomaDeAguaId into a friendly error", async () => {
    const { Prisma } = await import("@prisma/client");
    vi.mocked(prisma.parcela.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
        code: "P2003",
        clientVersion: "5.0.0",
      })
    );

    const formData = buildFormData({
      reganteId: "regante-1",
      tomaDeAguaId: "toma-inexistente",
      areaHectareas: "2.5",
    });

    const result = await crearParcela(formData);

    expect(result).toEqual({ success: false, error: "La referencia seleccionada no existe." });
  });

  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requireStaff).mockResolvedValue({ ok: false, error: "No autorizado." });

    const formData = buildFormData({
      reganteId: "regante-1",
      tomaDeAguaId: "toma-1",
      areaHectareas: "2.5",
    });

    const result = await crearParcela(formData);

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.parcela.create).not.toHaveBeenCalled();
  });
});

describe("crearCultivo", () => {
  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requireStaff).mockResolvedValue({ ok: false, error: "No autorizado." });

    const formData = buildFormData({
      parcelaId: "parcela-1",
      tipoCultivo: "Maíz",
      campana: "2026-I",
    });

    const result = await crearCultivo(formData);

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.cultivo.create).not.toHaveBeenCalled();
  });
});
