import { obtenerRegante } from "@/actions/regantes";
import { listarCanales } from "@/actions/canales";
import { NuevaParcelaForm } from "./nueva-parcela-form";
import { NuevoCultivoForm } from "./nuevo-cultivo-form";
import { notFound } from "next/navigation";

export default async function ReganteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const regante = await obtenerRegante(id);
  if (!regante) notFound();

  const canales = await listarCanales();
  const tomas = canales.flatMap((canal) => canal.tomas);

  return (
    <main className="p-8">
      <h1 className="mb-2 text-xl font-semibold">
        {regante.nombres} {regante.apellidos}
      </h1>
      <p className="mb-6 text-gray-600">
        DNI: {regante.dni} — {regante.estadoHabil ? "Hábil" : "No hábil"}
      </p>

      <h2 className="mb-2 text-lg font-medium">Agregar parcela</h2>
      <NuevaParcelaForm reganteId={regante.id} tomas={tomas} />

      <h2 className="mb-2 text-lg font-medium">Parcelas</h2>
      {regante.parcelas.map((parcela) => (
        <div key={parcela.id} className="mb-4 rounded border p-4">
          <p>
            <strong>Área:</strong> {parcela.areaHectareas} ha —{" "}
            <strong>Toma:</strong> {parcela.tomaDeAgua.nombre}
          </p>
          <h3 className="mt-2 text-sm font-medium">Cultivos</h3>
          <ul className="list-disc pl-5 text-sm">
            {parcela.cultivos.map((cultivo) => (
              <li key={cultivo.id}>
                {cultivo.tipoCultivo} — campaña {cultivo.campana}
              </li>
            ))}
          </ul>
          <NuevoCultivoForm parcelaId={parcela.id} />
        </div>
      ))}
    </main>
  );
}
