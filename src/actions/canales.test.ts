import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  crearCanal,
  crearTomaDeAgua,
  actualizarCanal,
  eliminarCanal,
  actualizarTomaDeAgua,
  eliminarTomaDeAgua,
} from "./canales";
import { prisma } from "@/lib/prisma";
import { requirePerfil } from "@/lib/require-staff";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    canal: { create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
    tomaDeAgua: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
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

describe("crearCanal", () => {
  it("rejects an empty nombre without calling Prisma", async () => {
    const result = await crearCanal(buildFormData({ nombre: "", subsector: "A" }));
    expect(result.success).toBe(false);
    expect(prisma.canal.create).not.toHaveBeenCalled();
  });

  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const result = await crearCanal(buildFormData({ nombre: "Canal Principal", subsector: "A" }));

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.canal.create).not.toHaveBeenCalled();
  });
});

describe("crearTomaDeAgua", () => {
  it("rejects a non-positive caudal without calling Prisma", async () => {
    const result = await crearTomaDeAgua(
      buildFormData({ nombre: "Toma 1", canalId: "canal-1", caudalLps: "-5" })
    );
    expect(result.success).toBe(false);
    expect(prisma.tomaDeAgua.create).not.toHaveBeenCalled();
  });

  it("returns 'No autorizado.' and does not call Prisma when the session is not STAFF", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });

    const result = await crearTomaDeAgua(
      buildFormData({ nombre: "Toma 1", canalId: "canal-1", caudalLps: "15.5" })
    );

    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.tomaDeAgua.create).not.toHaveBeenCalled();
  });
});

describe("actualizarCanal", () => {
  it("rejects perfil no autorizado sin llamar a Prisma", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });
    const result = await actualizarCanal("canal-1", buildFormData({ nombre: "Canal A", subsector: "S1" }));
    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.canal.update).not.toHaveBeenCalled();
  });

  it("actualiza el canal con datos válidos", async () => {
    vi.mocked(prisma.canal.update).mockResolvedValue({ id: "canal-1" } as never);
    const result = await actualizarCanal("canal-1", buildFormData({ nombre: "Canal A", subsector: "S1" }));
    expect(result.success).toBe(true);
    expect(prisma.canal.update).toHaveBeenCalledWith({
      where: { id: "canal-1" },
      data: expect.objectContaining({ nombre: "Canal A" }),
    });
  });
});

describe("eliminarCanal", () => {
  it("mapea el bloqueo por tomas asociadas a un error amigable", async () => {
    const { Prisma } = await import("@prisma/client");
    vi.mocked(prisma.canal.delete).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
        code: "P2003",
        clientVersion: "6.0.0",
      })
    );
    const result = await eliminarCanal("canal-1");
    expect(result).toEqual({ success: false, error: "La referencia seleccionada no existe." });
  });
});

describe("actualizarTomaDeAgua", () => {
  it("rechaza caudal no positivo sin llamar a Prisma", async () => {
    const result = await actualizarTomaDeAgua(
      "toma-1",
      buildFormData({ nombre: "Toma 1", canalId: "canal-1", caudalLps: "0" })
    );
    expect(result.success).toBe(false);
    expect(prisma.tomaDeAgua.update).not.toHaveBeenCalled();
  });

  it("actualiza la toma con datos válidos", async () => {
    vi.mocked(prisma.tomaDeAgua.update).mockResolvedValue({ id: "toma-1" } as never);
    const result = await actualizarTomaDeAgua(
      "toma-1",
      buildFormData({ nombre: "Toma 1", canalId: "canal-1", caudalLps: "20" })
    );
    expect(result.success).toBe(true);
  });
});

describe("eliminarTomaDeAgua", () => {
  it("mapea el bloqueo por parcelas asociadas a un error amigable", async () => {
    const { Prisma } = await import("@prisma/client");
    vi.mocked(prisma.tomaDeAgua.delete).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
        code: "P2003",
        clientVersion: "6.0.0",
      })
    );
    const result = await eliminarTomaDeAgua("toma-1");
    expect(result).toEqual({ success: false, error: "La referencia seleccionada no existe." });
  });

  it("rechaza perfil no autorizado sin llamar a Prisma", async () => {
    vi.mocked(requirePerfil).mockResolvedValue({ ok: false, error: "No autorizado." });
    const result = await eliminarTomaDeAgua("toma-1");
    expect(result).toEqual({ success: false, error: "No autorizado." });
    expect(prisma.tomaDeAgua.delete).not.toHaveBeenCalled();
  });
});
