import { z } from "zod";

export const registroSchema = z
  .object({
    tipo: z.enum(["MANTENIMIENTO", "INCIDENCIA"]),
    fecha: z.string().min(1, "La fecha es obligatoria"),
    descripcion: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
    canalId: z.string().optional(),
    tomaDeAguaId: z.string().optional(),
    compuertaId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const targets = [data.canalId, data.tomaDeAguaId, data.compuertaId].filter(Boolean);
    if (targets.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["canalId"],
        message: "Debe seleccionar exactamente un canal, toma o compuerta",
      });
    }
  });

export type RegistroInput = z.infer<typeof registroSchema>;
