import type { DefaultSession } from "next-auth";

type PerfilStaffStr = "ADMINISTRACION" | "TESORERIA" | "TECNICO";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STAFF" | "REGANTE";
      perfil?: PerfilStaffStr;
    } & DefaultSession["user"];
  }

  interface User {
    role: "STAFF" | "REGANTE";
    perfil?: PerfilStaffStr;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "STAFF" | "REGANTE";
    perfil?: PerfilStaffStr;
  }
}
