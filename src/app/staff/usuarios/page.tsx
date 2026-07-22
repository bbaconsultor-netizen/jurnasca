import { listarStaffUsers } from "@/actions/usuarios-queries";
import { cambiarPerfil, setActivo, resetearClave } from "@/actions/usuarios";
import { NuevoUsuarioForm } from "./nuevo-usuario-form";
import type { PerfilStaff } from "@prisma/client";

const PERFILES: PerfilStaff[] = ["ADMINISTRACION", "TESORERIA", "TECNICO"];

export default async function UsuariosPage() {
  const usuarios = await listarStaffUsers();

  async function handleCambiarPerfil(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    const perfil = formData.get("perfil")?.toString() as PerfilStaff | undefined;
    if (id && perfil) await cambiarPerfil(id, perfil);
  }

  async function handleToggleActivo(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    const activo = formData.get("activo")?.toString() === "true";
    if (id) await setActivo(id, activo);
  }

  async function handleResetearClave(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) await resetearClave(id, formData);
  }

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Usuarios del sistema</h1>
      <NuevoUsuarioForm />
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Nombre</th>
            <th className="p-2">Usuario</th>
            <th className="p-2">Perfil</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-b align-top">
              <td className="p-2">{u.nombre}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">
                <form action={handleCambiarPerfil} className="flex gap-1">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="perfil" defaultValue={u.perfil} className="rounded border px-1 py-0.5 text-sm">
                    {PERFILES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="rounded bg-gray-200 px-2 py-0.5 text-sm">
                    Guardar
                  </button>
                </form>
              </td>
              <td className="p-2">{u.activo ? "Activo" : "Inactivo"}</td>
              <td className="p-2">
                <div className="flex flex-col gap-1">
                  <form action={handleToggleActivo}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="activo" value={(!u.activo).toString()} />
                    <button type="submit" className="text-sm text-blue-600 underline">
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                  <form action={handleResetearClave} className="flex gap-1">
                    <input type="hidden" name="id" value={u.id} />
                    <input
                      name="password"
                      type="password"
                      placeholder="Nueva clave"
                      className="rounded border px-1 py-0.5 text-sm"
                      required
                    />
                    <button type="submit" className="rounded bg-gray-200 px-2 py-0.5 text-sm">
                      Reset
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
