# Jurnasca — Fase A: Base ampliada (perfiles, comisiones/comités, módulos completados)

## Contexto

Primera de cinco fases para llevar Jurnasca v1 al alcance del MVP comercial propuesto al cliente (S/ 10,000, 8-10 semanas, 7 módulos). El v1 ya implementado y revisado cubre parcialmente 3 módulos (junta/autoridades, canales/tomas, padrón). Esta fase amplía la base sobre la que dependen todas las demás:

- **Fase A (esta):** sub-perfiles de staff + comisiones/comités + completar módulos existentes.
- Fase B: importación Excel + búsqueda/filtros en padrón.
- Fase C: trámites administrativos + gestión documental.
- Fase D: pagos y estados de cuenta.
- Fase E: reportes + exportación Excel/PDF.

Decisiones del usuario (2026-07-22): matriz de permisos propuesta aprobada; pertenencia de regante a comisión **deducida** vía parcela → toma → canal → comisión (sin asignación manual).

## 1. Perfiles y permisos

### Modelo

- `StaffUser.perfil`: enum `PerfilStaff { ADMINISTRACION, TESORERIA, TECNICO }`, requerido, default `ADMINISTRACION` en la migración (el usuario `admin` sembrado queda como ADMINISTRACION).

### Matriz de permisos (mutaciones)

| Acción | ADMINISTRACION | TESORERIA | TECNICO |
|---|---|---|---|
| Junta, períodos, autoridades, comisiones, comités | ✔ | — | — |
| Usuarios staff (crear/desactivar/perfil/reset clave) | ✔ | — | — |
| Padrón: regantes, parcelas, cultivos (crear/editar/eliminar) | ✔ | — | — |
| Canales, tomas, compuertas (crear/editar/eliminar) | ✔ | — | ✔ |
| Mantenimiento/incidencias (registrar/resolver) | ✔ | — | ✔ |
| Pagos (Fase D — se declara ahora, se implementa después) | ✔ | ✔ | — |

**Lecturas:** todo perfil staff ve todas las páginas `/staff/*`. Los regantes siguen igual (solo su portal).

### Guard

- Nuevo `requirePerfil(...perfiles: PerfilStaff[])` en `src/lib/require-staff.ts` (o archivo hermano): reutiliza la sesión, verifica `role === "STAFF"` y que el perfil del usuario esté en la lista. Devuelve el mismo shape `{ ok } | { ok: false, error }`.
- El `perfil` se agrega al JWT/session (augmentación de tipos y callbacks de NextAuth) para no consultar la BD en cada chequeo.
- Cada server action mutadora reemplaza `requireStaff()` por `requirePerfil(...)` según la matriz. `requireStaff()` se mantiene para casos "cualquier staff".

### UI

- Nueva página `/staff/usuarios` (solo ADMINISTRACION; las acciones la protegen server-side y el link de navegación se oculta para otros perfiles):
  - Listar usuarios staff (nombre, username, perfil, activo).
  - Crear usuario (nombre, username, contraseña inicial, perfil).
  - Activar/desactivar usuario.
  - Cambiar perfil.
  - Resetear contraseña (se ingresa una nueva; se guarda hasheada).
- Un ADMINISTRACION no puede desactivarse a sí mismo (evita quedarse sin acceso).

## 2. Comisiones y comités

### Modelo

```
Comision: id, nombre, subsector, createdAt, updatedAt
Comite:   id, comisionId (FK → Comision, onDelete: Restrict),
          nombre, tipo (TipoComite { CANAL, POZO, MANANTIAL }), createdAt, updatedAt
Canal.comisionId: FK opcional → Comision (onDelete: Restrict)
```

- `Canal.comisionId` es **opcional** para no romper los canales existentes; la UI incentiva asignarla (select en el form de canal, badge "sin comisión" en la lista).
- Pertenencia del regante: derivada en consulta (parcelas → toma → canal → comisión), mostrada en la ficha del regante y en el padrón. No se persiste.
- Eliminar comisión bloqueado si tiene comités o canales (Restrict + mensaje claro).

### UI

- `/staff/junta` se reorganiza en secciones: datos institucionales + períodos/autoridades (existente), **Comisiones** (CRUD) y dentro de cada comisión sus **Comités** (CRUD) — mismo patrón nested que canales→tomas.

## 3. Completar módulos existentes

### Padrón de regantes

- `Regante.tipoDocumento`: enum `TipoDocumento { DNI, RUC }`, default DNI. Validación Zod: DNI = 8 dígitos, RUC = 11 dígitos. El campo `dni` se renombra a `numeroDocumento` (migración con `@map`/rename seguro; sigue `@unique`). **Impacto en login:** `autenticarRegante` y la página de login pasan a usar `numeroDocumento`; la etiqueta del campo cambia a "DNI o RUC". Los tests de auth se actualizan en la misma tarea.
- Editar datos del regante (todos los campos salvo el código de padrón, que solo se regenera explícitamente con botón "Generar nuevo código" — muestra el nuevo código una vez, igual que al crear).
- Editar/eliminar parcelas y cultivos (eliminar parcela con confirmación; cascada de cultivos ya está en el schema).
- Eliminar regante con confirmación tipada del nombre (cascada de parcelas/cultivos ya definida).

### Canales, tomas y compuertas

- `estadoConservacion`: enum `EstadoConservacion { BUENO, REGULAR, MALO }` en `Canal`, `TomaDeAgua` y `Compuerta` (default BUENO).
- Editar/eliminar canal y toma. Eliminar toma con parcelas → bloqueado por `Restrict`, mensaje "No se puede eliminar: hay parcelas asociadas". Eliminar canal con tomas → ídem.
- Nuevo modelo `Compuerta`: `id, canalId (FK → Canal, onDelete: Cascade), nombre, ubicacion?, caracteristicas?, estadoConservacion, createdAt, updatedAt`. CRUD dentro de la ficha del canal en `/staff/canales`.

### Mantenimiento e incidencias

- Nuevo modelo `RegistroMantenimiento`:
  ```
  id, tipo (TipoRegistro { MANTENIMIENTO, INCIDENCIA }),
  fecha (DateTime), descripcion (String), estado (EstadoRegistro { PENDIENTE, RESUELTO }),
  canalId? | tomaDeAguaId? | compuertaId?   ← exactamente uno, validado en Zod (no constraint DB)
  createdAt, updatedAt
  ```
- Registrar (TÉCNICO y ADMINISTRACION), marcar como resuelto, historial listado en la ficha del canal (incluye los de sus tomas y compuertas, agrupados).

## Fuera de alcance de Fase A

- Importación Excel, búsqueda/filtros (Fase B).
- Trámites, documentos, pagos, reportes (Fases C-E).
- Registro periódico de caudales con historial (el caudal sigue estático; la propuesta dice "registro básico" — el campo editable existente lo cubre).
- Notificaciones, mapas, georreferenciación.

## Errores, tests y convenciones

- Mismos patrones establecidos: `ActionResult<T>`, `mapPrismaError`, `revalidatePath` tras cada mutación, split mutaciones (`"use server"` + guard) / queries (sin directiva).
- Tests Vitest: cada acción nueva con test de guard (perfil incorrecto → "No autorizado.", sin llamada a Prisma) + validación Zod + caso de éxito. `requirePerfil` con tests propios.
- Migración Prisma única para toda la fase (`fase_a`), aplicada a la BD Neon existente sin pérdida de datos.
