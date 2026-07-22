import { describe, it, expect, vi, beforeEach } from "vitest";
import { crearCanal, crearTomaDeAgua } from "./canales";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    canal: { create: vi.fn(), findMany: vi.fn() },
    tomaDeAgua: { create: vi.fn() },
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

describe("crearCanal", () => {
  it("rejects an empty nombre without calling Prisma", async () => {
    const result = await crearCanal(buildFormData({ nombre: "", subsector: "A" }));
    expect(result.success).toBe(false);
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
});
