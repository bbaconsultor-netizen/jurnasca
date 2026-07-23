"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearCompuerta, actualizarCompuerta, eliminarCompuerta } from "@/actions/compuertas";

const ESTADOS = ["BUENO", "REGULAR", "MALO"] as const;

type CompuertaItem = {
  id: string;
  nombre: string;
  ubicacion: string | null;
  caracteristicas: string | null;
  estadoConservacion: string;
};

export function NuevaCompuertaForm({ canalId }: { canalId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("canalId", canalId);
    const result = await crearCompuerta(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2">
      <input name="nombre" placeholder="Nombre de la compuerta" className="rounded border px-2 py-1 text-sm" required />
      <input name="ubicacion" placeholder="Ubicación (opcional)" className="rounded border px-2 py-1 text-sm" />
      <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
        Agregar compuerta
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}

export function CompuertaItemRow({ compuerta, canalId }: { compuerta: CompuertaItem; canalId: string }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("canalId", canalId);
    const result = await actualizarCompuerta(compuerta.id, formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditando(false);
    router.refresh();
  }

  async function handleEliminar() {
    setError(null);
    const result = await eliminarCompuerta(compuerta.id);
    if (!result.success) {
      setError(result.error);
    }
    router.refresh();
  }

  if (!editando) {
    return (
      <li className="text-sm">
        {compuerta.nombre} ({compuerta.estadoConservacion}){" "}
        <button type="button" onClick={() => setEditando(true)} className="ml-1 text-xs text-blue-600 underline">
          editar
        </button>{" "}
        <button type="button" onClick={handleEliminar} className="text-xs text-red-600 underline">
          eliminar
        </button>
        {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
      </li>
    );
  }

  return (
    <li>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-1">
        <input name="nombre" defaultValue={compuerta.nombre} className="rounded border px-1 py-0.5 text-xs" required />
        <select
          name="estadoConservacion"
          defaultValue={compuerta.estadoConservacion}
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
    </li>
  );
}
