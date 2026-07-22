import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearRegante } from "./regantes";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    regante: { create: vi.fn() },
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

describe("crearRegante", () => {
  it("returns a validation error for an invalid DNI", async () => {
    const formData = buildFormData({ dni: "123", nombres: "Juan", apellidos: "Pérez" });

    const result = await crearRegante(formData);

    expect(result.success).toBe(false);
    expect(prisma.regante.create).not.toHaveBeenCalled();
  });

  it("creates the regante and returns the plaintext código once", async () => {
    vi.mocked(prisma.regante.create).mockResolvedValue({
      id: "regante-1",
      dni: "12345678",
      codigoPadronHash: "hashed",
      nombres: "Juan",
      apellidos: "Pérez",
      telefono: null,
      direccion: null,
      estadoHabil: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const formData = buildFormData({ dni: "12345678", nombres: "Juan", apellidos: "Pérez" });

    const result = await crearRegante(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.regante.dni).toBe("12345678");
      expect(result.data.codigoPadronPlano).toHaveLength(6);
    }
  });

  it("maps a duplicate DNI into a friendly error", async () => {
    const { Prisma } = await import("@prisma/client");
    vi.mocked(prisma.regante.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "5.0.0",
        meta: { target: ["dni"] },
      })
    );

    const formData = buildFormData({ dni: "12345678", nombres: "Juan", apellidos: "Pérez" });

    const result = await crearRegante(formData);

    expect(result).toEqual({
      success: false,
      error: "Ya existe un registro con ese valor en: dni",
    });
  });
});
