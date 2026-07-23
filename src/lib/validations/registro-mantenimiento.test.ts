import { describe, it, expect } from "vitest";
import { registroSchema } from "./registro-mantenimiento";

describe("registroSchema", () => {
  it("accepts a valid registro targeting a canal", () => {
    expect(
      registroSchema.safeParse({
        tipo: "MANTENIMIENTO",
        fecha: "2026-07-22",
        descripcion: "Limpieza de sedimentos",
        canalId: "canal-1",
      }).success
    ).toBe(true);
  });

  it("accepts a valid registro targeting a toma", () => {
    expect(
      registroSchema.safeParse({
        tipo: "INCIDENCIA",
        fecha: "2026-07-22",
        descripcion: "Fuga detectada",
        tomaDeAguaId: "toma-1",
      }).success
    ).toBe(true);
  });

  it("rejects zero targets", () => {
    expect(
      registroSchema.safeParse({
        tipo: "INCIDENCIA",
        fecha: "2026-07-22",
        descripcion: "Fuga detectada",
      }).success
    ).toBe(false);
  });

  it("rejects two targets", () => {
    expect(
      registroSchema.safeParse({
        tipo: "INCIDENCIA",
        fecha: "2026-07-22",
        descripcion: "Fuga detectada",
        canalId: "canal-1",
        tomaDeAguaId: "toma-1",
      }).success
    ).toBe(false);
  });
});
