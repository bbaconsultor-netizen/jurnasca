"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Tipo = "staff" | "regante";

export default function LoginPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("staff");
  const [identificador, setIdentificador] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await signIn("credentials", {
      tipo,
      identificador,
      clave,
      redirect: false,
    });
    if (result?.error) {
      setError(tipo === "staff" ? "Usuario o contraseña incorrectos" : "DNI o código incorrecto");
      return;
    }
    router.push(tipo === "staff" ? "/staff/junta" : "/regante/mi-padron");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-xl font-semibold">Jurnasca</h1>
        <div className="mb-4 flex rounded border">
          <button
            type="button"
            onClick={() => setTipo("staff")}
            className={`flex-1 py-2 ${tipo === "staff" ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => setTipo("regante")}
            className={`flex-1 py-2 ${tipo === "regante" ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            Regante
          </button>
        </div>
        <label className="mb-1 block text-sm">{tipo === "staff" ? "Usuario" : "DNI o RUC"}</label>
        <input
          className="mb-4 w-full rounded border px-3 py-2"
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          required
        />
        <label className="mb-1 block text-sm">
          {tipo === "staff" ? "Contraseña" : "Código de padrón"}
        </label>
        <input
          type="password"
          className="mb-4 w-full rounded border px-3 py-2"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
        />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white">
          Ingresar
        </button>
      </form>
    </main>
  );
}
