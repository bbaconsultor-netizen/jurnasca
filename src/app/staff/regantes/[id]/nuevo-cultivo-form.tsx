"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearCultivo } from "@/actions/parcelas";

export function NuevoCultivoForm({ parcelaId }: { parcelaId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("parcelaId", parcelaId);
    const result = await crearCultivo(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input name="tipoCultivo" placeholder="Cultivo" className="rounded border px-2 py-1 text-sm" required />
      <input
        name="campana"
        placeholder="Campaña (ej. 2026-I)"
        className="rounded border px-2 py-1 text-sm"
        required
      />
      <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
        Agregar
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
