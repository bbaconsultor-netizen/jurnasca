"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearStaffUser } from "@/actions/usuarios";

const PERFILES = ["ADMINISTRACION", "TESORERIA", "TECNICO"] as const;

export function NuevoUsuarioForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCreado(null);
    const formData = new FormData(e.currentTarget);
    const result = await crearStaffUser(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setCreado(result.data.username);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="mb-6 rounded border p-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <input name="nombre" placeholder="Nombre completo" className="rounded border px-3 py-2" required />
        <input name="username" placeholder="Usuario (minúsculas)" className="rounded border px-3 py-2" required />
        <input
          name="password"
          type="password"
          placeholder="Contraseña inicial (mín. 8)"
          className="rounded border px-3 py-2"
          required
        />
        <select name="perfil" className="rounded border px-3 py-2" required>
          {PERFILES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="submit" className="col-span-2 rounded bg-blue-600 py-2 text-white">
          Crear usuario
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {creado && (
        <p className="mt-2 rounded bg-green-50 p-2 text-sm text-green-800">
          Usuario <strong>{creado}</strong> creado.
        </p>
      )}
    </div>
  );
}
