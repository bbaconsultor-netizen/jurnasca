import { describe, it, expect } from "vitest";
import { autoridadSchema } from "./autoridad";

describe("autoridadSchema", () => {
  it("accepts a valid autoridad", () => {
    const result = autoridadSchema.safeParse({
      periodoId: "periodo-1",
      cargo: "PRESIDENTE",
      nombre: "Ernesto Espinoza",
      dni: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid cargo", () => {
    const result = autoridadSchema.safeParse({
      periodoId: "periodo-1",
      cargo: "REY",
      nombre: "Ernesto Espinoza",
      dni: "12345678",
    });
    expect(result.success).toBe(false);
  });
});
