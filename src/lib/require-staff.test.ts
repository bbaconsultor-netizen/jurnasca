import { describe, it, expect, vi, beforeEach } from "vitest";
import { getServerSession } from "next-auth";
import { requireStaff, requirePerfil } from "./require-staff";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("./auth", () => ({
  authOptions: {},
}));

function sesion(role: "STAFF" | "REGANTE", perfil?: string) {
  return { user: { id: "u1", role, perfil } } as never;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireStaff", () => {
  it("acepta cualquier STAFF", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sesion("STAFF", "TECNICO"));
    expect(await requireStaff()).toEqual({ ok: true });
  });

  it("rechaza REGANTE", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sesion("REGANTE"));
    expect(await requireStaff()).toEqual({ ok: false, error: "No autorizado." });
  });
});

describe("requirePerfil", () => {
  it("acepta el perfil listado", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sesion("STAFF", "ADMINISTRACION"));
    expect(await requirePerfil("ADMINISTRACION")).toEqual({ ok: true });
  });

  it("rechaza un perfil no listado", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sesion("STAFF", "TECNICO"));
    expect(await requirePerfil("ADMINISTRACION")).toEqual({ ok: false, error: "No autorizado." });
  });

  it("acepta cualquiera de varios perfiles listados", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sesion("STAFF", "TECNICO"));
    expect(await requirePerfil("ADMINISTRACION", "TECNICO")).toEqual({ ok: true });
  });

  it("rechaza REGANTE aunque tenga perfil", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sesion("REGANTE", "ADMINISTRACION"));
    expect(await requirePerfil("ADMINISTRACION")).toEqual({ ok: false, error: "No autorizado." });
  });

  it("rechaza sesión ausente", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as never);
    expect(await requirePerfil("ADMINISTRACION")).toEqual({ ok: false, error: "No autorizado." });
  });

  it("rechaza STAFF sin perfil en sesión", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sesion("STAFF"));
    expect(await requirePerfil("ADMINISTRACION")).toEqual({ ok: false, error: "No autorizado." });
  });
});
