import { PrismaClient } from "@prisma/client";
import { hash } from "../src/lib/crypto";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("cambiar-esta-clave");

  await prisma.staffUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      nombre: "Administrador",
      username: "admin",
      passwordHash,
      cargoInterno: "Administrador del sistema",
      perfil: "ADMINISTRACION",
    },
  });

  console.log("Usuario staff inicial creado: username=admin, password=cambiar-esta-clave");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
