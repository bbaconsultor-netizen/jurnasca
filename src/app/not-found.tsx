import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Página no encontrada</h1>
      <Link href="/login" className="text-blue-600">
        Volver al inicio
      </Link>
    </main>
  );
}
