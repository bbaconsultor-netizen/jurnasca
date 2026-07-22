import { Prisma } from "@prisma/client";

export function mapPrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ") ?? "campo";
      return `Ya existe un registro con ese valor en: ${target}`;
    }
    if (error.code === "P2003") {
      return "La referencia seleccionada no existe.";
    }
    if (error.code === "P2025") {
      return "El registro no existe o ya fue eliminado.";
    }
  }
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}
