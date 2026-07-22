"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearParcela } from "@/actions/parcelas";
import type { TomaDeAgua } from "@prisma/client";

export function NuevaParcelaForm({ reganteId, tomas }: { reganteId: string; tomas: TomaDeAgua[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("reganteId", reganteId);
    const result = await crearParcela(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-2 gap-3 rounded border p-4">
      <select name="tomaDeAguaId" className="rounded border px-3 py-2" required>
        <option value="">Selecciona una toma de agua</option>
        {tomas.map((toma) => (
          <option key={toma.id} value={toma.id}>
            {toma.nombre} ({toma.caudalLps} l/s)
          </option>
        ))}
      </select>
      <input
        name="areaHectareas"
        type="number"
        step="0.01"
        placeholder="Área (ha)"
        className="rounded border px-3 py-2"
        required
      />
      <input
        name="ubicacion"
        placeholder="Ubicación (opcional)"
        className="col-span-2 rounded border px-3 py-2"
      />
      <button type="submit" className="col-span-2 rounded bg-blue-600 py-2 text-white">
        Agregar parcela
      </button>
      {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
