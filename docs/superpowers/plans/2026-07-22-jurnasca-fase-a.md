# Jurnasca Fase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Jurnasca v1 with staff sub-profiles (ADMINISTRACION/TESORERIA/TECNICO), comisiones/comités, and completion of the existing modules (edit/delete everywhere, DNI/RUC, compuertas, estado de conservación, mantenimiento/incidencias).

**Architecture:** Same stack and conventions as v1 (see `docs/superpowers/specs/2026-07-22-jurnasca-fase-a-design.md` for the approved spec and `docs/superpowers/plans/2026-07-22-jurnasca-v1.md` for established conventions). All new mutations live in the existing `"use server"` action files (or new ones following the same split), each guarded by the new `requirePerfil(...)`; reads live in `*-queries.ts` files with no directive.

**Tech Stack:** unchanged — Next.js 16.2.11 (Turbopack), TypeScript, Tailwind v4, Prisma 6.19.3 + Neon, NextAuth 4.24.x, Zod, bcryptjs, Vitest.

## Global Constraints

- Two top-level roles stay: `STAFF` / `REGANTE`. Sub-profiles apply only within STAFF: enum `PerfilStaff { ADMINISTRACION, TESORERIA, TECNICO }`.
- Permission matrix (mutations): junta/períodos/autoridades/comisiones/comités/usuarios-staff/padrón → ADMINISTRACION only. Canales/tomas/compuertas/mantenimiento → ADMINISTRACION + TECNICO. All staff profiles can READ every `/staff/*` page.
- Regante→comisión membership is DERIVED (parcela → toma → canal → comisión), never persisted.
- `Regante.dni` renames to `numeroDocumento` with new `tipoDocumento` enum (`DNI` 8 digits, `RUC` 11 digits). Login label becomes "DNI o RUC".
- Every mutation: per-function pattern from v1 — guard first, Zod validation, Prisma in try/catch with `mapPrismaError`, `revalidatePath` after success, return `ActionResult<T>`.
- Every new mutation gets: a guard test (wrong perfil → `"No autorizado."`, no Prisma call), a validation test, a success test. Mock pattern: copy `src/actions/canales.test.ts`.
- Caudal stays a static field. No Excel import, trámites, documents, payments, or reports in this fase.
- One Prisma migration for the whole fase, named `fase_a`, applied to the live Neon DB (has real-ish test data; migration must not lose rows).
- Process hygiene (hard-learned in v1): check port 3000 free before `npm run dev`, kill your server and re-check after; manual verification must be real browser interactions, escalate DONE_WITH_CONCERNS instead of substituting weaker checks.

**Pattern references (read these files instead of inventing):** action+guard+revalidate pattern `src/actions/canales.ts`; queries pattern `src/actions/canales-queries.ts`; test/mock pattern `src/actions/canales.test.ts`; client form pattern `src/app/staff/canales/nuevo-canal-form.tsx`; inline page action pattern `src/app/staff/junta/page.tsx`; nested CRUD UI pattern `src/app/staff/canales/page.tsx`.

---

