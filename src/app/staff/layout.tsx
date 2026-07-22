import Link from "next/link";
import { LogoutButton } from "../logout-button";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
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
        </div>
        <LogoutButton />
      </nav>
      {children}
    </div>
  );
}
