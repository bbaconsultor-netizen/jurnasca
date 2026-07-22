import { listarCanales } from "@/actions/canales";
import { NuevoCanalForm } from "./nuevo-canal-form";
import { NuevaTomaForm } from "./nueva-toma-form";

export default async function CanalesPage() {
  const canales = await listarCanales();

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Canales y tomas de agua</h1>
      <NuevoCanalForm />
      {canales.map((canal) => (
        <div key={canal.id} className="mb-4 rounded border p-4">
          <h2 className="font-medium">
            {canal.nombre} — {canal.subsector}
          </h2>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {canal.tomas.map((toma) => (
              <li key={toma.id}>
                {toma.nombre}: {toma.caudalLps} l/s ({toma.estado})
              </li>
            ))}
          </ul>
          <NuevaTomaForm canalId={canal.id} />
        </div>
      ))}
    </main>
  );
}
