import { describe, it, expect, vi, beforeEach } from "vitest";
import { cerrarPeriodoDirectivo } from "./junta";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    periodoDirectivo: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
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
});
