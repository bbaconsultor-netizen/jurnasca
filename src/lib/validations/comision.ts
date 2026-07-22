import { z } from "zod";

export const comisionSchema = z.object({
  nombre: z.string().min(2, "El nombre de la comisión es obligatorio"),
  subsector: z.string().min(2, "El subsector es obligatorio"),
});

export type ComisionInput = z.infer<typeof comisionSchema>;
