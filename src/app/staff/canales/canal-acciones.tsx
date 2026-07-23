"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { actualizarCanal, eliminarCanal } from "@/actions/canales";

type ComisionOption = { id: string; nombre: string };

const ESTADOS = ["BUENO", "REGULAR", "MALO"] as const;

export function EditarCanalForm({
  canal,
  comisiones,
}: {
  canal: { id: string; nombre: string; subsector: string; comisionId: string | null; estadoConservacion: string };
  comisiones: ComisionOption[];
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await actualizarCanal(canal.id, formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditando(false);
    router.refresh();
  }

  async function handleEliminar() {
    setError(null);
    const result = await eliminarCanal(canal.id);
    if (!result.success) {
      setError(result.error);
    }
  }

  if (!editando) {
    return (
      <div className="mt-1 flex gap-2 text-sm">
        <button type="button" onClick={() => setEditando(true)} className="text-blue-600 underline">
          Editar canal
        </button>
        <button type="button" onClick={handleEliminar} className="text-red-600 underline">
          Eliminar canal
        </button>
        {error && <span className="text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2">
      <input name="nombre" defaultValue={canal.nombre} className="rounded border px-2 py-1 text-sm" required />
      <input
        name="subsector"
        defaultValue={canal.subsector}
        className="rounded border px-2 py-1 text-sm"
        required
      />
      <select name="comisionId" defaultValue={canal.comisionId ?? ""} className="rounded border px-2 py-1 text-sm">
        <option value="">Sin comisión</option>
        {comisiones.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
      <select
        name="estadoConservacion"
        defaultValue={canal.estadoConservacion}
        className="rounded border px-2 py-1 text-sm"
      >
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
        Guardar
      </button>
      <button type="button" onClick={() => setEditando(false)} className="rounded bg-gray-200 px-3 py-1 text-sm">
        Cancelar
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
