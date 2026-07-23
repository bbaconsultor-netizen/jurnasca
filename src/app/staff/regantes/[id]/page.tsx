import { obtenerRegante, comisionesDeRegante } from "@/actions/regantes-queries";
import { listarCanales } from "@/actions/canales-queries";
import { actualizarEstadoHabil } from "@/actions/regantes";
import { NuevaParcelaForm } from "./nueva-parcela-form";
import { NuevoCultivoForm } from "./nuevo-cultivo-form";
import { EditarReganteForm } from "./editar-regante-form";
import { EliminarReganteButton } from "./eliminar-regante-button";
import { EditarParcelaForm, EliminarCultivoButton } from "./parcela-acciones";
import { notFound } from "next/navigation";

export default async function ReganteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const regante = await obtenerRegante(id);
  if (!regante) notFound();

  const canales = await listarCanales();
  const tomas = canales.flatMap((canal) => canal.tomas);
  const comisiones = comisionesDeRegante(regante);

  async function handleToggleEstadoHabil() {
    "use server";
    await actualizarEstadoHabil(id, !regante!.estadoHabil);
  }

  return (
    <main className="p-8">
      <h1 className="mb-2 text-xl font-semibold">
        {regante.nombres} {regante.apellidos}
      </h1>
      <p className="mb-2 text-gray-600">
        {regante.tipoDocumento}: {regante.numeroDocumento} — {regante.estadoHabil ? "Hábil" : "No hábil"}
      </p>
      {comisiones.length > 0 && (
        <p className="mb-2 text-sm text-gray-500">Comisión(es): {comisiones.join(", ")}</p>
      )}
      <form action={handleToggleEstadoHabil} className="mb-2">
        <button type="submit" className="text-sm text-blue-600 underline">
          {regante.estadoHabil ? "Marcar no hábil" : "Marcar hábil"}
        </button>
      </form>

      <EditarReganteForm
        regante={{
          id: regante.id,
          tipoDocumento: regante.tipoDocumento,
          numeroDocumento: regante.numeroDocumento,
          nombres: regante.nombres,
          apellidos: regante.apellidos,
          telefono: regante.telefono,
          direccion: regante.direccion,
        }}
      />
      <EliminarReganteButton id={regante.id} nombreCompleto={`${regante.nombres} ${regante.apellidos}`} />

      <h2 className="mb-2 mt-6 text-lg font-medium">Agregar parcela</h2>
      <NuevaParcelaForm reganteId={regante.id} tomas={tomas} />

      <h2 className="mb-2 text-lg font-medium">Parcelas</h2>
      {regante.parcelas.map((parcela) => (
        <div key={parcela.id} className="mb-4 rounded border p-4">
          <p>
            <strong>Área:</strong> {parcela.areaHectareas} ha —{" "}
            <strong>Toma:</strong> {parcela.tomaDeAgua.nombre}
          </p>
          <EditarParcelaForm
            parcela={parcela}
            reganteId={regante.id}
            tomas={tomas.map((t) => ({ id: t.id, nombre: t.nombre, caudalLps: t.caudalLps }))}
          />
          <h3 className="mt-2 text-sm font-medium">Cultivos</h3>
          <ul className="list-disc pl-5 text-sm">
            {parcela.cultivos.map((cultivo) => (
              <li key={cultivo.id}>
                {cultivo.tipoCultivo} — campaña {cultivo.campana}
                <EliminarCultivoButton id={cultivo.id} />
              </li>
            ))}
          </ul>
          <NuevoCultivoForm parcelaId={parcela.id} />
        </div>
      ))}
    </main>
  );
}
