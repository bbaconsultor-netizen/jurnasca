import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { obtenerRegante } from "@/actions/regantes-queries";

export default async function MiPadronPage() {
  const session = await getServerSession(authOptions);
  const reganteId = session?.user?.id;
  if (!reganteId) {
    return <p className="p-8">No se pudo cargar tu información.</p>;
  }

  const regante = await obtenerRegante(reganteId);
  if (!regante) {
    return <p className="p-8">No se encontró tu registro en el padrón.</p>;
  }

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Mi padrón</h1>
      <p>
        <strong>Nombre:</strong> {regante.nombres} {regante.apellidos}
      </p>
      <p>
        <strong>{regante.tipoDocumento}:</strong> {regante.numeroDocumento}
      </p>
      <p>
        <strong>Estado:</strong> {regante.estadoHabil ? "Hábil" : "No hábil"}
      </p>

      <h2 className="mb-2 mt-6 text-lg font-semibold">Mis parcelas</h2>
      {regante.parcelas.map((parcela) => (
        <div key={parcela.id} className="mb-4 rounded border p-4">
          <p>
            <strong>Área:</strong> {parcela.areaHectareas} ha
          </p>
          <p>
            <strong>Toma de agua:</strong> {parcela.tomaDeAgua.nombre} ({parcela.tomaDeAgua.caudalLps} l/s)
          </p>
          <h3 className="mt-2 font-medium">Cultivos</h3>
          <ul className="list-disc pl-5">
            {parcela.cultivos.map((cultivo) => (
              <li key={cultivo.id}>
                {cultivo.tipoCultivo} — campaña {cultivo.campana}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  );
}
