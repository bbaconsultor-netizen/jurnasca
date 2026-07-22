import { describe, it, expect, vi, beforeEach } from "vitest";
import { autenticarStaff, autenticarRegante } from "./auth-credentials";
import { prisma } from "./prisma";
import { verificar } from "./crypto";

vi.mock("./prisma", () => ({
  prisma: {
    staffUser: { findUnique: vi.fn() },
    regante: { findUnique: vi.fn() },
  },
}));

vi.mock("./crypto", () => ({
  verificar: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("autenticarStaff", () => {
  it("returns the user when credentials are valid and the account is active", async () => {
    vi.mocked(prisma.staffUser.findUnique).mockResolvedValue({
      id: "staff-1",
      nombre: "Ana Torres",
      username: "ana",
      passwordHash: "hashed",
      cargoInterno: "Gerente",
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(verificar).mockResolvedValue(true);

    const result = await autenticarStaff("ana", "clave-correcta");

    expect(result).toEqual({ id: "staff-1", name: "Ana Torres", role: "STAFF" });
  });

  it("returns null when the account is inactive", async () => {
    vi.mocked(prisma.staffUser.findUnique).mockResolvedValue({
      id: "staff-1",
      nombre: "Ana Torres",
      username: "ana",
      passwordHash: "hashed",
      cargoInterno: "Gerente",
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await autenticarStaff("ana", "cualquier-clave");

    expect(result).toBeNull();
  });

  it("returns null when the password does not match", async () => {
    vi.mocked(prisma.staffUser.findUnique).mockResolvedValue({
      id: "staff-1",
      nombre: "Ana Torres",
      username: "ana",
      passwordHash: "hashed",
      cargoInterno: "Gerente",
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(verificar).mockResolvedValue(false);

    const result = await autenticarStaff("ana", "clave-incorrecta");

    expect(result).toBeNull();
  });
});

describe("autenticarRegante", () => {
  it("returns the user when DNI and código match", async () => {
    vi.mocked(prisma.regante.findUnique).mockResolvedValue({
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
    vi.mocked(verificar).mockResolvedValue(true);

    const result = await autenticarRegante("12345678", "ABC123");

    expect(result).toEqual({ id: "regante-1", name: "Juan Pérez", role: "REGANTE" });
  });

  it("returns null when the DNI does not exist", async () => {
    vi.mocked(prisma.regante.findUnique).mockResolvedValue(null);

    const result = await autenticarRegante("00000000", "ABC123");

    expect(result).toBeNull();
  });
});
