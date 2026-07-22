import { obtenerJunta, listarPeriodos } from "@/actions/junta-queries";
import { abrirPeriodoDirectivo, cerrarPeriodoDirectivo } from "@/actions/junta";
import { listarComisiones } from "@/actions/comisiones-queries";
import { crearComision, eliminarComision, crearComite, eliminarComite } from "@/actions/comisiones";
import { NuevaAutoridadForm } from "./nueva-autoridad-form";

export default async function JuntaPage() {
  const junta = await obtenerJunta();
  const periodos = await listarPeriodos();
  const comisiones = await listarComisiones();

  async function handleAbrirPeriodo(formData: FormData) {
    "use server";
    await abrirPeriodoDirectivo(formData);
  }

  async function handleCerrarPeriodo(formData: FormData) {
    "use server";
    const periodoId = formData.get("periodoId")?.toString();
    if (periodoId) await cerrarPeriodoDirectivo(periodoId);
  }

  async function handleCrearComision(formData: FormData) {
    "use server";
    await crearComision(formData);
  }

  async function handleEliminarComision(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) await eliminarComision(id);
  }

  async function handleCrearComite(formData: FormData) {
    "use server";
    await crearComite(formData);
  }

  async function handleEliminarComite(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) await eliminarComite(id);
  }

  return (
    <main className="p-8">
      <h1 className="mb-2 text-xl font-semibold">
        {junta ? junta.razonSocial : "Junta de Usuarios del Sector Hidráulico Menor Nasca"}
      </h1>
      {junta && <p className="mb-6 text-gray-600">RUC: {junta.ruc}</p>}

      <form action={handleAbrirPeriodo} className="mb-6 flex gap-2 rounded border p-4">
        <input name="fechaInicio" type="date" className="rounded border px-3 py-2" required />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Abrir nuevo período directivo
        </button>
      </form>

      {periodos.map((periodo) => (
        <div key={periodo.id} className="mb-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              Período {periodo.fechaInicio.toISOString().slice(0, 10)}
              {periodo.fechaFin ? ` — ${periodo.fechaFin.toISOString().slice(0, 10)}` : " (vigente)"}
            </h2>
            {periodo.estado === "VIGENTE" && (
              <form action={handleCerrarPeriodo}>
                <input type="hidden" name="periodoId" value={periodo.id} />
                <button type="submit" className="text-sm text-red-600 underline">
                  Cerrar período
                </button>
              </form>
            )}
          </div>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {periodo.autoridades.map((autoridad) => (
              <li key={autoridad.id}>
                {autoridad.cargo}: {autoridad.nombre} (DNI {autoridad.dni})
              </li>
            ))}
          </ul>
          {periodo.estado === "VIGENTE" && <NuevaAutoridadForm periodoId={periodo.id} />}
        </div>
      ))}

      <h2 className="mb-2 mt-8 text-lg font-semibold">Comisiones de usuarios</h2>
      <form action={handleCrearComision} className="mb-4 flex gap-2 rounded border p-4">
        <input name="nombre" placeholder="Nombre de la comisión" className="rounded border px-3 py-2" required />
        <input name="subsector" placeholder="Subsector" className="rounded border px-3 py-2" required />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Crear comisión
        </button>
      </form>

      {comisiones.map((comision) => (
        <div key={comision.id} className="mb-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {comision.nombre} — {comision.subsector}{" "}
              <span className="text-xs text-gray-500">
                ({comision.canales.length} canal{comision.canales.length === 1 ? "" : "es"})
              </span>
            </h3>
            <form action={handleEliminarComision}>
              <input type="hidden" name="id" value={comision.id} />
              <button type="submit" className="text-sm text-red-600 underline">
                Eliminar
              </button>
            </form>
          </div>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {comision.comites.map((comite) => (
              <li key={comite.id} className="flex items-center gap-2">
                <span>
                  {comite.nombre} ({comite.tipo})
                </span>
                <form action={handleEliminarComite}>
                  <input type="hidden" name="id" value={comite.id} />
                  <button type="submit" className="text-xs text-red-600 underline">
                    quitar
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <form action={handleCrearComite} className="mt-2 flex gap-2">
            <input type="hidden" name="comisionId" value={comision.id} />
            <input name="nombre" placeholder="Nombre del comité" className="rounded border px-2 py-1 text-sm" required />
            <select name="tipo" className="rounded border px-2 py-1 text-sm" required>
              <option value="CANAL">CANAL</option>
              <option value="POZO">POZO</option>
              <option value="MANANTIAL">MANANTIAL</option>
            </select>
            <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
              Agregar comité
            </button>
          </form>
        </div>
      ))}
    </main>
  );
}
