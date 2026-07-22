import { z } from "zod";

export const parcelaSchema = z.object({
  reganteId: z.string().min(1, "El regante es obligatorio"),
  tomaDeAguaId: z.string().min(1, "La toma de agua es obligatoria"),
  areaHectareas: z.coerce.number().positive("El área debe ser mayor a 0"),
  ubicacion: z.string().optional(),
});

export type ParcelaInput = z.infer<typeof parcelaSchema>;
