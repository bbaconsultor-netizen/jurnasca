# Búsqueda y Filtros en el Padrón de Regantes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add text search + estado + comisión filters to the `/staff/regantes` padrón, driven entirely by URL query params with a plain GET form (no client JS).

**Architecture:** A pure function `construirFiltroRegantes` builds a Prisma `ReganteWhereInput` from three optional filter values; `listarRegantes` accepts it as an optional parameter (backward compatible — no args behaves exactly as today); the page reads `searchParams`, calls both functions, and renders a plain `<form method="get">` above the table whose inputs preserve their current values via `defaultValue`.

**Tech Stack:** Next.js 16 (App Router, Server Components), Prisma 6.19.3, TypeScript, Vitest. No new dependencies.

## Global Constraints

- No mutations, no Zod validation needed — this is a read-only feature.
- `listarRegantes()` called with no arguments must behave exactly as it does today (any other caller must not break).
- The three filters (`q`, `estado`, `comisionId`) combine with AND when present; each is independently optional.
- An unrecognized `estado` value is treated as "no filter" (`TODOS`), not an error.
- Excel import and pagination are explicitly out of scope — do not add them.

---

## Task 1: Filter Builder Function

**Files:**
- Create: `src/lib/validations/regante-filtros.ts`
- Test: `src/lib/validations/regante-filtros.test.ts`

**Interfaces:**
- Produces: `type FiltrosRegante = { q?: string; estado?: "HABIL" | "NO_HABIL" | "TODOS"; comisionId?: string }` and `construirFiltroRegantes(filtros: FiltrosRegante): Prisma.ReganteWhereInput`, consumed by Task 2's `listarRegantes`.

- [ ] **Step 1: Write the failing tests**

`src/lib/validations/regante-filtros.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { construirFiltroRegantes } from "./regante-filtros";

describe("construirFiltroRegantes", () => {
  it("returns an empty object when no filters are given", () => {
    expect(construirFiltroRegantes({})).toEqual({});
  });

  it("returns an empty object when estado is TODOS", () => {
    expect(construirFiltroRegantes({ estado: "TODOS" })).toEqual({});
  });

  it("builds an OR clause across nombres/apellidos/numeroDocumento for q", () => {
    expect(construirFiltroRegantes({ q: "garcia" })).toEqual({
      OR: [
        { nombres: { contains: "garcia", mode: "insensitive" } },
        { apellidos: { contains: "garcia", mode: "insensitive" } },
        { numeroDocumento: { contains: "garcia", mode: "insensitive" } },
      ],
    });
  });

  it("builds estadoHabil: true for HABIL", () => {
    expect(construirFiltroRegantes({ estado: "HABIL" })).toEqual({ estadoHabil: true });
  });

  it("builds estadoHabil: false for NO_HABIL", () => {
    expect(construirFiltroRegantes({ estado: "NO_HABIL" })).toEqual({ estadoHabil: false });
  });

  it("builds a nested parcelas.some filter for comisionId", () => {
    expect(construirFiltroRegantes({ comisionId: "comision-1" })).toEqual({
      parcelas: { some: { tomaDeAgua: { canal: { comisionId: "comision-1" } } } },
    });
  });

  it("ignores an empty-string comisionId", () => {
    expect(construirFiltroRegantes({ comisionId: "" })).toEqual({});
  });

  it("ignores a blank q", () => {
    expect(construirFiltroRegantes({ q: "   " })).toEqual({});
  });

  it("combines all three filters with AND", () => {
    const result = construirFiltroRegantes({ q: "garcia", estado: "HABIL", comisionId: "comision-1" });
    expect(result).toEqual({
      AND: [
        {
          OR: [
            { nombres: { contains: "garcia", mode: "insensitive" } },
            { apellidos: { contains: "garcia", mode: "insensitive" } },
            { numeroDocumento: { contains: "garcia", mode: "insensitive" } },
          ],
        },
        { estadoHabil: true },
        { parcelas: { some: { tomaDeAgua: { canal: { comisionId: "comision-1" } } } } },
      ],
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/validations/regante-filtros.test.ts`
Expected: FAIL with "Cannot find module './regante-filtros'"

