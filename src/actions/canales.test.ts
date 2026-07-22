import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearCanal, crearTomaDeAgua } from "./canales";
import { prisma } from "@/lib/prisma";
import { requirePerfil } from "@/lib/require-staff";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    canal: { create: vi.fn(), findMany: vi.fn() },
    tomaDeAgua: { create: vi.fn() },
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
