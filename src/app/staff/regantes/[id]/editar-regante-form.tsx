"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { actualizarRegante, regenerarCodigoPadron } from "@/actions/regantes";

type ReganteEditable = {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  direccion: string | null;
};

export function EditarReganteForm({ regante }: { regante: ReganteEditable }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await actualizarRegante(regante.id, formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditando(false);
    router.refresh();
  }

  async function handleRegenerarCodigo() {
    setError(null);
    const result = await regenerarCodigoPadron(regante.id);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setCodigoGenerado(result.data.codigoPadronPlano);
  }

  if (!editando) {
    return (
      <div className="mb-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => setEditando(true)} className="text-sm text-blue-600 underline">
          Editar datos
        </button>
        <button type="button" onClick={handleRegenerarCodigo} className="text-sm text-blue-600 underline">
          Generar nuevo código
        </button>
        {codigoGenerado && (
          <p className="w-full rounded bg-green-50 p-2 text-sm text-green-800">
            Nuevo código de padrón (no se podrá ver de nuevo): <strong>{codigoGenerado}</strong>
          </p>
        )}
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-2 gap-3 rounded border p-4">
      <select name="tipoDocumento" defaultValue={regante.tipoDocumento} className="rounded border px-3 py-2">
        <option value="DNI">DNI</option>
        <option value="RUC">RUC</option>
      </select>
      <input
        name="numeroDocumento"
        defaultValue={regante.numeroDocumento}
        className="rounded border px-3 py-2"
        required
      />
      <input name="nombres" defaultValue={regante.nombres} className="rounded border px-3 py-2" required />
      <input name="apellidos" defaultValue={regante.apellidos} className="rounded border px-3 py-2" required />
      <input
        name="telefono"
        defaultValue={regante.telefono ?? ""}
        placeholder="Teléfono (opcional)"
        className="rounded border px-3 py-2"
      />
      <input
        name="direccion"
        defaultValue={regante.direccion ?? ""}
        placeholder="Dirección (opcional)"
        className="rounded border px-3 py-2"
      />
      <div className="col-span-2 flex gap-2">
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Guardar
        </button>
        <button type="button" onClick={() => setEditando(false)} className="rounded bg-gray-200 px-4 py-2">
          Cancelar
        </button>
      </div>
      {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
