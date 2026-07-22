import { describe, it, expect } from "vitest";
import { cultivoSchema } from "./cultivo";

describe("cultivoSchema", () => {
  it("accepts a valid cultivo", () => {
    const result = cultivoSchema.safeParse({
      parcelaId: "clx000000000000000000000",
      tipoCultivo: "Algodón",
      campana: "2026-I",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing tipoCultivo", () => {
    const result = cultivoSchema.safeParse({
      parcelaId: "clx000000000000000000000",
      tipoCultivo: "",
      campana: "2026-I",
    });
    expect(result.success).toBe(false);
  });
});
