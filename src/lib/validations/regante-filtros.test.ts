import { describe, it, expect } from "vitest";
import { construirFiltroRegantes } from "./regante-filtros";

describe("construirFiltroRegantes", () => {
  it("returns an empty object when no filters are given", () => {
    expect(construirFiltroRegantes({})).toEqual({});
  });

  it("returns an empty object when estado is TODOS", () => {
    expect(construirFiltroRegantes({ estado: "TODOS" })).toEqual({});
  });

  it("builds an OR clause across nombres/apellidos/numeroDocumento for q", () => {
    expect(construirFiltroRegantes({ q: "garcia" })).toEqual({
      OR: [
        { nombres: { contains: "garcia", mode: "insensitive" } },
        { apellidos: { contains: "garcia", mode: "insensitive" } },
        { numeroDocumento: { contains: "garcia", mode: "insensitive" } },
      ],
    });
  });

  it("builds estadoHabil: true for HABIL", () => {
    expect(construirFiltroRegantes({ estado: "HABIL" })).toEqual({ estadoHabil: true });
  });

  it("builds estadoHabil: false for NO_HABIL", () => {
    expect(construirFiltroRegantes({ estado: "NO_HABIL" })).toEqual({ estadoHabil: false });
  });

  it("builds a nested parcelas.some filter for comisionId", () => {
    expect(construirFiltroRegantes({ comisionId: "comision-1" })).toEqual({
      parcelas: { some: { tomaDeAgua: { canal: { comisionId: "comision-1" } } } },
    });
  });

  it("ignores an empty-string comisionId", () => {
    expect(construirFiltroRegantes({ comisionId: "" })).toEqual({});
  });

  it("ignores a blank q", () => {
    expect(construirFiltroRegantes({ q: "   " })).toEqual({});
  });

  it("combines all three filters with AND", () => {
    const result = construirFiltroRegantes({ q: "garcia", estado: "HABIL", comisionId: "comision-1" });
    expect(result).toEqual({
      AND: [
        {
          OR: [
            { nombres: { contains: "garcia", mode: "insensitive" } },
            { apellidos: { contains: "garcia", mode: "insensitive" } },
            { numeroDocumento: { contains: "garcia", mode: "insensitive" } },
          ],
        },
        { estadoHabil: true },
        { parcelas: { some: { tomaDeAgua: { canal: { comisionId: "comision-1" } } } } },
      ],
    });
  });
});
