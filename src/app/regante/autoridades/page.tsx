import { prisma } from "@/lib/prisma";

export default async function AutoridadesPage() {
  const periodoVigente = await prisma.periodoDirectivo.findFirst({
    where: { estado: "VIGENTE" },
    include: { autoridades: true },
    orderBy: { fechaInicio: "desc" },
  });

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Autoridades vigentes</h1>
      {!periodoVigente && <p>No hay un período directivo vigente registrado.</p>}
      {periodoVigente && (
        <ul className="space-y-2">
          {periodoVigente.autoridades.map((autoridad) => (
            <li key={autoridad.id}>
              <strong>{autoridad.cargo}:</strong> {autoridad.nombre}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
