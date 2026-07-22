-- CreateEnum
CREATE TYPE "CargoAutoridad" AS ENUM ('PRESIDENTE', 'VICEPRESIDENTE', 'SECRETARIO', 'TESORERO', 'GERENTE', 'VOCAL');

-- CreateEnum
CREATE TYPE "EstadoPeriodo" AS ENUM ('VIGENTE', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "EstadoTomaDeAgua" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateTable
CREATE TABLE "Junta" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "domicilioFiscal" TEXT NOT NULL,
    "marcoLegal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Junta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffUser" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "cargoInterno" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodoDirectivo" (
    "id" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" "EstadoPeriodo" NOT NULL DEFAULT 'VIGENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodoDirectivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Autoridad" (
    "id" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "cargo" "CargoAutoridad" NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Autoridad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Canal" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "subsector" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Canal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TomaDeAgua" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "canalId" TEXT NOT NULL,
    "caudalLps" DOUBLE PRECISION NOT NULL,
    "ubicacion" TEXT,
    "estado" "EstadoTomaDeAgua" NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TomaDeAgua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Regante" (
    "id" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "codigoPadronHash" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "estadoHabil" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Regante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parcela" (
    "id" TEXT NOT NULL,
    "reganteId" TEXT NOT NULL,
    "tomaDeAguaId" TEXT NOT NULL,
    "areaHectareas" DOUBLE PRECISION NOT NULL,
    "ubicacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parcela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cultivo" (
    "id" TEXT NOT NULL,
    "parcelaId" TEXT NOT NULL,
    "tipoCultivo" TEXT NOT NULL,
    "campana" TEXT NOT NULL,
    "fechaSiembra" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cultivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffUser_username_key" ON "StaffUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Regante_dni_key" ON "Regante"("dni");

-- AddForeignKey
ALTER TABLE "Autoridad" ADD CONSTRAINT "Autoridad_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoDirectivo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TomaDeAgua" ADD CONSTRAINT "TomaDeAgua_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "Canal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcela" ADD CONSTRAINT "Parcela_reganteId_fkey" FOREIGN KEY ("reganteId") REFERENCES "Regante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcela" ADD CONSTRAINT "Parcela_tomaDeAguaId_fkey" FOREIGN KEY ("tomaDeAguaId") REFERENCES "TomaDeAgua"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cultivo" ADD CONSTRAINT "Cultivo_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "Parcela"("id") ON DELETE CASCADE ON UPDATE CASCADE;
