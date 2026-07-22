import { describe, it, expect } from "vitest";
import { rutaPermitida } from "./route-guard";

describe("rutaPermitida", () => {
  it("allows STAFF into /staff routes", () => {
    expect(rutaPermitida("/staff/junta", "STAFF")).toBe(true);
  });

  it("blocks REGANTE from /staff routes", () => {
    expect(rutaPermitida("/staff/junta", "REGANTE")).toBe(false);
  });

  it("blocks anonymous users from /staff routes", () => {
    expect(rutaPermitida("/staff/junta", null)).toBe(false);
  });

  it("allows REGANTE into /regante routes", () => {
    expect(rutaPermitida("/regante/mi-padron", "REGANTE")).toBe(true);
  });

  it("blocks STAFF from /regante routes", () => {
    expect(rutaPermitida("/regante/mi-padron", "STAFF")).toBe(false);
  });

  it("allows anyone into unrelated routes", () => {
    expect(rutaPermitida("/login", null)).toBe(true);
  });
});
