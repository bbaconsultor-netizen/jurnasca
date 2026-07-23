import { describe, it, expect } from "vitest";
import { compuertaSchema } from "./compuerta";

describe("compuertaSchema", () => {
  it("accepts a valid compuerta", () => {
    expect(compuertaSchema.safeParse({ canalId: "canal-1", nombre: "Compuerta Norte" }).success).toBe(true);
  });

  it("rejects an empty canalId", () => {
    expect(compuertaSchema.safeParse({ canalId: "", nombre: "Compuerta Norte" }).success).toBe(false);
  });

  it("rejects a short nombre", () => {
    expect(compuertaSchema.safeParse({ canalId: "canal-1", nombre: "A" }).success).toBe(false);
  });
});
