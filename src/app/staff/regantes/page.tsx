import Link from "next/link";
import { listarRegantes } from "@/actions/regantes-queries";
import { NuevaReganteForm } from "./nueva-regante-form";

export default async function RegantesPage() {
  const regantes = await listarRegantes();

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Padrón de regantes</h1>
      <NuevaReganteForm />
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">DNI</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Estado</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {regantes.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.dni}</td>
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
