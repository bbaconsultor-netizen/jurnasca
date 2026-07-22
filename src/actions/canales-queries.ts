// Plain (non-"use server") read functions — intentionally NOT exported as Server Actions.
// Adding "use server" here would make these directly, publicly invocable endpoints
// (bypassing any UI), so they are consumed only from Server Components.
import { prisma } from "@/lib/prisma";

export async function listarCanales() {
  return prisma.canal.findMany({ include: { tomas: true }, orderBy: { nombre: "asc" } });
}
