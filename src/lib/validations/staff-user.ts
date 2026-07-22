import { z } from "zod";

export const staffUserSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9._-]+$/, "Solo minúsculas, números, punto, guion y guion bajo"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  perfil: z.enum(["ADMINISTRACION", "TESORERIA", "TECNICO"]),
});

export type StaffUserInput = z.infer<typeof staffUserSchema>;
