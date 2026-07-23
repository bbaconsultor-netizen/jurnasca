"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { actualizarTomaDeAgua, eliminarTomaDeAgua } from "@/actions/canales";

const ESTADOS = ["BUENO", "REGULAR", "MALO"] as const;

export function EditarTomaForm({
  toma,
  canalId,
}: {
  toma: { id: string; nombre: string; caudalLps: number; estadoConservacion: string };
  canalId: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("canalId", canalId);
    const result = await actualizarTomaDeAgua(toma.id, formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditando(false);
    router.refresh();
  }

  async function handleEliminar() {
    setError(null);
    const result = await eliminarTomaDeAgua(toma.id);
    if (!result.success) {
      setError(result.error);
    }
    router.refresh();
  }

  if (!editando) {
    return (
      <span className="ml-2 text-xs">
        <button type="button" onClick={() => setEditando(true)} className="text-blue-600 underline">
          editar
        </button>{" "}
        <button type="button" onClick={handleEliminar} className="text-red-600 underline">
          eliminar
        </button>
        {error && <span className="ml-1 text-red-600">{error}</span>}
      </span>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex flex-wrap gap-1">
      <input name="nombre" defaultValue={toma.nombre} className="rounded border px-1 py-0.5 text-xs" required />
      <input
        name="caudalLps"
        type="number"
        step="0.1"
        defaultValue={toma.caudalLps}
        className="w-20 rounded border px-1 py-0.5 text-xs"
        required
      />
      <select
        name="estadoConservacion"
        defaultValue={toma.estadoConservacion}
        className="rounded border px-1 py-0.5 text-xs"
      >
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded bg-blue-600 px-2 py-0.5 text-xs text-white">
        Guardar
      </button>
      <button type="button" onClick={() => setEditando(false)} className="rounded bg-gray-200 px-2 py-0.5 text-xs">
        Cancelar
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
