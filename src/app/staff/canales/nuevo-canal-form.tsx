"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearCanal } from "@/actions/canales";

type ComisionOption = { id: string; nombre: string };

export function NuevoCanalForm({ comisiones }: { comisiones: ComisionOption[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await crearCanal(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex gap-2 rounded border p-4">
      <input name="nombre" placeholder="Nombre del canal" className="rounded border px-3 py-2" required />
      <input name="subsector" placeholder="Subsector" className="rounded border px-3 py-2" required />
      <select name="comisionId" className="rounded border px-3 py-2" defaultValue="">
        <option value="">Sin comisión</option>
        {comisiones.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
        Crear canal
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
