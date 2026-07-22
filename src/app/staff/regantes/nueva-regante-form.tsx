"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearRegante } from "@/actions/regantes";

export function NuevaReganteForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await crearRegante(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setCodigoGenerado(result.data.codigoPadronPlano);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="mb-6 rounded border p-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <input name="dni" placeholder="DNI" className="rounded border px-3 py-2" required />
        <input name="nombres" placeholder="Nombres" className="rounded border px-3 py-2" required />
        <input name="apellidos" placeholder="Apellidos" className="rounded border px-3 py-2" required />
        <input name="telefono" placeholder="Teléfono (opcional)" className="rounded border px-3 py-2" />
        <input
          name="direccion"
          placeholder="Dirección (opcional)"
          className="col-span-2 rounded border px-3 py-2"
        />
        <button type="submit" className="col-span-2 rounded bg-blue-600 py-2 text-white">
          Registrar regante
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {codigoGenerado && (
        <p className="mt-2 rounded bg-green-50 p-2 text-sm text-green-800">
          Regante creado. Código de padrón (entregar al regante, no se podrá ver de nuevo):{" "}
          <strong>{codigoGenerado}</strong>
        </p>
      )}
    </div>
  );
}
