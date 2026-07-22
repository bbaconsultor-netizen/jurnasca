import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { autenticarStaff, autenticarRegante } from "./auth-credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        tipo: { label: "Tipo", type: "text" },
        identificador: { label: "Usuario o DNI", type: "text" },
        clave: { label: "Contraseña o Código", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { tipo, identificador, clave } = credentials;

        if (tipo === "staff") {
          return autenticarStaff(identificador, clave);
        }
        if (tipo === "regante") {
          return autenticarRegante(identificador, clave);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: "STAFF" | "REGANTE" }).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as "STAFF" | "REGANTE";
      return session;
    },
  },
};