## Task 1: Schema Fase A + Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_fase_a/migration.sql` (generated)
- Modify: `prisma/seed.ts` (add `perfil: "ADMINISTRACION"` to the admin upsert's `create`)

**Interfaces:**
- Produces: enums `PerfilStaff`, `TipoDocumento`, `TipoComite`, `EstadoConservacion`, `TipoRegistro`, `EstadoRegistro`; models `Comision`, `Comite`, `Compuerta`, `RegistroMantenimiento`; fields `StaffUser.perfil`, `Regante.tipoDocumento`, `Regante.numeroDocumento` (renamed from `dni`), `Canal.comisionId`, `Canal.estadoConservacion`, `TomaDeAgua.estadoConservacion`. Every later task depends on these exact names.

- [ ] **Step 1: Edit the schema.** Add to `prisma/schema.prisma`:

```prisma
enum PerfilStaff {
  ADMINISTRACION
  TESORERIA
  TECNICO
}

enum TipoDocumento {
  DNI
  RUC
}

enum TipoComite {
  CANAL
  POZO
  MANANTIAL
}

enum EstadoConservacion {
  BUENO
  REGULAR
  MALO
}

enum TipoRegistro {
  MANTENIMIENTO
  INCIDENCIA
}

enum EstadoRegistro {
  PENDIENTE
  RESUELTO
}

model Comision {
  id        String   @id @default(cuid())
  nombre    String
  subsector String
  comites   Comite[]
  canales   Canal[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Comite {
  id         String     @id @default(cuid())
  comisionId String
  comision   Comision   @relation(fields: [comisionId], references: [id], onDelete: Restrict)
  nombre     String
  tipo       TipoComite
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model Compuerta {
  id                 String               @id @default(cuid())
  canalId            String
  canal              Canal                @relation(fields: [canalId], references: [id], onDelete: Cascade)
  nombre             String
  ubicacion          String?
  caracteristicas    String?
  estadoConservacion EstadoConservacion   @default(BUENO)
  registros          RegistroMantenimiento[]
  createdAt          DateTime             @default(now())
  updatedAt          DateTime             @updatedAt
}

model RegistroMantenimiento {
  id           String         @id @default(cuid())
  tipo         TipoRegistro
  fecha        DateTime
  descripcion  String
  estado       EstadoRegistro @default(PENDIENTE)
  canalId      String?
  canal        Canal?         @relation(fields: [canalId], references: [id], onDelete: Cascade)
  tomaDeAguaId String?
  tomaDeAgua   TomaDeAgua?    @relation(fields: [tomaDeAguaId], references: [id], onDelete: Cascade)
  compuertaId  String?
  compuerta    Compuerta?     @relation(fields: [compuertaId], references: [id], onDelete: Cascade)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}
```

Modify existing models:
- `StaffUser`: add `perfil PerfilStaff @default(ADMINISTRACION)`.
- `Regante`: rename field `dni` → `numeroDocumento` (keep `@unique`) and add `tipoDocumento TipoDocumento @default(DNI)`.
- `Canal`: add `comisionId String?`, `comision Comision? @relation(fields: [comisionId], references: [id], onDelete: Restrict)`, `estadoConservacion EstadoConservacion @default(BUENO)`, `compuertas Compuerta[]`, `registros RegistroMantenimiento[]`.
- `TomaDeAgua`: add `estadoConservacion EstadoConservacion @default(BUENO)`, `registros RegistroMantenimiento[]`.

- [ ] **Step 2:** `npx prisma validate` → valid.
- [ ] **Step 3:** `npx prisma migrate dev --name fase_a`. **CRITICAL — the `dni` rename:** Prisma will generate DROP+ADD (data loss) unless the migration SQL is edited. Use `npx prisma migrate dev --name fase_a --create-only` first, open the generated SQL, and replace the drop/add pair for that column with `ALTER TABLE "Regante" RENAME COLUMN "dni" TO "numeroDocumento";` (keeping the unique index rename consistent), then `npx prisma migrate dev` to apply. Verify no data loss: after applying, run a quick row-count/select on `Regante` (e.g. via `npx prisma db execute` or a throwaway script, deleted afterwards) confirming existing rows retain their document numbers.
- [ ] **Step 4:** Update `prisma/seed.ts`: add `perfil: "ADMINISTRACION"` to the `create` block. Run `npx prisma db seed` (idempotent upsert; must not error).
- [ ] **Step 5:** Note: `npx vitest run` will now FAIL (existing code/tests reference `dni`). That is expected and gets fixed in Task 3 — do NOT fix application code in this task. Run `npx prisma generate` and commit schema + migration + seed only.
- [ ] **Step 6: Commit** `feat: fase A schema (perfiles, comisiones, compuertas, mantenimiento, DNI/RUC)`.

---

## Task 2: perfil in Session + requirePerfil Guard

**Files:**
- Modify: `src/lib/auth-credentials.ts` (+ its test), `src/lib/auth.ts`, `src/types/next-auth.d.ts`
- Modify: `src/lib/require-staff.ts`
- Test: `src/lib/require-staff.test.ts` (new)

**Interfaces:**
- Produces: `AuthUser` gains `perfil?: PerfilStaff` (staff only); `session.user.perfil?: "ADMINISTRACION" | "TESORERIA" | "TECNICO"`; `requirePerfil(...perfiles: PerfilStaff[]): Promise<{ ok: true } | { ok: false; error: string }>`. Consumed by every mutation from Task 3 on.

- [ ] **Step 1:** `src/lib/auth-credentials.ts`: extend `AuthUser` type with `perfil?: "ADMINISTRACION" | "TESORERIA" | "TECNICO"`; `autenticarStaff` returns `perfil: staffUser.perfil`; `autenticarRegante` unchanged (no perfil). Update its test file mocks (StaffUser mock rows now include `perfil: "ADMINISTRACION"`) and assert the returned perfil.
- [ ] **Step 2:** `src/types/next-auth.d.ts`: add `perfil?: "ADMINISTRACION" | "TESORERIA" | "TECNICO"` to `Session.user`, `User`, and `JWT`.
- [ ] **Step 3:** `src/lib/auth.ts` callbacks: in `jwt`, copy `user.perfil` to `token.perfil` when present; in `session`, copy `token.perfil` to `session.user.perfil`.
- [ ] **Step 4 (TDD):** write `src/lib/require-staff.test.ts` FIRST, mocking `next-auth`'s `getServerSession` (see `src/actions/canales.test.ts` for the vi.mock pattern). Cases: (a) `requirePerfil("ADMINISTRACION")` with an ADMINISTRACION session → ok; (b) with a TECNICO session → `{ ok: false, error: "No autorizado." }`; (c) with a REGANTE session → not ok; (d) with no session → not ok; (e) `requirePerfil("ADMINISTRACION", "TECNICO")` with TECNICO → ok; (f) existing `requireStaff` still ok for any STAFF and rejects REGANTE. RED → implement in `src/lib/require-staff.ts`:

```ts
import type { PerfilStaff } from "@prisma/client";
// requireStaff stays as-is. Add:
export async function requirePerfil(
  ...perfiles: PerfilStaff[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STAFF") return { ok: false, error: "No autorizado." };
  if (!session.user.perfil || !perfiles.includes(session.user.perfil as PerfilStaff)) {
    return { ok: false, error: "No autorizado." };
  }
  return { ok: true };
}
```

GREEN → commit `feat: perfil in session + requirePerfil guard`.

---

## Task 3: Apply Rename + Matrix to Existing Code

**Files:**
- Modify: `src/actions/regantes.ts`, `src/actions/regantes-queries.ts`, `src/actions/regantes.test.ts`, `src/lib/validations/regante.ts` (+ test), `src/lib/auth-credentials.ts` (`autenticarRegante` where clause), `src/lib/auth-credentials.test.ts`, `src/app/login/page.tsx` (label "DNI" → "DNI o RUC"), `src/app/staff/regantes/page.tsx`, `src/app/staff/regantes/[id]/page.tsx`, `src/app/staff/regantes/nueva-regante-form.tsx`, `src/app/regante/mi-padron/page.tsx`
- Modify: `src/actions/canales.ts`, `src/actions/parcelas.ts`, `src/actions/junta.ts` (+ their tests)

**Interfaces:**
- Produces: `reganteSchema` with `{ tipoDocumento: "DNI"|"RUC", numeroDocumento, nombres, apellidos, telefono?, direccion? }` — `numeroDocumento` validated conditionally (`superRefine`: 8 digits if DNI, 11 if RUC); all `dni` references replaced by `numeroDocumento` project-wide; guard swap: regantes+junta mutations → `requirePerfil("ADMINISTRACION")`; canales+parcelas mutations → `requirePerfil("ADMINISTRACION", "TECNICO")` for canal/toma, `requirePerfil("ADMINISTRACION")` for parcela/cultivo (padrón data).

- [ ] **Step 1:** Grep for `dni` across `src/` and update every reference to `numeroDocumento` (schema field), plus add `tipoDocumento` handling: form select DNI/RUC in `nueva-regante-form.tsx`; Zod `superRefine` validation; login page label "DNI o RUC"; `autenticarRegante(numeroDocumento, clave)` querying `where: { numeroDocumento }`. NOTE: `Autoridad.dni` stays `dni` — only `Regante` renamed; do not touch junta/autoridad forms.
- [ ] **Step 2:** Swap guards per the matrix: in `regantes.ts`, `parcelas.ts`, `junta.ts` mutations replace `requireStaff()` with `requirePerfil("ADMINISTRACION")`; in `canales.ts` with `requirePerfil("ADMINISTRACION", "TECNICO")`. Update each test file: mock `requirePerfil` instead of/alongside `requireStaff` (default ok), and adjust auth-failure tests to mock `requirePerfil` not-ok.
- [ ] **Step 3:** Update validation tests for the new schema (valid DNI 8, valid RUC 11, invalid RUC 8 digits → fail).
- [ ] **Step 4:** `npx vitest run` → ALL tests green again (this task ends the intentional red state from Task 1). `npm run build` → clean.
- [ ] **Step 5:** Commit `refactor: numeroDocumento rename + perfil-based guards across existing modules`.

---

## Task 4: Usuarios Staff Module

**Files:**
- Create: `src/lib/validations/staff-user.ts` (+ test), `src/actions/usuarios.ts` (+ test), `src/actions/usuarios-queries.ts`
- Create: `src/app/staff/usuarios/page.tsx`, `src/app/staff/usuarios/nuevo-usuario-form.tsx`
- Modify: `src/app/staff/layout.tsx` (add "Usuarios" nav link)

**Interfaces:**
- Produces: `crearStaffUser(formData)`, `cambiarPerfil(id, perfil)`, `setActivo(id, activo)`, `resetearClave(id, formData)` — all `requirePerfil("ADMINISTRACION")`, all `ActionResult`; `listarStaffUsers()` query (returns rows WITHOUT `passwordHash` — use Prisma `select`).

- [ ] **Step 1 (TDD):** `staffUserSchema`: `{ nombre: min 2, username: min 3 regex /^[a-z0-9._-]+$/, password: min 8, perfil: enum }`. Tests: valid, short password, invalid username chars.
- [ ] **Step 2 (TDD):** actions following `src/actions/canales.ts` pattern exactly (guard `requirePerfil("ADMINISTRACION")`, Zod, `hash()` from `src/lib/crypto` for passwords, `mapPrismaError` for duplicate username P2002, `revalidatePath("/staff/usuarios")`). `setActivo`: before updating, load the session (`getServerSession`) and if `session.user.id === id && activo === false` return `{ success: false, error: "No puedes desactivarte a ti mismo." }` — test this case explicitly. `resetearClave`: takes new password from formData, validates min 8, stores hashed.
- [ ] **Step 3:** `usuarios-queries.ts`: `listarStaffUsers()` with `select: { id, nombre, username, perfil, activo, createdAt }` (never `passwordHash`).
- [ ] **Step 4:** UI page: table (nombre, username, perfil, activo) + `nuevo-usuario-form.tsx` client form + inline per-row forms (perfil select submit, activar/desactivar button, reset clave input+button) using the inline server-action pattern from `src/app/staff/junta/page.tsx` — these inline handlers surface returned errors via redirect-free re-render only if trivially possible; otherwise match the junta page convention (fire-and-refresh). Nav: in `src/app/staff/layout.tsx` add "Usuarios" link; render it only when `session.user.perfil === "ADMINISTRACION"` (layout already has session access or add `getServerSession` there; hiding is cosmetic — real protection is the guard).
- [ ] **Step 5:** Manual verify: create TESORERIA user, log in with it in another browser/incognito, confirm "Usuarios" hidden and creating a canal fails with "No autorizado." while page reads still work. Confirm self-deactivation blocked for admin.
- [ ] **Step 6:** `npx vitest run` + build → green. Commit `feat: staff user management with perfiles`.

---

## Task 5: Comisiones y Comités

**Files:**
- Create: `src/lib/validations/comision.ts`, `src/lib/validations/comite.ts` (+ tests), `src/actions/comisiones.ts` (+ test), `src/actions/comisiones-queries.ts`
- Modify: `src/app/staff/junta/page.tsx` (add Comisiones section with nested Comités), `src/app/staff/canales/nuevo-canal-form.tsx` + `src/app/staff/canales/page.tsx` (comisión select + badge), `src/actions/canales.ts` (accept optional `comisionId`), `src/lib/validations/canal.ts` (+ test)

**Interfaces:**
- Produces: `crearComision`, `actualizarComision`, `eliminarComision`, `crearComite`, `eliminarComite` (all `requirePerfil("ADMINISTRACION")`); `listarComisiones()` query returning comisiones with `comites` and `canales` included. `canalSchema` gains optional `comisionId`.

- [ ] **Step 1 (TDD):** schemas: comision `{ nombre min 2, subsector min 2 }`; comite `{ comisionId min 1, nombre min 2, tipo enum CANAL|POZO|MANANTIAL }`. Actions per the established pattern; `eliminarComision` relies on Prisma `Restrict` → P2003 mapped by `mapPrismaError` (test that path with mocked rejection). `revalidatePath("/staff/junta")` (+ `/staff/canales` for canal-affecting changes).
- [ ] **Step 2:** Canal integration: `canalSchema` adds `comisionId: z.string().optional()`; `crearCanal` (and Task 7's `actualizarCanal`) pass it through; canal form gets a `<select>` of comisiones (page passes `listarComisiones()` data); canal list shows comisión name or "sin comisión" badge.
- [ ] **Step 3:** Junta page: "Comisiones" section — create form, list each comisión with its subsector, nested comités list + add-comité inline form + delete buttons (confirmation via the inline-action pattern).
- [ ] **Step 4:** Manual verify: create comisión → comité → assign existing canal to comisión → canal list shows badge; delete comisión with canal → clear error message.
- [ ] **Step 5:** Suite + build green. Commit `feat: comisiones y comites`.

---

## Task 6: Regante Edit/Delete + Regenerar Código + Derived Comisión

**Files:**
- Modify: `src/actions/regantes.ts` (+ test), `src/actions/regantes-queries.ts`, `src/actions/parcelas.ts` (+ test)
- Create: `src/app/staff/regantes/[id]/editar-regante-form.tsx`
- Modify: `src/app/staff/regantes/[id]/page.tsx`, `src/app/staff/regantes/page.tsx`

**Interfaces:**
- Produces: `actualizarRegante(id, formData)`, `eliminarRegante(id)`, `regenerarCodigoPadron(id)` → `ActionResult<{ codigoPadronPlano: string }>`, `actualizarParcela(id, formData)`, `eliminarParcela(id)`, `eliminarCultivo(id)` — all `requirePerfil("ADMINISTRACION")`. `obtenerRegante` query result now also carries derived comisiones: include `parcelas.tomaDeAgua.canal.comision` and compute unique comisión names in the page.

- [ ] **Step 1 (TDD):** `actualizarRegante` reuses `reganteSchema` (no código change); `regenerarCodigoPadron` calls `generarCodigoPadron()` + `hash()` and returns the plaintext once (test: stored value ≠ returned plaintext — mirror the Task 10 v1 security test); `eliminarRegante`/`eliminarParcela`/`eliminarCultivo` straightforward deletes with revalidate. Parcela edit reuses `parcelaSchema`.
- [ ] **Step 2:** UI: detail page gets "Editar datos" (prefilled client form), "Generar nuevo código" button showing the one-time código in the green box pattern, "Eliminar regante" button with `confirm()`-style two-step (button → must type nombre → submit), per-parcela Edit/Delete and per-cultivo Delete controls. Detail page and padrón list show derived comisión name(s) (via the deepened include).
- [ ] **Step 3:** Manual verify all flows live (edit shows updated data without reload; regenerated código logs in as regante; delete cascades visible).
- [ ] **Step 4:** Suite + build green. Commit `feat: regante edit/delete, regenerar codigo, comision derivada`.

---

## Task 7: Canales/Tomas Edit/Delete + estadoConservacion + Compuertas

**Files:**
- Create: `src/lib/validations/compuerta.ts` (+ test)
- Modify: `src/lib/validations/canal.ts`, `src/lib/validations/toma-de-agua.ts` (+ tests: add `estadoConservacion` enum optional-with-default), `src/actions/canales.ts` (+ test), `src/actions/canales-queries.ts` (include compuertas), `src/app/staff/canales/page.tsx` + forms
- Create: `src/app/staff/canales/editar-canal-form.tsx` (or inline edit pattern — implementer's choice matching existing style)

**Interfaces:**
- Produces: `actualizarCanal(id, formData)`, `eliminarCanal(id)`, `actualizarTomaDeAgua(id, formData)`, `eliminarTomaDeAgua(id)`, `crearCompuerta(formData)`, `actualizarCompuerta(id, formData)`, `eliminarCompuerta(id)` — all `requirePerfil("ADMINISTRACION", "TECNICO")`. `compuertaSchema`: `{ canalId min 1, nombre min 2, ubicacion?, caracteristicas?, estadoConservacion enum default BUENO }`.

- [ ] **Step 1 (TDD):** validations + actions per pattern. `eliminarCanal`/`eliminarTomaDeAgua` rely on `Restrict` → P2003 mapped ("La referencia seleccionada no existe." is the existing P2003 text — ADD a new mapping: for delete-blocked cases Prisma raises P2003 too; extend `mapPrismaError` ONLY IF the existing message is misleading, otherwise keep and let UI copy suffice; decide and note in report).
- [ ] **Step 2:** UI: canal cards gain estado badge, Edit, Delete; tomas rows gain estado, Edit, Delete; new Compuertas subsection per canal (add form + list + edit/delete), mirroring the tomas nested pattern.
- [ ] **Step 3:** Manual verify: edit canal estado → badge updates sin reload; delete toma with parcela → clear error; compuerta CRUD live.
- [ ] **Step 4:** Suite + build green. Commit `feat: canales/tomas edit-delete, estado conservacion, compuertas`.

---

## Task 8: Mantenimiento e Incidencias

**Files:**
- Create: `src/lib/validations/registro-mantenimiento.ts` (+ test), `src/actions/mantenimiento.ts` (+ test), `src/actions/mantenimiento-queries.ts`
- Modify: `src/app/staff/canales/page.tsx` (historial section per canal)
- Create: `src/app/staff/canales/nuevo-registro-form.tsx`

**Interfaces:**
- Produces: `crearRegistro(formData)` (`requirePerfil("ADMINISTRACION", "TECNICO")`), `resolverRegistro(id)` (same guard); `listarRegistrosPorCanal(canalId)` query returning the canal's registros plus those of its tomas and compuertas, newest first. `registroSchema`: `{ tipo enum, fecha date string min 1, descripcion min 5, canalId? , tomaDeAguaId?, compuertaId? }` + `superRefine` enforcing EXACTLY ONE of the three target ids.

- [ ] **Step 1 (TDD):** schema tests: valid canal-target, valid toma-target, zero targets → fail, two targets → fail. Actions per pattern; `resolverRegistro` sets `estado: "RESUELTO"`; revalidate `/staff/canales`.
- [ ] **Step 2:** UI: per-canal "Mantenimiento e incidencias" section — form (tipo select, fecha, descripción, target select built from canal+tomas+compuertas) + grouped history list with PENDIENTE/RESUELTO badge and "Marcar resuelto" button.
- [ ] **Step 3:** Manual verify: register incidencia on a toma → appears in canal history sin reload; resolve → badge flips.
- [ ] **Step 4:** Suite + build green. Commit `feat: mantenimiento e incidencias`.

---

## Task 9: Fase A Integration Pass

**Files:** none new (fixes only if found)

- [ ] **Step 1:** `npx vitest run` (full) + `npm run build` → both clean; record counts.
- [ ] **Step 2:** Live end-to-end sweep as ADMINISTRACION: create TECNICO + TESORERIA users; as TECNICO confirm canal/compuerta/mantenimiento editable but padrón/junta mutations rejected; as TESORERIA confirm read-only everywhere (until Fase D). Regante login still works with numeroDocumento label.
- [ ] **Step 3:** Clean any test data created during verification from the live DB (keep seed admin).
- [ ] **Step 4:** Update `docs/superpowers/specs/2026-07-22-jurnasca-fase-a-design.md` checkboxes/status if drift occurred; commit `chore: fase A integration pass`.

## Self-Review Notes

- Spec coverage: perfiles+guard → Tasks 1-4; comisiones/comités+derivada → Tasks 1, 5, 6; DNI/RUC+login → Tasks 1, 3; edit/delete padrón → Task 6; edit/delete canales+estado+compuertas → Task 7; mantenimiento → Task 8; matriz declarada para pagos queda en `requirePerfil` listo para Fase D.
- Ordering: Task 1 breaks the suite intentionally (rename); Task 3 restores green — Tasks 1→2→3 must run strictly in order; 4-8 depend on 1-3 but are mutually independent; 9 last.
- Repo-file pattern references are to committed v1 code (readable by any implementer), not to other plan tasks.
