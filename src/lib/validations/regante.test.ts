import { describe, it, expect } from "vitest";
import { reganteSchema } from "./regante";

describe("reganteSchema", () => {
  it("accepts a valid regante", () => {
    const result = reganteSchema.safeParse({
      dni: "12345678",
      nombres: "Juan",
      apellidos: "Pérez",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a DNI that is not 8 digits", () => {
    const result = reganteSchema.safeParse({
      dni: "123",
      nombres: "Juan",
      apellidos: "Pérez",
    });
    expect(result.success).toBe(false);
  });
});
