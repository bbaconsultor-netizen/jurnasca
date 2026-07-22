import { describe, it, expect, vi, beforeEach } from "vitest";
import { cerrarPeriodoDirectivo, abrirPeriodoDirectivo, agregarAutoridad } from "./junta";
import { prisma } from "@/lib/prisma";
import { requirePerfil } from "@/lib/require-staff";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    periodoDirectivo: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
    autoridad: { create: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/require-staff", () => ({
  requirePerfil: vi.fn(),
}));

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requirePerfil).mockResolvedValue({ ok: true });
});

describe("cerrarPeriodoDirectivo", () => {
  it("returns an error and does not update when the period is already CONCLUIDO", async () => {
    vi.mocked(prisma.periodoDirectivo.findUnique).mockResolvedValue({
      id: "periodo-1",
      fechaInicio: new Date("2020-01-01"),
      fechaFin: new Date("2024-01-01"),
      estado: "CONCLUIDO",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await cerrarPeriodoDirectivo("periodo-1");

    expect(result).toEqual({ success: false, error: "Este período ya está concluido." });
    expect(prisma.periodoDirectivo.update).not.toHaveBeenCalled();
  });

  it("closes a VIGENTE period", async () => {
    vi.mocked(prisma.periodoDirectivo.findUnique).mockResolvedValue({
      id: "periodo-1",
      fechaInicio: new Date("2024-01-01"),
      fechaFin: null,
      estado: "VIGENTE",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(prisma.periodoDirectivo.update).mockResolvedValue({
      id: "periodo-1",
      fechaInicio: new Date("2024-01-01"),
      fechaFin: new Date(),
      estado: "CONCLUIDO",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await cerrarPeriodoDirectivo("periodo-1");

    expect(result.success).toBe(true);
    expect(prisma.periodoDirectivo.update).toHaveBeenCalledWith({
      where: { id: "periodo-1" },
      data: { estado: "CONCLUIDO", fechaFin: expect.any(Date) },
    });
  });

  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const result = await cerrarPeriodoDirectivo("periodo-1");

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.periodoDirectivo.findUnique).not.toHaveBeenCalled();
    expect(prisma.periodoDirectivo.update).not.toHaveBeenCalled();
  });
});

describe("abrirPeriodoDirectivo", () => {
  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const formData = buildFormData({ fechaInicio: "2026-01-01" });

    const result = await abrirPeriodoDirectivo(formData);

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.periodoDirectivo.create).not.toHaveBeenCalled();
  });
});

describe("agregarAutoridad", () => {
  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const formData = buildFormData({
      periodoId: "periodo-1",
      cargo: "PRESIDENTE",
      nombre: "Juan Pérez",
      dni: "12345678",
    });

    const result = await agregarAutoridad(formData);

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.autoridad.create).not.toHaveBeenCalled();
  });
});