- [ ] **Step 3: Implement the filter builder**

`src/lib/validations/regante-filtros.ts`:
```ts
import type { Prisma } from "@prisma/client";

export type FiltrosRegante = {
  q?: string;
  estado?: "HABIL" | "NO_HABIL" | "TODOS";
  comisionId?: string;
};

export function construirFiltroRegantes(filtros: FiltrosRegante): Prisma.ReganteWhereInput {
  const condiciones: Prisma.ReganteWhereInput[] = [];

  const q = filtros.q?.trim();
  if (q) {
    condiciones.push({
      OR: [
        { nombres: { contains: q, mode: "insensitive" } },
        { apellidos: { contains: q, mode: "insensitive" } },
        { numeroDocumento: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (filtros.estado === "HABIL") {
    condiciones.push({ estadoHabil: true });
  } else if (filtros.estado === "NO_HABIL") {
    condiciones.push({ estadoHabil: false });
  }

  if (filtros.comisionId) {
    condiciones.push({
      parcelas: { some: { tomaDeAgua: { canal: { comisionId: filtros.comisionId } } } },
    });
  }

  if (condiciones.length === 0) return {};
  if (condiciones.length === 1) return condiciones[0];
  return { AND: condiciones };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/validations/regante-filtros.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/regante-filtros.ts src/lib/validations/regante-filtros.test.ts
git commit -m "feat: add pure filter builder for padron de regantes search"
```

---

## Task 2: Wire Into listarRegantes and the Padrón Page

**Files:**
- Modify: `src/actions/regantes-queries.ts`
- Modify: `src/app/staff/regantes/page.tsx`
- Create: `src/actions/regantes-queries.test.ts`

**Interfaces:**
- Consumes: `construirFiltroRegantes`, `FiltrosRegante` (Task 1); `listarComisiones()` (already exists in `src/actions/comisiones-queries.ts`, returns `{ id: string; nombre: string; subsector: string; comites: ...; canales: ... }[]`).
- Produces: `listarRegantes(filtros?: FiltrosRegante): Promise<Regante[]>` — same name, now with an optional parameter; any existing caller passing no arguments is unaffected.

- [ ] **Step 1: Write the failing test**

`src/actions/regantes-queries.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { listarRegantes } from "./regantes-queries";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    regante: { findMany: vi.fn() },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.regante.findMany).mockResolvedValue([]);
});

describe("listarRegantes", () => {
  it("queries with an empty where when called with no arguments", async () => {
    await listarRegantes();
    expect(prisma.regante.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { apellidos: "asc" },
    });
  });

  it("queries with an empty where when called with an empty filters object", async () => {
    await listarRegantes({});
    expect(prisma.regante.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { apellidos: "asc" },
    });
  });

  it("passes the built filter through to Prisma", async () => {
    await listarRegantes({ estado: "HABIL" });
    expect(prisma.regante.findMany).toHaveBeenCalledWith({
      where: { estadoHabil: true },
      orderBy: { apellidos: "asc" },
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/actions/regantes-queries.test.ts`
Expected: FAIL — `listarRegantes` currently ignores arguments and always calls `findMany({ orderBy: { apellidos: "asc" } })` with no `where` key at all, so the `toHaveBeenCalledWith` assertions won't match.

- [ ] **Step 3: Update `listarRegantes`**

In `src/actions/regantes-queries.ts`, add the import and change the function signature (leave `obtenerRegante` and `comisionesDeRegante` untouched):

