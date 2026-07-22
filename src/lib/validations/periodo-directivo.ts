import { z } from "zod";

export const periodoDirectivoSchema = z.object({
  fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
});

export type PeriodoDirectivoInput = z.infer<typeof periodoDirectivoSchema>;
