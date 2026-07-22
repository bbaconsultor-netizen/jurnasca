"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { agregarAutoridad } from "@/actions/junta";

const CARGOS = ["PRESIDENTE", "VICEPRESIDENTE", "SECRETARIO", "TESORERO", "GERENTE", "VOCAL"] as const;

export function NuevaAutoridadForm({ periodoId }: { periodoId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("periodoId", periodoId);
    const result = await agregarAutoridad(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2">
      <select name="cargo" className="rounded border px-2 py-1 text-sm" required>
        {CARGOS.map((cargo) => (
          <option key={cargo} value={cargo}>
            {cargo}
          </option>
        ))}
      </select>
      <input name="nombre" placeholder="Nombre" className="rounded border px-2 py-1 text-sm" required />
      <input name="dni" placeholder="DNI" className="rounded border px-2 py-1 text-sm" required />
      <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
        Agregar autoridad
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
