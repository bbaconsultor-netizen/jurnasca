import Link from "next/link";
import { LogoutButton } from "../logout-button";

export default function ReganteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="flex items-center justify-between border-b px-8 py-4">
        <div className="flex gap-4">
          <Link href="/regante/mi-padron" className="text-sm font-medium text-gray-700">
            Mi padrón
          </Link>
          <Link href="/regante/autoridades" className="text-sm font-medium text-gray-700">
            Autoridades
          </Link>
        </div>
        <LogoutButton />
      </nav>
      {children}
    </div>
  );
}
