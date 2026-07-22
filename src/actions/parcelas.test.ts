import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearParcela } from "./parcelas";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    parcela: { create: vi.fn() },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
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
});
