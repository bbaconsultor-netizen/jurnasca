import { z } from "zod";

export const tomaDeAguaSchema = z.object({
  nombre: z.string().min(2, "El nombre de la toma es obligatorio"),
  canalId: z.string().min(1, "El canal es obligatorio"),
  caudalLps: z.coerce.number().positive("El caudal debe ser mayor a 0"),
  ubicacion: z.string().optional(),
  estadoConservacion: z.enum(["BUENO", "REGULAR", "MALO"]).optional(),
});

export type TomaDeAguaInput = z.infer<typeof tomaDeAguaSchema>;
