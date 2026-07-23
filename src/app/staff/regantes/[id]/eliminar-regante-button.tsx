"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarRegante } from "@/actions/regantes";

export function EliminarReganteButton({ id, nombreCompleto }: { id: string; nombreCompleto: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleEliminar() {
    if (texto.trim() !== nombreCompleto) {
      setError("El nombre no coincide.");
      return;
    }
    const result = await eliminarRegante(id);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/staff/regantes");
  }

  if (!confirmando) {
    return (
      <button type="button" onClick={() => setConfirmando(true)} className="text-sm text-red-600 underline">
        Eliminar regante
      </button>
    );
  }

  return (
    <div className="mb-4 rounded border border-red-300 p-4">
      <p className="mb-2 text-sm">
        Para confirmar, escribí exactamente <strong>{nombreCompleto}</strong>:
      </p>
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="mb-2 w-full rounded border px-3 py-2"
      />
      <div className="flex gap-2">
        <button type="button" onClick={handleEliminar} className="rounded bg-red-600 px-4 py-2 text-white">
          Confirmar eliminación
        </button>
        <button type="button" onClick={() => setConfirmando(false)} className="rounded bg-gray-200 px-4 py-2">
          Cancelar
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
