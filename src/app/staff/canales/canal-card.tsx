import { listarRegistrosPorCanal } from "@/actions/mantenimiento-queries";
import { NuevaTomaForm } from "./nueva-toma-form";
import { EditarCanalForm } from "./canal-acciones";
import { EditarTomaForm } from "./toma-acciones";
import { NuevaCompuertaForm, CompuertaItemRow } from "./compuertas";
import { NuevoRegistroForm, HistorialMantenimiento } from "./mantenimiento";

type ComisionOption = { id: string; nombre: string };

type CanalConRelaciones = {
  id: string;
  nombre: string;
  subsector: string;
  comisionId: string | null;
  estadoConservacion: string;
  comision: { nombre: string } | null;
  tomas: { id: string; nombre: string; caudalLps: number; estado: string; estadoConservacion: string }[];
  compuertas: {
    id: string;
    nombre: string;
    ubicacion: string | null;
    caracteristicas: string | null;
    estadoConservacion: string;
  }[];
};

export async function CanalCard({
  canal,
  comisionOptions,
}: {
  canal: CanalConRelaciones;
  comisionOptions: ComisionOption[];
}) {
  const registros = await listarRegistrosPorCanal(canal.id);
  const targets = [
    { id: canal.id, label: `${canal.nombre} (canal)`, field: "canalId" as const },
    ...canal.tomas.map((t) => ({ id: t.id, label: `${t.nombre} (toma)`, field: "tomaDeAguaId" as const })),
    ...canal.compuertas.map((c) => ({
      id: c.id,
      label: `${c.nombre} (compuerta)`,
      field: "compuertaId" as const,
    })),
  ];

  return (
    <div className="mb-4 rounded border p-4">
      <h2 className="font-medium">
        {canal.nombre} — {canal.subsector}{" "}
        <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {canal.comision ? canal.comision.nombre : "sin comisión"}
        </span>{" "}
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{canal.estadoConservacion}</span>
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

      <h3 className="mt-3 text-sm font-medium">Mantenimiento e incidencias</h3>
      <HistorialMantenimiento registros={registros} />
      <NuevoRegistroForm targets={targets} />
    </div>
  );
}
