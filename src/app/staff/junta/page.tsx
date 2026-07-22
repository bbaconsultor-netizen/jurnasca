import { obtenerJunta, listarPeriodos, abrirPeriodoDirectivo, cerrarPeriodoDirectivo } from "@/actions/junta";
import { NuevaAutoridadForm } from "./nueva-autoridad-form";

export default async function JuntaPage() {
  const junta = await obtenerJunta();
  const periodos = await listarPeriodos();

  async function handleAbrirPeriodo(formData: FormData) {
    "use server";
    await abrirPeriodoDirectivo(formData);
  }

  async function handleCerrarPeriodo(formData: FormData) {
    "use server";
    const periodoId = formData.get("periodoId")?.toString();
    if (periodoId) await cerrarPeriodoDirectivo(periodoId);
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
    </main>
  );
}
