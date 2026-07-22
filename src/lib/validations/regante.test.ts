import { describe, it, expect } from "vitest";
import { reganteSchema } from "./regante";

describe("reganteSchema", () => {
  it("accepts a valid DNI regante", () => {
    const result = reganteSchema.safeParse({
      tipoDocumento: "DNI",
      numeroDocumento: "12345678",
      nombres: "Juan",
      apellidos: "Pérez",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid RUC regante (11 digits)", () => {
    const result = reganteSchema.safeParse({
      tipoDocumento: "RUC",
      numeroDocumento: "20123456789",
      nombres: "Empresa",
      apellidos: "Agrícola",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a DNI that is not 8 digits", () => {
    const result = reganteSchema.safeParse({
      tipoDocumento: "DNI",
      numeroDocumento: "123",
      nombres: "Juan",
      apellidos: "Pérez",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a RUC with 8 digits", () => {
    const result = reganteSchema.safeParse({
      tipoDocumento: "RUC",
      numeroDocumento: "12345678",
      nombres: "Empresa",
      apellidos: "Agrícola",
    });
    expect(result.success).toBe(false);
  });
});
