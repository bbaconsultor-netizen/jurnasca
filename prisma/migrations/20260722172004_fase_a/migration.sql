-- CreateEnum
CREATE TYPE "PerfilStaff" AS ENUM ('ADMINISTRACION', 'TESORERIA', 'TECNICO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('DNI', 'RUC');

-- CreateEnum
CREATE TYPE "TipoComite" AS ENUM ('CANAL', 'POZO', 'MANANTIAL');

-- CreateEnum
CREATE TYPE "EstadoConservacion" AS ENUM ('BUENO', 'REGULAR', 'MALO');

-- CreateEnum
CREATE TYPE "TipoRegistro" AS ENUM ('MANTENIMIENTO', 'INCIDENCIA');

-- CreateEnum
CREATE TYPE "EstadoRegistro" AS ENUM ('PENDIENTE', 'RESUELTO');

-- AlterTable
ALTER TABLE "Canal" ADD COLUMN     "comisionId" TEXT,
ADD COLUMN     "estadoConservacion" "EstadoConservacion" NOT NULL DEFAULT 'BUENO';

-- AlterTable: rename dni -> numeroDocumento preserving data (safe rename instead of drop/add)
ALTER TABLE "Regante" RENAME COLUMN "dni" TO "numeroDocumento";
ALTER INDEX "Regante_dni_key" RENAME TO "Regante_numeroDocumento_key";
ALTER TABLE "Regante" ADD COLUMN "tipoDocumento" "TipoDocumento" NOT NULL DEFAULT 'DNI';

-- AlterTable
ALTER TABLE "StaffUser" ADD COLUMN     "perfil" "PerfilStaff" NOT NULL DEFAULT 'ADMINISTRACION';

-- AlterTable
ALTER TABLE "TomaDeAgua" ADD COLUMN     "estadoConservacion" "EstadoConservacion" NOT NULL DEFAULT 'BUENO';

-- CreateTable
CREATE TABLE "Comision" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "subsector" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comite" (
    "id" TEXT NOT NULL,
    "comisionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoComite" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compuerta" (
    "id" TEXT NOT NULL,
    "canalId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT,
    "caracteristicas" TEXT,
    "estadoConservacion" "EstadoConservacion" NOT NULL DEFAULT 'BUENO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compuerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroMantenimiento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoRegistro" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'PENDIENTE',
    "canalId" TEXT,
    "tomaDeAguaId" TEXT,
    "compuertaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroMantenimiento_pkey" PRIMARY KEY ("id")
);

-- (index already renamed above from Regante_dni_key)

-- AddForeignKey
ALTER TABLE "Comite" ADD CONSTRAINT "Comite_comisionId_fkey" FOREIGN KEY ("comisionId") REFERENCES "Comision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compuerta" ADD CONSTRAINT "Compuerta_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "Canal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroMantenimiento" ADD CONSTRAINT "RegistroMantenimiento_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "Canal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroMantenimiento" ADD CONSTRAINT "RegistroMantenimiento_tomaDeAguaId_fkey" FOREIGN KEY ("tomaDeAguaId") REFERENCES "TomaDeAgua"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroMantenimiento" ADD CONSTRAINT "RegistroMantenimiento_compuertaId_fkey" FOREIGN KEY ("compuertaId") REFERENCES "Compuerta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Canal" ADD CONSTRAINT "Canal_comisionId_fkey" FOREIGN KEY ("comisionId") REFERENCES "Comision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

