"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearTomaDeAgua } from "@/actions/canales";

export function NuevaTomaForm({ canalId }: { canalId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("canalId", canalId);
    const result = await crearTomaDeAgua(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input name="nombre" placeholder="Nombre de la toma" className="rounded border px-2 py-1 text-sm" required />
      <input
        name="caudalLps"
        type="number"
        step="0.1"
        placeholder="Caudal (l/s)"
        className="rounded border px-2 py-1 text-sm"
        required
      />
      <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
        Agregar toma
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
