import { z } from "zod";

export const cultivoSchema = z.object({
  parcelaId: z.string().min(1, "La parcela es obligatoria"),
  tipoCultivo: z.string().min(2, "El tipo de cultivo es obligatorio"),
  campana: z.string().min(4, "La campaña es obligatoria (ej. 2026-I)"),
  fechaSiembra: z.string().optional(),
});

export type CultivoInput = z.infer<typeof cultivoSchema>;
