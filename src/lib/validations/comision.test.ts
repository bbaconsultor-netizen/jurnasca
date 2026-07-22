import { describe, it, expect } from "vitest";
import { comisionSchema } from "./comision";
import { comiteSchema } from "./comite";

describe("comisionSchema", () => {
  it("accepts a valid comision", () => {
    expect(comisionSchema.safeParse({ nombre: "Comisión A", subsector: "Subsector 1" }).success).toBe(true);
  });

  it("rejects an empty nombre", () => {
    expect(comisionSchema.safeParse({ nombre: "", subsector: "Subsector 1" }).success).toBe(false);
  });
});

describe("comiteSchema", () => {
  it("accepts a valid comite", () => {
    expect(
      comiteSchema.safeParse({ comisionId: "com-1", nombre: "Comité Canal Norte", tipo: "CANAL" }).success
    ).toBe(true);
  });

  it("rejects an invalid tipo", () => {
    expect(
      comiteSchema.safeParse({ comisionId: "com-1", nombre: "Comité X", tipo: "RIO" }).success
    ).toBe(false);
  });
});
