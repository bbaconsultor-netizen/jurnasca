import { describe, it, expect } from "vitest";
import { tomaDeAguaSchema } from "./toma-de-agua";

describe("tomaDeAguaSchema", () => {
  it("accepts a valid toma de agua", () => {
    const result = tomaDeAguaSchema.safeParse({
      nombre: "Toma 1",
      canalId: "canal-1",
      caudalLps: "15.5",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-positive caudal", () => {
    const result = tomaDeAguaSchema.safeParse({
      nombre: "Toma 1",
      canalId: "canal-1",
      caudalLps: "0",
    });
    expect(result.success).toBe(false);
  });
});
