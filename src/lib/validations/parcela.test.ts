import { describe, it, expect } from "vitest";
import { parcelaSchema } from "./parcela";

describe("parcelaSchema", () => {
  it("accepts a valid parcela", () => {
    const result = parcelaSchema.safeParse({
      reganteId: "clx000000000000000000000",
      tomaDeAguaId: "clx000000000000000000001",
      areaHectareas: "2.5",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-positive area", () => {
    const result = parcelaSchema.safeParse({
      reganteId: "clx000000000000000000000",
      tomaDeAguaId: "clx000000000000000000001",
      areaHectareas: "0",
    });
    expect(result.success).toBe(false);
  });
});
