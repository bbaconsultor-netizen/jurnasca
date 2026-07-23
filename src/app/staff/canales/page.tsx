import { listarCanales } from "@/actions/canales-queries";
import { listarComisiones } from "@/actions/comisiones-queries";
import { NuevoCanalForm } from "./nuevo-canal-form";
import { CanalCard } from "./canal-card";

export default async function CanalesPage() {
  const [canales, comisiones] = await Promise.all([listarCanales(), listarComisiones()]);
  const comisionOptions = comisiones.map((c) => ({ id: c.id, nombre: c.nombre }));

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Canales y tomas de agua</h1>
      <NuevoCanalForm comisiones={comisionOptions} />
      {canales.map((canal) => (
        <CanalCard key={canal.id} canal={canal} comisionOptions={comisionOptions} />
      ))}
    </main>
  );
}
