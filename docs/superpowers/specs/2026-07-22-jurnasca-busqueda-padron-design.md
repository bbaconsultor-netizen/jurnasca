# Jurnasca — Búsqueda y filtros en el padrón de regantes

## Contexto

Segunda pieza de la Fase B original (importación Excel quedó descartada por el usuario — no es prioridad ahora). El padrón de regantes en `/staff/regantes` (`src/app/staff/regantes/page.tsx`) hoy lista todos los regantes sin forma de acotar la vista. Este spec agrega búsqueda por texto libre y filtros por estado y comisión.

## Mecanismo

Un `<form method="get">` plano (sin JavaScript, sin componente cliente) en la página del padrón. Al enviarse, el navegador navega a `/staff/regantes?q=...&estado=...&comisionId=...`; Next.js re-renderiza el Server Component leyendo esos `searchParams` y `listarRegantes` arma el filtro de Prisma correspondiente. Consistente con el resto de la app (100% server-rendered).

## Filtros

- **Texto libre (`q`):** coincidencia case-insensitive (`contains`, `mode: "insensitive"`) en `nombres` **OR** `apellidos` **OR** `numeroDocumento`.
- **Estado (`estado`):** `"HABIL"` → `estadoHabil: true`; `"NO_HABIL"` → `estadoHabil: false`; ausente o `"TODOS"` → sin filtro.
- **Comisión (`comisionId`):** como la comisión es derivada (parcela → toma → canal → comisión, no un campo directo en `Regante`), se traduce a `parcelas: { some: { tomaDeAgua: { canal: { comisionId } } } }`. Ausente o vacío → sin filtro.

Los tres filtros se combinan con AND cuando están presentes. El formulario usa `defaultValue`/`defaultChecked` desde los `searchParams` actuales para que los tres controles reflejen y preserven la selección vigente al reenviar (por ejemplo, cambiar la comisión no debe borrar el texto ya tipeado).

## Cambios de código

- `src/actions/regantes-queries.ts`: `listarRegantes` gana un parámetro opcional `filtros: { q?: string; estado?: "HABIL" | "NO_HABIL"; comisionId?: string }` y arma el `where` de Prisma según lo anterior. Sin filtros (objeto vacío o ausente) se comporta exactamente igual que hoy — no rompe el uso existente si algún otro caller la llama sin argumentos.
- `src/app/staff/regantes/page.tsx`: se convierte en `RegantesPage({ searchParams }: { searchParams: Promise<{ q?: string; estado?: string; comisionId?: string }> })` (Next.js 16 requiere `searchParams` como Promise, igual que ya se maneja `params` en `[id]/page.tsx`). Lee y valida los tres valores, los pasa a `listarRegantes`, y renderiza el formulario de filtros arriba de la tabla. También necesita `listarComisiones()` para poblar el `<select>` de comisión.

## Manejo de errores

No hay mutaciones ni validación de Zod involucradas — es un flujo de solo lectura. Un `comisionId` que no exista simplemente no coincide con ninguna fila (lista vacía), sin necesidad de manejo especial. Un `estado` con un valor inesperado se trata como `"TODOS"` (sin filtro), no como error.

## Testing

Nuevo test para la función que arma el `where` a partir de los filtros (extraída como función pura testeable, p. ej. `construirFiltroRegantes(filtros)` en `src/lib/validations/regante-filtros.ts` o similar, consumida por `listarRegantes`), cubriendo: sin filtros, solo `q`, solo `estado` (ambos valores), solo `comisionId`, y los tres combinados. Se sigue el patrón ya establecido en el proyecto (Vitest, funciones puras separadas de las llamadas a Prisma).

## Fuera de alcance

- Importación desde Excel (descartada explícitamente por el usuario).
- Paginación (el padrón actual no la tiene; no se agrega en este spec).
- Ordenamiento configurable por el usuario (se mantiene el orden actual por apellido).
