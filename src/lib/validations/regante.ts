import { z } from "zod";

export const reganteSchema = z
  .object({
    tipoDocumento: z.enum(["DNI", "RUC"]),
    numeroDocumento: z.string().min(1, "El número de documento es obligatorio"),
    nombres: z.string().min(2, "Los nombres son obligatorios"),
    apellidos: z.string().min(2, "Los apellidos son obligatorios"),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoDocumento === "DNI" && !/^\d{8}$/.test(data.numeroDocumento)) {
      ctx.addIssue({
        code: "custom",
        path: ["numeroDocumento"],
        message: "El DNI debe tener 8 dígitos",
      });
    }
    if (data.tipoDocumento === "RUC" && !/^\d{11}$/.test(data.numeroDocumento)) {
      ctx.addIssue({
        code: "custom",
        path: ["numeroDocumento"],
        message: "El RUC debe tener 11 dígitos",
      });
    }
  });

export type ReganteInput = z.infer<typeof reganteSchema>;
