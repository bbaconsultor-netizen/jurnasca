"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearRegistro, resolverRegistro } from "@/actions/mantenimiento";

type Target = { id: string; label: string; field: "canalId" | "tomaDeAguaId" | "compuertaId" };

export function NuevoRegistroForm({ targets }: { targets: Target[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const [field, id] = (formData.get("destino")?.toString() ?? "").split(":");
    if (field && id) formData.set(field, id);
    formData.delete("destino");

    const result = await crearRegistro(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2">
      <select name="tipo" className="rounded border px-2 py-1 text-sm" required>
        <option value="MANTENIMIENTO">MANTENIMIENTO</option>
        <option value="INCIDENCIA">INCIDENCIA</option>
      </select>
      <input name="fecha" type="date" className="rounded border px-2 py-1 text-sm" required />
      <select name="destino" className="rounded border px-2 py-1 text-sm" required>
        {targets.map((t) => (
          <option key={`${t.field}:${t.id}`} value={`${t.field}:${t.id}`}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        name="descripcion"
        placeholder="Descripción"
        className="min-w-[12rem] flex-1 rounded border px-2 py-1 text-sm"
        required
      />
      <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
        Registrar
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}

type RegistroItem = {
  id: string;
  tipo: string;
  fecha: Date;
  descripcion: string;
  estado: string;
  tomaDeAgua: { nombre: string } | null;
  compuerta: { nombre: string } | null;
};

export function HistorialMantenimiento({ registros }: { registros: RegistroItem[] }) {
  const router = useRouter();

  async function handleResolver(id: string) {
    await resolverRegistro(id);
    router.refresh();
  }

  if (registros.length === 0) {
    return <p className="mt-2 text-sm text-gray-500">Sin registros de mantenimiento o incidencias.</p>;
  }

  return (
    <ul className="mt-2 space-y-1 text-sm">
      {registros.map((r) => (
        <li key={r.id} className="flex items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-xs ${
              r.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
            }`}
          >
            {r.estado}
          </span>
          <span>
            [{r.tipo}] {r.fecha.toISOString().slice(0, 10)} — {r.descripcion}
            {r.tomaDeAgua && ` (${r.tomaDeAgua.nombre})`}
            {r.compuerta && ` (${r.compuerta.nombre})`}
          </span>
          {r.estado === "PENDIENTE" && (
            <button
              type="button"
              onClick={() => handleResolver(r.id)}
              className="text-xs text-blue-600 underline"
            >
              Marcar resuelto
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
