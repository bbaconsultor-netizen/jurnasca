import { z } from "zod";

export const compuertaSchema = z.object({
  canalId: z.string().min(1, "El canal es obligatorio"),
  nombre: z.string().min(2, "El nombre de la compuerta es obligatorio"),
  ubicacion: z.string().optional(),
  caracteristicas: z.string().optional(),
  estadoConservacion: z.enum(["BUENO", "REGULAR", "MALO"]).optional(),
});

export type CompuertaInput = z.infer<typeof compuertaSchema>;
