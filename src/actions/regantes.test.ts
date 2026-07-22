import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearRegante, actualizarEstadoHabil } from "./regantes";
import { prisma } from "@/lib/prisma";
import { requirePerfil } from "@/lib/require-staff";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    regante: { create: vi.fn(), update: vi.fn() },
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

describe("crearRegante", () => {
  it("returns a validation error for an invalid DNI", async () => {
    const formData = buildFormData({ tipoDocumento: "DNI", numeroDocumento: "123", nombres: "Juan", apellidos: "Pérez" });

    const result = await crearRegante(formData);

    expect(result.success).toBe(false);
    expect(prisma.regante.create).not.toHaveBeenCalled();
  });

  it("creates the regante and returns the plaintext código once", async () => {
    vi.mocked(prisma.regante.create).mockResolvedValue({
      id: "regante-1",
      numeroDocumento: "12345678",
      codigoPadronHash: "hashed",
      nombres: "Juan",
      apellidos: "Pérez",
      telefono: null,
      direccion: null,
      estadoHabil: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const formData = buildFormData({ tipoDocumento: "DNI", numeroDocumento: "12345678", nombres: "Juan", apellidos: "Pérez" });

    const result = await crearRegante(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.regante.numeroDocumento).toBe("12345678");
      expect(result.data.codigoPadronPlano).toHaveLength(6);

      // Assert that the hashed código was passed to create, not the plaintext
      const createOptions = vi.mocked(prisma.regante.create).mock.calls[0][0];
      expect(createOptions.data).toHaveProperty("codigoPadronHash");
      expect(createOptions.data.codigoPadronHash).not.toBe(result.data.codigoPadronPlano);
    }
  });

  it("maps a duplicate DNI into a friendly error", async () => {
    const { Prisma } = await import("@prisma/client");
    vi.mocked(prisma.regante.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "5.0.0",
        meta: { target: ["numeroDocumento"] },
      })
    );

    const formData = buildFormData({ tipoDocumento: "DNI", numeroDocumento: "12345678", nombres: "Juan", apellidos: "Pérez" });

    const result = await crearRegante(formData);

    expect(result).toEqual({
      success: false,
      error: "Ya existe un registro con ese valor en: numeroDocumento",
    });
  });

  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const formData = buildFormData({ tipoDocumento: "DNI", numeroDocumento: "12345678", nombres: "Juan", apellidos: "Pérez" });

    const result = await crearRegante(formData);

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.regante.create).not.toHaveBeenCalled();
  });
});

describe("actualizarEstadoHabil", () => {
  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const result = await actualizarEstadoHabil("regante-1", false);

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.regante.update).not.toHaveBeenCalled();
  });

  it("updates estadoHabil when the session is STAFF", async () => {
    vi.mocked(prisma.regante.update).mockResolvedValue({
      id: "regante-1",
      numeroDocumento: "12345678",
      codigoPadronHash: "hashed",
      nombres: "Juan",
      apellidos: "Pérez",
      telefono: null,
      direccion: null,
      estadoHabil: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await actualizarEstadoHabil("regante-1", false);

    expect(result.success).toBe(true);
    expect(prisma.regante.update).toHaveBeenCalledWith({
      where: { id: "regante-1" },
      data: { estadoHabil: false },
    });
  });
});
