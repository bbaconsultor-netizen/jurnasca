"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { actualizarParcela, eliminarParcela, eliminarCultivo } from "@/actions/parcelas";

type TomaOption = { id: string; nombre: string; caudalLps: number };

export function EditarParcelaForm({
  parcela,
  reganteId,
  tomas,
}: {
  parcela: { id: string; tomaDeAguaId: string; areaHectareas: number; ubicacion: string | null };
  reganteId: string;
  tomas: TomaOption[];
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("reganteId", reganteId);
    const result = await actualizarParcela(parcela.id, formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditando(false);
    router.refresh();
  }

  async function handleEliminar() {
    setError(null);
    const result = await eliminarParcela(parcela.id);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (!editando) {
    return (
      <div className="mt-1 flex gap-2 text-sm">
        <button type="button" onClick={() => setEditando(true)} className="text-blue-600 underline">
          Editar parcela
        </button>
        <button type="button" onClick={handleEliminar} className="text-red-600 underline">
          Eliminar parcela
        </button>
        {error && <span className="text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2">
      <select name="tomaDeAguaId" defaultValue={parcela.tomaDeAguaId} className="rounded border px-2 py-1 text-sm">
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
        defaultValue={parcela.areaHectareas}
        className="w-24 rounded border px-2 py-1 text-sm"
        required
      />
      <input
        name="ubicacion"
        defaultValue={parcela.ubicacion ?? ""}
        placeholder="Ubicación (opcional)"
        className="rounded border px-2 py-1 text-sm"
      />
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

export function EliminarCultivoButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleEliminar() {
    setError(null);
    const result = await eliminarCultivo(id);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={handleEliminar} className="ml-2 text-xs text-red-600 underline">
        eliminar
      </button>
      {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
    </>
  );
}
