import { z } from "zod";

export const autoridadSchema = z.object({
  periodoId: z.string().min(1, "El período es obligatorio"),
  cargo: z.enum(["PRESIDENTE", "VICEPRESIDENTE", "SECRETARIO", "TESORERO", "GERENTE", "VOCAL"]),
  nombre: z.string().min(2, "El nombre es obligatorio"),
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  telefono: z.string().optional(),
});

export type AutoridadInput = z.infer<typeof autoridadSchema>;
