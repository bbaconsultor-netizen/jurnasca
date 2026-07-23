import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  crearParcela,
  crearCultivo,
  actualizarParcela,
  eliminarParcela,
  eliminarCultivo,
} from "./parcelas";
import { prisma } from "@/lib/prisma";
import { requirePerfil } from "@/lib/require-staff";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    parcela: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    cultivo: { create: vi.fn(), delete: vi.fn() },
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
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

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
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

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

describe("actualizarParcela", () => {
  it("rejects a non-positive area without calling Prisma", async () => {
    const formData = buildFormData({
      reganteId: "regante-1",
      tomaDeAguaId: "toma-1",
      areaHectareas: "0",
    });

    const result = await actualizarParcela("parcela-1", formData);

    expect(result.success).toBe(false);
    expect(prisma.parcela.update).not.toHaveBeenCalled();
  });

  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const formData = buildFormData({
      reganteId: "regante-1",
      tomaDeAguaId: "toma-1",
      areaHectareas: "2.5",
    });

    const result = await actualizarParcela("parcela-1", formData);

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.parcela.update).not.toHaveBeenCalled();
  });

  it("updates the parcela with valid data", async () => {
    vi.mocked(prisma.parcela.update).mockResolvedValue({ id: "parcela-1", areaHectareas: 3.5 } as never);

    const formData = buildFormData({
      reganteId: "regante-1",
      tomaDeAguaId: "toma-1",
      areaHectareas: "3.5",
    });

    const result = await actualizarParcela("parcela-1", formData);

    expect(result.success).toBe(true);
    expect(prisma.parcela.update).toHaveBeenCalledWith({
      where: { id: "parcela-1" },
      data: expect.objectContaining({ areaHectareas: 3.5 }),
    });
  });
});

describe("eliminarParcela", () => {
  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const result = await eliminarParcela("parcela-1");

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.parcela.delete).not.toHaveBeenCalled();
  });

  it("deletes the parcela when authorized", async () => {
    vi.mocked(prisma.parcela.delete).mockResolvedValue({ id: "parcela-1" } as never);

    const result = await eliminarParcela("parcela-1");

    expect(result).toEqual({ success: true, data: null });
    expect(prisma.parcela.delete).toHaveBeenCalledWith({ where: { id: "parcela-1" } });
  });
});

describe("eliminarCultivo", () => {
  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const result = await eliminarCultivo("cultivo-1");

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.cultivo.delete).not.toHaveBeenCalled();
  });

  it("deletes the cultivo when authorized", async () => {
    vi.mocked(prisma.cultivo.delete).mockResolvedValue({ id: "cultivo-1" } as never);

    const result = await eliminarCultivo("cultivo-1");

    expect(result).toEqual({ success: true, data: null });
    expect(prisma.cultivo.delete).toHaveBeenCalledWith({ where: { id: "cultivo-1" } });
  });
});
