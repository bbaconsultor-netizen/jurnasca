import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "../logout-button";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const esAdmin = session?.user?.perfil === "ADMINISTRACION";

  return (
    <div>
      <nav className="flex items-center justify-between border-b px-8 py-4">
        <div className="flex gap-4">
          <Link href="/staff/junta" className="text-sm font-medium text-gray-700">
            Junta
          </Link>
          <Link href="/staff/canales" className="text-sm font-medium text-gray-700">
            Canales
          </Link>
          <Link href="/staff/regantes" className="text-sm font-medium text-gray-700">
            Regantes
          </Link>
          {esAdmin && (
            <Link href="/staff/usuarios" className="text-sm font-medium text-gray-700">
              Usuarios
            </Link>
          )}
        </div>
        <LogoutButton />
      </nav>
      {children}
    </div>
  );
}
