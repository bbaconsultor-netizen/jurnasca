import { z } from "zod";

export const canalSchema = z.object({
  nombre: z.string().min(2, "El nombre del canal es obligatorio"),
  subsector: z.string().min(2, "El subsector es obligatorio"),
});

export type CanalInput = z.infer<typeof canalSchema>;
