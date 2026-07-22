import { describe, it, expect } from "vitest";
import { generarCodigoPadron } from "./codigo-padron";

describe("generarCodigoPadron", () => {
  it("generates a 6-character code using only the allowed alphabet", () => {
    const codigo = generarCodigoPadron();
    expect(codigo).toHaveLength(6);
    expect(codigo).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
  });

  it("generates different codes across calls", () => {
    const codigos = new Set(Array.from({ length: 20 }, () => generarCodigoPadron()));
    expect(codigos.size).toBeGreaterThan(1);
  });
});
