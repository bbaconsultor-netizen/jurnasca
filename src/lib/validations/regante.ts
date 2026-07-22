import { z } from "zod";

export const reganteSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  nombres: z.string().min(2, "Los nombres son obligatorios"),
  apellidos: z.string().min(2, "Los apellidos son obligatorios"),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
});

export type ReganteInput = z.infer<typeof reganteSchema>;
