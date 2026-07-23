import { describe, it, expect, vi, beforeEach } from "vitest";
import { listarRegantes } from "./regantes-queries";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    regante: { findMany: vi.fn() },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.regante.findMany).mockResolvedValue([]);
});

describe("listarRegantes", () => {
  it("queries with an empty where when called with no arguments", async () => {
    await listarRegantes();
    expect(prisma.regante.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { apellidos: "asc" },
    });
  });

  it("queries with an empty where when called with an empty filters object", async () => {
    await listarRegantes({});
    expect(prisma.regante.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { apellidos: "asc" },
    });
  });

  it("passes the built filter through to Prisma", async () => {
    await listarRegantes({ estado: "HABIL" });
    expect(prisma.regante.findMany).toHaveBeenCalledWith({
      where: { estadoHabil: true },
      orderBy: { apellidos: "asc" },
    });
  });
});