```ts
import { prisma } from "@/lib/prisma";
import { construirFiltroRegantes, type FiltrosRegante } from "@/lib/validations/regante-filtros";
import type { Regante } from "@prisma/client";

export async function listarRegantes(filtros: FiltrosRegante = {}): Promise<Regante[]> {
  return prisma.regante.findMany({
    where: construirFiltroRegantes(filtros),
    orderBy: { apellidos: "asc" },
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/actions/regantes-queries.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Update the padrón page**

Replace `src/app/staff/regantes/page.tsx` with:

```tsx
import Link from "next/link";
import { listarRegantes } from "@/actions/regantes-queries";
import { listarComisiones } from "@/actions/comisiones-queries";
import { NuevaReganteForm } from "./nueva-regante-form";

export default async function RegantesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; comisionId?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const estado = params.estado === "HABIL" || params.estado === "NO_HABIL" ? params.estado : "TODOS";
  const comisionId = params.comisionId ?? "";

  const [regantes, comisiones] = await Promise.all([
    listarRegantes({ q, estado, comisionId: comisionId || undefined }),
    listarComisiones(),
  ]);

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Padrón de regantes</h1>
      <NuevaReganteForm />

      <form method="get" className="mb-4 flex flex-wrap gap-2 rounded border p-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, apellido o documento"
          className="min-w-[16rem] flex-1 rounded border px-3 py-2"
        />
        <select name="estado" defaultValue={estado} className="rounded border px-3 py-2">
          <option value="TODOS">Todos los estados</option>
          <option value="HABIL">Hábil</option>
          <option value="NO_HABIL">No hábil</option>
        </select>
        <select name="comisionId" defaultValue={comisionId} className="rounded border px-3 py-2">
          <option value="">Todas las comisiones</option>
          {comisiones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Filtrar
        </button>
        <Link href="/staff/regantes" className="rounded bg-gray-200 px-4 py-2">
          Limpiar
        </Link>
      </form>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Documento</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Estado</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {regantes.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.numeroDocumento}</td>
              <td className="p-2">
                {r.nombres} {r.apellidos}
              </td>
              <td className="p-2">{r.estadoHabil ? "Hábil" : "No hábil"}</td>
              <td className="p-2">
                <Link href={`/staff/regantes/${r.id}`} className="text-blue-600">
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

- [ ] **Step 6: Manual verification**

Check port 3000 is free (`netstat -ano | grep ':3000' | grep LISTENING`) before starting. Run `npm run dev`, log in as staff, go to `/staff/regantes`:
1. Type a partial name into the text box, submit — confirm the URL changes to `?q=...` and only matching rows show.
2. Select "No hábil", submit — confirm only non-hábil regantes show (mark one no-hábil first via its detail page if none exist).
3. Combine text + estado, submit — confirm both values stay filled in the form and the list reflects both filters.
4. Click "Limpiar" — confirm it returns to the unfiltered list.

Stop the dev server and confirm port 3000 is free again afterward. If browser automation gives any friction, report DONE_WITH_CONCERNS explicitly rather than substituting a weaker check (querying the DB instead of viewing the page) — this project has hit that failure mode before.

- [ ] **Step 7: Run the full suite and build**

Run: `npx vitest run`
Expected: all tests pass, including the 12 new ones from this feature (9 + 3).

Run: `npm run build`
Expected: clean build, no errors.

- [ ] **Step 8: Commit**

```bash
git add src/actions/regantes-queries.ts src/actions/regantes-queries.test.ts src/app/staff/regantes/page.tsx
git commit -m "feat: add search and filters to padron de regantes"
```

## Self-Review Notes

- Spec coverage: texto libre → Task 1's `q` branch + Task 2's text input; estado → Task 1's `estado` branch + select; comisión → Task 1's `comisionId` branch + select; server-side via URL → Task 2's plain GET form, no client JS. All covered.
- Backward compatibility: `listarRegantes()` with no args verified by Task 2 Step 1's first test — returns `{}` as `where`, identical behavior to the pre-existing unconditional `findMany({ orderBy: ... })`.
- Type consistency: `FiltrosRegante` defined once in Task 1, imported (not redefined) in Task 2 and in the page's inline `searchParams` type shape (which intentionally uses looser `string | undefined` fields since raw URL params are always strings, then narrows `estado` before calling `listarRegantes`).
