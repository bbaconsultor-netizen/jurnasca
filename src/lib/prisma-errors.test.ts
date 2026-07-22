import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { mapPrismaError } from "./prisma-errors";

describe("mapPrismaError", () => {
  it("returns a friendly message for unique constraint violations", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "5.0.0",
      meta: { target: ["dni"] },
    });
    expect(mapPrismaError(error)).toBe("Ya existe un registro con ese valor en: dni");
  });

  it("returns a friendly message for missing foreign keys", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
      code: "P2003",
      clientVersion: "5.0.0",
    });
    expect(mapPrismaError(error)).toBe("La referencia seleccionada no existe.");
  });

  it("returns a generic message for unknown errors", () => {
    expect(mapPrismaError(new Error("boom"))).toBe(
      "Ocurrió un error inesperado. Intenta nuevamente."
    );
  });
});
