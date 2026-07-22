# Jurnasca — Diseño v1: Administración de Juntas, Tomas de Agua y Padrón de Regantes

## Contexto

Sistema de gestión para la **Junta de Usuarios del Sector Hidráulico Menor Nasca – Clase B** (RUC 20167010416), organización de usuarios de agua de riego de Nasca regida por la Ley Nº 31801 y su Reglamento (D.S. Nº 007-2024-MIDAGRI). Contexto legal completo en `segundo-cerebro/proyectos/jurnasca/CLAUDE.md`.

Alcance de esta v1, confirmado con el usuario:
- Un solo tenant: la Junta de Nasca (no multi-organización).
- Dos roles de usuario: **Staff** (personal de la Junta, acceso completo) y **Regante** (consulta de su propia información).
- Sin cobro/registro de pagos de tarifa de agua en esta versión.
- Caudal de tomas de agua como dato estático (no historial de mediciones).
- Historial de períodos del consejo directivo (no solo el actual).

## Arquitectura

```
Next.js (App Router, TypeScript)
├── /app/(staff)/...      → panel administrativo (staff de la Junta)
├── /app/(regante)/...    → portal de consulta (regantes)
├── /app/api/auth/...     → NextAuth (Credentials)
└── /lib/                 → Prisma client, validaciones (Zod), helpers de rol

Prisma ORM → Neon (Postgres serverless)
Vercel → hosting + despliegue
```

Una sola app Next.js con dos grupos de rutas protegidas por rol (`staff` y `regante`) en vez de dos apps separadas: comparten componentes de UI y el mismo backend; el middleware de Next.js bloquea el acceso cruzado según el rol de la sesión.

**Stack:** Next.js + TypeScript + Tailwind CSS, Prisma como ORM, Neon (Postgres serverless) como base de datos, NextAuth con `CredentialsProvider` para autenticación, despliegue en Vercel. Elegido sobre Supabase Auth porque el login de regante (DNI + código de padrón) no es un flujo estándar de email/OTP/OAuth — NextAuth con Credentials da control total sobre esa validación sin rodeos. Neon+Prisma es el mismo stack ya usado en Ica Smart Travel (perfil del usuario).

## Modelo de datos

```
Junta (1 sola fila)
  razonSocial, ruc, domicilioFiscal, marcoLegal

StaffUser                          PeriodoDirectivo
  nombre, username,                  fechaInicio, fechaFin, estado
  passwordHash, cargoInterno            │
  (cargoInterno es solo informativo/
  de display, no afecta permisos)
                                     Autoridad (N por período)
                                       cargo (presidente/tesorero/
                                       secretario/gerente/vocal),
                                       nombre, dni, telefono

Canal                              Regante (padrón)
  nombre, subsector                  dni, codigoPadronHash (login),
   │                                 nombres, telefono, estadoHabil
  TomaDeAgua (N por canal)              │
   nombre, caudalLps, ubicacion,     Parcela (N por regante)
   estado                              areaHectareas, ubicacion,
   │                                   → tomaDeAguaId (FK)
   └───────────────────────────────────┘   │
                                        Cultivo (N por parcela)
                                          tipoCultivo, campaña
```

- **Administración de Juntas** → `Junta`, `PeriodoDirectivo`, `Autoridad` — historial de consejo directivo por período (presidente, vicepresidente, secretario, tesorero, gerente, vocales).
- **Tomas de Agua y Canales** → `Canal` y `TomaDeAgua` — caudal (`caudalLps`) como dato estático, actualizable manualmente.
- **Padrón de Regantes** → `Regante`, `Parcela`, `Cultivo` — un regante puede tener varias parcelas; cada parcela recibe agua de una toma específica y tiene su historial de cultivos por campaña (ej. "2026-I").

El login de regante usa directamente `Regante.dni` + `Regante.codigoPadronHash` (no hay tabla de usuarios separada para regantes). El staff usa `StaffUser` con usuario/contraseña.

## Roles y autenticación

- **Login único** con selector de tipo (Staff / Regante):
  - **Staff:** usuario + contraseña → valida contra `StaffUser.passwordHash` (bcrypt).
  - **Regante:** DNI + código de padrón → valida contra `Regante.dni` + `Regante.codigoPadronHash` (bcrypt) — el código se guarda hasheado aunque no sea una "contraseña" tradicional, porque es el único candado de acceso del regante.
- **Sesión (NextAuth JWT en cookie):** guarda `role` (`STAFF` | `REGANTE`) y el id correspondiente (`staffUserId` o `reganteId`).
- **Middleware de Next.js:** intercepta rutas bajo `/staff/*` y `/regante/*`; si el rol de la sesión no coincide, redirige a `/login`.
- **Permisos dentro de Staff:** en v1, todo `StaffUser` activo tiene acceso completo al panel — sin sub-roles de solo lectura todavía.
- **Alta de regantes:** el staff crea el registro en el padrón (DNI, nombres, etc.) y asigna el código de padrón inicial ahí mismo — no hay auto-registro público.

## Módulos y páginas

**Panel Staff** (`/staff/...`)
- `/staff/junta` — datos institucionales (razón social, RUC) + gestión de períodos directivos y autoridades (alta de período nuevo, asignar cargos, cerrar período anterior)
- `/staff/canales` — CRUD de canales y sus tomas de agua (caudal, ubicación, estado)
- `/staff/regantes` — padrón: CRUD de regantes, sus parcelas y cultivos por campaña; asignación de código de padrón; marcar hábil/no hábil
- `/staff/regantes/[id]` — ficha detalle de un regante con sus parcelas y cultivos

**Portal Regante** (`/regante/...`)
- `/regante/mi-padron` — su propia info (parcelas, cultivos, toma de agua asociada, estado hábil) — solo lectura
- `/regante/autoridades` — consejo directivo/gerente actual (info pública de la Junta) — solo lectura

**Compartido**
- `/login` — selector Staff/Regante

## Manejo de errores

- **Validación de formularios:** Zod en server actions, antes de tocar la base — mensajes de error por campo.
- **Duplicados:** constraint único de Prisma (DNI o código de padrón repetido) capturado y mostrado como error de campo, no como stack trace.
- **Login fallido:** mensaje genérico ("DNI o código incorrecto" / "Usuario o contraseña incorrectos"), sin indicar cuál campo específico fue el erróneo.
- **Acceso no autorizado:** el middleware redirige a `/login` si la sesión expiró o el rol no corresponde a la ruta.
- **Errores no controlados:** página de error genérica de Next.js (`error.tsx`), sin exponer detalles internos.

## Testing

CRUD interno de alcance acotado, sin lógica de negocio compleja:
- **Unitarios (Vitest):** validaciones Zod y la poca lógica de negocio real (ej. impedir cerrar un período directivo sin fecha de fin, impedir asignar una toma de agua inexistente a una parcela).
- **Integración de auth:** login staff, login regante, y que el middleware bloquee el acceso cruzado entre roles.
- **Sin E2E automatizado en v1** — verificación manual en navegador de cada módulo antes de darlo por terminado.

## Fuera de alcance (v1)

- Cobro/registro de pagos de tarifa de agua.
- Historial de mediciones de caudal (solo dato estático).
- Multi-junta / multi-tenant.
- Reclamos de usuarios (plazo legal de 30 días hábiles) — no mencionado por el usuario como parte de esta v1.
- Proceso electoral y régimen de infracciones/sanciones (documentados legalmente pero no dentro del alcance funcional pedido).
- Sub-roles de permisos dentro de Staff.
