"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-xl font-semibold">Ocurrió un error inesperado</h1>
          <p className="text-gray-600">Intenta nuevamente en unos momentos.</p>
          <button onClick={() => reset()} className="rounded bg-blue-600 px-4 py-2 text-white">
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
