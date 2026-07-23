import { listarCanales } from "@/actions/canales-queries";
import { listarComisiones } from "@/actions/comisiones-queries";
import { NuevoCanalForm } from "./nuevo-canal-form";
import { NuevaTomaForm } from "./nueva-toma-form";
import { EditarCanalForm } from "./canal-acciones";
import { EditarTomaForm } from "./toma-acciones";
import { NuevaCompuertaForm, CompuertaItemRow } from "./compuertas";

export default async function CanalesPage() {
  const [canales, comisiones] = await Promise.all([listarCanales(), listarComisiones()]);
  const comisionOptions = comisiones.map((c) => ({ id: c.id, nombre: c.nombre }));

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Canales y tomas de agua</h1>
      <NuevoCanalForm comisiones={comisionOptions} />
      {canales.map((canal) => (
        <div key={canal.id} className="mb-4 rounded border p-4">
          <h2 className="font-medium">
            {canal.nombre} — {canal.subsector}{" "}
            <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {canal.comision ? canal.comision.nombre : "sin comisión"}
            </span>{" "}
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {canal.estadoConservacion}
            </span>
          </h2>
          <EditarCanalForm canal={canal} comisiones={comisionOptions} />

          <h3 className="mt-3 text-sm font-medium">Tomas de agua</h3>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {canal.tomas.map((toma) => (
              <li key={toma.id}>
                {toma.nombre}: {toma.caudalLps} l/s ({toma.estado})
                <EditarTomaForm toma={toma} canalId={canal.id} />
              </li>
            ))}
          </ul>
          <NuevaTomaForm canalId={canal.id} />

          <h3 className="mt-3 text-sm font-medium">Compuertas</h3>
          <ul className="mt-1 list-disc pl-5">
            {canal.compuertas.map((compuerta) => (
              <CompuertaItemRow key={compuerta.id} compuerta={compuerta} canalId={canal.id} />
            ))}
          </ul>
          <NuevaCompuertaForm canalId={canal.id} />
        </div>
      ))}
    </main>
  );
}
