import { describe, it, expect } from "vitest";
import { staffUserSchema } from "./staff-user";

describe("staffUserSchema", () => {
  it("accepts a valid staff user", () => {
    const result = staffUserSchema.safeParse({
      nombre: "María Torres",
      username: "maria.torres",
      password: "clave-segura-1",
      perfil: "TESORERIA",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short password", () => {
    const result = staffUserSchema.safeParse({
      nombre: "María Torres",
      username: "maria",
      password: "corta",
      perfil: "TECNICO",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid username characters", () => {
    const result = staffUserSchema.safeParse({
      nombre: "María Torres",
      username: "María Torres!",
      password: "clave-segura-1",
      perfil: "ADMINISTRACION",
    });
    expect(result.success).toBe(false);
  });
});
