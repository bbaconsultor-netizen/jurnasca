import { z } from "zod";

export const canalSchema = z.object({
  nombre: z.string().min(2, "El nombre del canal es obligatorio"),
  subsector: z.string().min(2, "El subsector es obligatorio"),
  comisionId: z.string().optional(),
  estadoConservacion: z.enum(["BUENO", "REGULAR", "MALO"]).optional(),
});

export type CanalInput = z.infer<typeof canalSchema>;
