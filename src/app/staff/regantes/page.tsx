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
