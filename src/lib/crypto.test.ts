import { describe, it, expect } from "vitest";
import { hash, verificar } from "./crypto";

describe("crypto", () => {
  it("hashes a value and verifies it correctly", async () => {
    const hashed = await hash("mi-valor-secreto");
    expect(hashed).not.toBe("mi-valor-secreto");
    expect(await verificar("mi-valor-secreto", hashed)).toBe(true);
  });

  it("rejects an incorrect value", async () => {
    const hashed = await hash("mi-valor-secreto");
    expect(await verificar("otro-valor", hashed)).toBe(false);
  });
});
