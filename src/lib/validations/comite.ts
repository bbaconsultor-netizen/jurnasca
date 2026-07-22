import { z } from "zod";

export const comiteSchema = z.object({
  comisionId: z.string().min(1, "La comisión es obligatoria"),
  nombre: z.string().min(2, "El nombre del comité es obligatorio"),
  tipo: z.enum(["CANAL", "POZO", "MANANTIAL"]),
});

export type ComiteInput = z.infer<typeof comiteSchema>;
