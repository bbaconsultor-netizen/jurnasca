import bcrypt from "bcryptjs";

export async function hash(valor: string): Promise<string> {
  return bcrypt.hash(valor, 10);
}

export async function verificar(valor: string, hash: string): Promise<boolean> {
  return bcrypt.compare(valor, hash);
}
