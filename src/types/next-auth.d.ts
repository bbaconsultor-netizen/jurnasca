import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STAFF" | "REGANTE";
    } & DefaultSession["user"];
  }

  interface User {
    role: "STAFF" | "REGANTE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "STAFF" | "REGANTE";
  }
}
