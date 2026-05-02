// SIR Nasca — Sample data (small set: ~16 regantes, realistic Nasca context)

const COMISIONES = [
  "C.U. Aja",
  "C.U. Tierras Blancas",
  "C.U. Taruga",
  "C.U. Las Trancas",
  "C.U. Ingenio",
];

const COMITES = [
  "Comité Pampa de Majoro",
  "Comité Cantayo",
  "Comité San Carlos",
  "Comité Cahuachi",
  "Comité Curvi",
  "Comité Soisongo",
  "Comité La Banda",
];

const CULTIVOS = ["Pallar", "Algodón", "Espárrago", "Vid (uva)", "Pecano", "Maíz amarillo", "Cebolla", "Palto"];

const REGANTES = [
  { codigo: "REG-0001", dni: "21534812", nombres: "Juan Esteban", apellidos: "Quispe Mendoza", razonSocial: "", telefono: "956 234 891", correo: "j.quispe@nasca.pe", direccion: "Av. Los Incas 423, Nasca", comision: "C.U. Aja", comite: "Comité Pampa de Majoro", estado: "Activo", obs: "Riega por turnos lunes y jueves." },
  { codigo: "REG-0002", dni: "20451223", nombres: "María Isabel", apellidos: "Huamán Pérez", razonSocial: "", telefono: "987 112 034", correo: "m.huaman@gmail.com", direccion: "Calle Lima 88, Nasca", comision: "C.U. Aja", comite: "Comité Cantayo", estado: "Activo", obs: "" },
  { codigo: "REG-0003", dni: "20445678", nombres: "Carlos Alberto", apellidos: "Chumpitaz Soto", razonSocial: "", telefono: "942 877 651", correo: "", direccion: "Sector Cantayo s/n", comision: "C.U. Aja", comite: "Comité Cantayo", estado: "Activo", obs: "Adeuda 2 cuotas." },
  { codigo: "REG-0004", dni: "20533145", nombres: "Rosa Elvira", apellidos: "Tincopa Ramos", razonSocial: "", telefono: "955 002 119", correo: "rosa.tincopa@hotmail.com", direccion: "Jr. Bolognesi 312, Nasca", comision: "C.U. Tierras Blancas", comite: "Comité San Carlos", estado: "Activo", obs: "" },
  { codigo: "REG-0005", dni: "10567223", nombres: "Pedro", apellidos: "Anicama Llerena", razonSocial: "", telefono: "934 556 008", correo: "", direccion: "Anexo Cahuachi km 14", comision: "C.U. Tierras Blancas", comite: "Comité Cahuachi", estado: "Activo", obs: "" },
  { codigo: "REG-0006", dni: "20611232", nombres: "Lucía", apellidos: "Vargas Ñahui", razonSocial: "", telefono: "961 233 877", correo: "lvargas@correo.pe", direccion: "Calle Tacna 145", comision: "C.U. Taruga", comite: "Comité Curvi", estado: "Activo", obs: "Coordinadora de comité." },
  { codigo: "REG-0007", dni: "", nombres: "", apellidos: "", razonSocial: "Agroindustrias Nasca Sur S.A.C.", telefono: "(056) 522 134", correo: "contacto@agronascasur.pe", direccion: "Panamericana Sur Km 446", comision: "C.U. Taruga", comite: "Comité Soisongo", estado: "Activo", obs: "RUC 20531122889 — predio grande, 3 parcelas." },
  { codigo: "REG-0008", dni: "20488771", nombres: "José Manuel", apellidos: "Cabrera Linares", razonSocial: "", telefono: "923 008 432", correo: "", direccion: "Calle Callao 76", comision: "C.U. Las Trancas", comite: "Comité La Banda", estado: "Activo", obs: "" },
  { codigo: "REG-0009", dni: "20512983", nombres: "Hilda", apellidos: "Mendoza Carbajal", razonSocial: "", telefono: "977 651 234", correo: "hilda.m@nasca.gob.pe", direccion: "Av. María Reiche 234", comision: "C.U. Las Trancas", comite: "Comité La Banda", estado: "Activo", obs: "Mora antigua 2024." },
  { codigo: "REG-0010", dni: "20498123", nombres: "Víctor Raúl", apellidos: "Salazar Inga", razonSocial: "", telefono: "999 123 008", correo: "", direccion: "Sector Soisongo", comision: "C.U. Ingenio", comite: "Comité Soisongo", estado: "Activo", obs: "" },
  { codigo: "REG-0011", dni: "20523114", nombres: "Elena", apellidos: "Pacheco Ramos", razonSocial: "", telefono: "948 332 116", correo: "elena.p@gmail.com", direccion: "Calle Arequipa 412", comision: "C.U. Ingenio", comite: "Comité Pampa de Majoro", estado: "Activo", obs: "" },
  { codigo: "REG-0012", dni: "20471009", nombres: "Mario", apellidos: "Roca Quintanilla", razonSocial: "", telefono: "956 887 023", correo: "", direccion: "Anexo Curvi s/n", comision: "C.U. Taruga", comite: "Comité Curvi", estado: "Inactivo", obs: "Predio transferido en 2023." },
  { codigo: "REG-0013", dni: "20534477", nombres: "Yolanda", apellidos: "Inga Espinoza", razonSocial: "", telefono: "936 220 941", correo: "yolanda.i@nasca.pe", direccion: "Calle Grau 188", comision: "C.U. Aja", comite: "Comité Pampa de Majoro", estado: "Activo", obs: "" },
  { codigo: "REG-0014", dni: "", nombres: "", apellidos: "", razonSocial: "Cooperativa Agraria San Javier Ltda.", telefono: "(056) 521 998", correo: "admin@coopsanjavier.pe", direccion: "Carretera a Cahuachi km 8", comision: "C.U. Tierras Blancas", comite: "Comité Cahuachi", estado: "Activo", obs: "RUC 20498772341." },
  { codigo: "REG-0015", dni: "20445002", nombres: "Aurelio", apellidos: "Ñañez Choque", razonSocial: "", telefono: "942 117 553", correo: "", direccion: "Sector La Banda 22", comision: "C.U. Las Trancas", comite: "Comité La Banda", estado: "Activo", obs: "" },
  { codigo: "REG-0016", dni: "20529988", nombres: "Catalina", apellidos: "Ramírez Vela", razonSocial: "", telefono: "988 776 211", correo: "catalina.r@correo.pe", direccion: "Jr. Junín 99", comision: "C.U. Ingenio", comite: "Comité Soisongo", estado: "Activo", obs: "" },
];

// Display name helper
const nameOf = (r) => r.razonSocial || `${r.nombres} ${r.apellidos}`.trim();

const CANALES = [
  { codigo: "CAN-01", nombre: "Canal Madre Aja", tipo: "Principal", comision: "C.U. Aja", longitud: 12.4, caudalMax: 2.8, estado: "Operativo", uIni: "Bocatoma Aja", uFin: "Pampa de Majoro", obs: "Revestido en tramo inicial." },
  { codigo: "CAN-02", nombre: "Lateral Cantayo", tipo: "Lateral", comision: "C.U. Aja", longitud: 4.6, caudalMax: 0.9, estado: "Operativo", uIni: "Toma Cantayo", uFin: "Sector Cantayo Bajo", obs: "" },
  { codigo: "CAN-03", nombre: "Canal Tierras Blancas", tipo: "Principal", comision: "C.U. Tierras Blancas", longitud: 9.8, caudalMax: 2.1, estado: "Operativo", uIni: "Bocatoma TB", uFin: "Cahuachi", obs: "Sedimentación reciente." },
  { codigo: "CAN-04", nombre: "Secundario San Carlos", tipo: "Secundario", comision: "C.U. Tierras Blancas", longitud: 5.2, caudalMax: 1.1, estado: "Mantenimiento", uIni: "Partidor San Carlos", uFin: "Predios San Carlos", obs: "Limpieza programada 12/05." },
  { codigo: "CAN-05", nombre: "Canal Taruga", tipo: "Principal", comision: "C.U. Taruga", longitud: 11.1, caudalMax: 2.4, estado: "Operativo", uIni: "Bocatoma Taruga", uFin: "Soisongo", obs: "" },
  { codigo: "CAN-06", nombre: "Acequia Curvi", tipo: "Acequia", comision: "C.U. Taruga", longitud: 2.8, caudalMax: 0.4, estado: "Operativo", uIni: "Toma Curvi", uFin: "Anexo Curvi", obs: "" },
  { codigo: "CAN-07", nombre: "Canal Las Trancas", tipo: "Principal", comision: "C.U. Las Trancas", longitud: 10.6, caudalMax: 2.2, estado: "Operativo", uIni: "Bocatoma Trancas", uFin: "La Banda", obs: "" },
  { codigo: "CAN-08", nombre: "Lateral La Banda", tipo: "Lateral", comision: "C.U. Las Trancas", longitud: 3.4, caudalMax: 0.7, estado: "Operativo", uIni: "Partidor La Banda", uFin: "Predios La Banda", obs: "" },
  { codigo: "CAN-09", nombre: "Canal Ingenio", tipo: "Principal", comision: "C.U. Ingenio", longitud: 13.2, caudalMax: 3.0, estado: "Operativo", uIni: "Bocatoma Ingenio", uFin: "Soisongo Norte", obs: "" },
];

const TOMAS = [
  { codigo: "TOM-001", nombre: "Toma Aja-1", canal: "CAN-01", comision: "C.U. Aja", comite: "Comité Pampa de Majoro", ubicacion: "Km 2.4 Canal Aja", caudalAut: 0.42, caudalMed: 0.40, fechaMed: "2026-04-22", responsable: "Ing. R. Castillo", estado: "Operativo", obs: "" },
  { codigo: "TOM-002", nombre: "Toma Aja-2", canal: "CAN-01", comision: "C.U. Aja", comite: "Comité Pampa de Majoro", ubicacion: "Km 5.1 Canal Aja", caudalAut: 0.38, caudalMed: 0.31, fechaMed: "2026-04-22", responsable: "Ing. R. Castillo", estado: "Operativo", obs: "Caudal por debajo del autorizado." },
  { codigo: "TOM-003", nombre: "Toma Cantayo", canal: "CAN-02", comision: "C.U. Aja", comite: "Comité Cantayo", ubicacion: "Inicio lateral Cantayo", caudalAut: 0.55, caudalMed: 0.54, fechaMed: "2026-04-20", responsable: "Téc. M. Llerena", estado: "Operativo", obs: "" },
  { codigo: "TOM-004", nombre: "Toma San Carlos", canal: "CAN-04", comision: "C.U. Tierras Blancas", comite: "Comité San Carlos", ubicacion: "Partidor San Carlos", caudalAut: 0.48, caudalMed: 0.22, fechaMed: "2026-04-19", responsable: "Téc. M. Llerena", estado: "Mantenimiento", obs: "Compuerta dañada." },
  { codigo: "TOM-005", nombre: "Toma Cahuachi", canal: "CAN-03", comision: "C.U. Tierras Blancas", comite: "Comité Cahuachi", ubicacion: "Km 7.0 Canal TB", caudalAut: 0.62, caudalMed: 0.60, fechaMed: "2026-04-25", responsable: "Ing. R. Castillo", estado: "Operativo", obs: "" },
  { codigo: "TOM-006", nombre: "Toma Curvi", canal: "CAN-06", comision: "C.U. Taruga", comite: "Comité Curvi", ubicacion: "Toma Curvi", caudalAut: 0.30, caudalMed: 0.28, fechaMed: "2026-04-21", responsable: "Téc. J. Quispe", estado: "Operativo", obs: "" },
  { codigo: "TOM-007", nombre: "Toma Soisongo", canal: "CAN-05", comision: "C.U. Taruga", comite: "Comité Soisongo", ubicacion: "Km 8.2 Canal Taruga", caudalAut: 0.50, caudalMed: 0.48, fechaMed: "2026-04-24", responsable: "Ing. R. Castillo", estado: "Operativo", obs: "" },
  { codigo: "TOM-008", nombre: "Toma La Banda", canal: "CAN-08", comision: "C.U. Las Trancas", comite: "Comité La Banda", ubicacion: "Partidor La Banda", caudalAut: 0.44, caudalMed: 0.36, fechaMed: "2026-04-18", responsable: "Téc. J. Quispe", estado: "Operativo", obs: "Solicitud de aumento." },
  { codigo: "TOM-009", nombre: "Toma Ingenio-1", canal: "CAN-09", comision: "C.U. Ingenio", comite: "Comité Soisongo", ubicacion: "Km 4.0 Canal Ingenio", caudalAut: 0.58, caudalMed: 0.57, fechaMed: "2026-04-26", responsable: "Téc. M. Llerena", estado: "Operativo", obs: "" },
  { codigo: "TOM-010", nombre: "Toma Pampa de Majoro", canal: "CAN-01", comision: "C.U. Aja", comite: "Comité Pampa de Majoro", ubicacion: "Km 9.5 Canal Aja", caudalAut: 0.40, caudalMed: 0.39, fechaMed: "2026-04-23", responsable: "Téc. J. Quispe", estado: "Operativo", obs: "" },
];

const PARCELAS = [
  { codigo: "PAR-0001", reganteCod: "REG-0001", predio: "Fundo Las Lomas", ubicacion: "Sector Pampa de Majoro", sector: "Pampa de Majoro", comision: "C.U. Aja", comite: "Comité Pampa de Majoro", areaTotal: 4.2, areaRiego: 3.8, ucat: "12-345-A", cultivo: "Pallar", canal: "CAN-01", toma: "TOM-001", coords: "-14.8512, -74.9810", estado: "Activa", obs: "" },
  { codigo: "PAR-0002", reganteCod: "REG-0001", predio: "Anexo Las Lomas", ubicacion: "Pampa de Majoro Sur", sector: "Pampa de Majoro", comision: "C.U. Aja", comite: "Comité Pampa de Majoro", areaTotal: 1.8, areaRiego: 1.6, ucat: "12-345-B", cultivo: "Algodón", canal: "CAN-01", toma: "TOM-010", coords: "-14.8588, -74.9835", estado: "Activa", obs: "" },
  { codigo: "PAR-0003", reganteCod: "REG-0002", predio: "Fundo San Antonio", ubicacion: "Cantayo Alto", sector: "Cantayo", comision: "C.U. Aja", comite: "Comité Cantayo", areaTotal: 2.4, areaRiego: 2.2, ucat: "13-110-C", cultivo: "Vid (uva)", canal: "CAN-02", toma: "TOM-003", coords: "-14.8434, -74.9620", estado: "Activa", obs: "" },
  { codigo: "PAR-0004", reganteCod: "REG-0003", predio: "Predio La Esperanza", ubicacion: "Cantayo Bajo", sector: "Cantayo", comision: "C.U. Aja", comite: "Comité Cantayo", areaTotal: 3.1, areaRiego: 2.9, ucat: "13-112-A", cultivo: "Algodón", canal: "CAN-02", toma: "TOM-003", coords: "-14.8478, -74.9655", estado: "Activa", obs: "" },
  { codigo: "PAR-0005", reganteCod: "REG-0004", predio: "Fundo San Carlos", ubicacion: "San Carlos", sector: "San Carlos", comision: "C.U. Tierras Blancas", comite: "Comité San Carlos", areaTotal: 5.6, areaRiego: 5.0, ucat: "14-201-A", cultivo: "Espárrago", canal: "CAN-04", toma: "TOM-004", coords: "-14.8901, -75.0211", estado: "Activa", obs: "" },
  { codigo: "PAR-0006", reganteCod: "REG-0005", predio: "Anexo Cahuachi", ubicacion: "Cahuachi km 14", sector: "Cahuachi", comision: "C.U. Tierras Blancas", comite: "Comité Cahuachi", areaTotal: 2.0, areaRiego: 1.8, ucat: "14-220-D", cultivo: "Pallar", canal: "CAN-03", toma: "TOM-005", coords: "-14.9112, -75.0455", estado: "Activa", obs: "" },
  { codigo: "PAR-0007", reganteCod: "REG-0006", predio: "Fundo Curvi", ubicacion: "Curvi", sector: "Curvi", comision: "C.U. Taruga", comite: "Comité Curvi", areaTotal: 3.4, areaRiego: 3.2, ucat: "15-300-A", cultivo: "Pecano", canal: "CAN-06", toma: "TOM-006", coords: "-14.7822, -74.8911", estado: "Activa", obs: "" },
  { codigo: "PAR-0008", reganteCod: "REG-0007", predio: "Fundo Soisongo", ubicacion: "Soisongo", sector: "Soisongo", comision: "C.U. Taruga", comite: "Comité Soisongo", areaTotal: 12.5, areaRiego: 11.8, ucat: "15-310-A", cultivo: "Espárrago", canal: "CAN-05", toma: "TOM-007", coords: "-14.7910, -74.9023", estado: "Activa", obs: "Predio mayor." },
  { codigo: "PAR-0009", reganteCod: "REG-0007", predio: "Soisongo II", ubicacion: "Soisongo Norte", sector: "Soisongo", comision: "C.U. Taruga", comite: "Comité Soisongo", areaTotal: 8.4, areaRiego: 8.0, ucat: "15-310-B", cultivo: "Vid (uva)", canal: "CAN-05", toma: "TOM-007", coords: "-14.7860, -74.9050", estado: "Activa", obs: "" },
  { codigo: "PAR-0010", reganteCod: "REG-0007", predio: "Soisongo III", ubicacion: "Soisongo Sur", sector: "Soisongo", comision: "C.U. Ingenio", comite: "Comité Soisongo", areaTotal: 6.2, areaRiego: 5.8, ucat: "15-310-C", cultivo: "Palto", canal: "CAN-09", toma: "TOM-009", coords: "-14.7965, -74.9088", estado: "Activa", obs: "" },
  { codigo: "PAR-0011", reganteCod: "REG-0008", predio: "Predio La Banda", ubicacion: "La Banda", sector: "La Banda", comision: "C.U. Las Trancas", comite: "Comité La Banda", areaTotal: 1.6, areaRiego: 1.4, ucat: "16-401-A", cultivo: "Maíz amarillo", canal: "CAN-08", toma: "TOM-008", coords: "-14.8230, -74.9512", estado: "Activa", obs: "" },
  { codigo: "PAR-0012", reganteCod: "REG-0009", predio: "Fundo Mendoza", ubicacion: "La Banda Sur", sector: "La Banda", comision: "C.U. Las Trancas", comite: "Comité La Banda", areaTotal: 2.8, areaRiego: 2.5, ucat: "16-401-B", cultivo: "Cebolla", canal: "CAN-08", toma: "TOM-008", coords: "-14.8255, -74.9480", estado: "Activa", obs: "" },
  { codigo: "PAR-0013", reganteCod: "REG-0010", predio: "Anexo Soisongo", ubicacion: "Soisongo Centro", sector: "Soisongo", comision: "C.U. Ingenio", comite: "Comité Soisongo", areaTotal: 2.2, areaRiego: 2.0, ucat: "17-501-A", cultivo: "Pallar", canal: "CAN-09", toma: "TOM-009", coords: "-14.7995, -74.9105", estado: "Activa", obs: "" },
  { codigo: "PAR-0014", reganteCod: "REG-0011", predio: "Fundo Pacheco", ubicacion: "Pampa de Majoro Norte", sector: "Pampa de Majoro", comision: "C.U. Ingenio", comite: "Comité Pampa de Majoro", areaTotal: 1.9, areaRiego: 1.8, ucat: "17-510-A", cultivo: "Algodón", canal: "CAN-09", toma: "TOM-009", coords: "-14.8472, -74.9788", estado: "Activa", obs: "" },
  { codigo: "PAR-0015", reganteCod: "REG-0013", predio: "Predio Inga", ubicacion: "Pampa de Majoro Este", sector: "Pampa de Majoro", comision: "C.U. Aja", comite: "Comité Pampa de Majoro", areaTotal: 2.6, areaRiego: 2.4, ucat: "12-345-D", cultivo: "Vid (uva)", canal: "CAN-01", toma: "TOM-002", coords: "-14.8530, -74.9750", estado: "Activa", obs: "" },
  { codigo: "PAR-0016", reganteCod: "REG-0014", predio: "Fundo Coop. San Javier", ubicacion: "Cahuachi", sector: "Cahuachi", comision: "C.U. Tierras Blancas", comite: "Comité Cahuachi", areaTotal: 18.0, areaRiego: 16.5, ucat: "14-220-A", cultivo: "Espárrago", canal: "CAN-03", toma: "TOM-005", coords: "-14.9085, -75.0488", estado: "Activa", obs: "Predio cooperativo." },
  { codigo: "PAR-0017", reganteCod: "REG-0015", predio: "Predio Ñañez", ubicacion: "La Banda Oeste", sector: "La Banda", comision: "C.U. Las Trancas", comite: "Comité La Banda", areaTotal: 1.2, areaRiego: 1.1, ucat: "16-401-C", cultivo: "Maíz amarillo", canal: "CAN-08", toma: "TOM-008", coords: "-14.8268, -74.9525", estado: "Activa", obs: "" },
  { codigo: "PAR-0018", reganteCod: "REG-0016", predio: "Fundo Soisongo Norte", ubicacion: "Soisongo Norte", sector: "Soisongo", comision: "C.U. Ingenio", comite: "Comité Soisongo", areaTotal: 3.0, areaRiego: 2.8, ucat: "17-512-A", cultivo: "Palto", canal: "CAN-09", toma: "TOM-009", coords: "-14.7878, -74.9070", estado: "Activa", obs: "" },
];

const CONCEPTOS = [
  { codigo: "TAR", nombre: "Tarifa de agua 2026 - I", monto: 145 },
  { codigo: "CTA", nombre: "Cuota de comisión", monto: 50 },
  { codigo: "MTO", nombre: "Mantenimiento canal", monto: 80 },
  { codigo: "CER", nombre: "Certificado", monto: 25 },
];

const DEUDAS = [
  { id: "DEU-2026-0001", reganteCod: "REG-0003", concepto: "Tarifa de agua 2026 - I", periodo: "2026-I", monto: 290.00, mora: 14.50, descuento: 0, total: 304.50, estado: "Pendiente", emision: "2026-03-15" },
  { id: "DEU-2026-0002", reganteCod: "REG-0009", concepto: "Tarifa de agua 2026 - I", periodo: "2026-I", monto: 245.00, mora: 22.05, descuento: 0, total: 267.05, estado: "Vencida", emision: "2026-02-28" },
  { id: "DEU-2026-0003", reganteCod: "REG-0008", concepto: "Cuota de comisión", periodo: "2026-I", monto: 50.00, mora: 0, descuento: 0, total: 50.00, estado: "Pendiente", emision: "2026-04-01" },
  { id: "DEU-2026-0004", reganteCod: "REG-0010", concepto: "Mantenimiento canal", periodo: "2026-I", monto: 80.00, mora: 0, descuento: 0, total: 80.00, estado: "Pendiente", emision: "2026-04-10" },
  { id: "DEU-2026-0005", reganteCod: "REG-0011", concepto: "Tarifa de agua 2026 - I", periodo: "2026-I", monto: 158.00, mora: 0, descuento: 0, total: 158.00, estado: "Pendiente", emision: "2026-04-12" },
  { id: "DEU-2026-0006", reganteCod: "REG-0005", concepto: "Tarifa de agua 2026 - I", periodo: "2026-I", monto: 178.00, mora: 8.90, descuento: 0, total: 186.90, estado: "Vencida", emision: "2026-03-05" },
  { id: "DEU-2026-0007", reganteCod: "REG-0015", concepto: "Cuota de comisión", periodo: "2026-I", monto: 50.00, mora: 0, descuento: 0, total: 50.00, estado: "Pendiente", emision: "2026-04-15" },
];

const PAGOS = [
  { id: "PAG-2026-0140", reganteCod: "REG-0001", deuda: "DEU-2026-0010", monto: 420.00, medio: "Transferencia BCP", fecha: "2026-04-28 11:24", recibo: "RC-2026-0140", usuario: "tesoreria01", obs: "" },
  { id: "PAG-2026-0139", reganteCod: "REG-0002", deuda: "DEU-2026-0008", monto: 245.00, medio: "Efectivo", fecha: "2026-04-28 09:50", recibo: "RC-2026-0139", usuario: "tesoreria01", obs: "" },
  { id: "PAG-2026-0138", reganteCod: "REG-0007", deuda: "DEU-2026-0011", monto: 1450.00, medio: "Transferencia Interbank", fecha: "2026-04-27 16:08", recibo: "RC-2026-0138", usuario: "admin", obs: "Pago consolidado." },
  { id: "PAG-2026-0137", reganteCod: "REG-0014", deuda: "DEU-2026-0012", monto: 980.00, medio: "Depósito", fecha: "2026-04-27 10:33", recibo: "RC-2026-0137", usuario: "tesoreria01", obs: "" },
  { id: "PAG-2026-0136", reganteCod: "REG-0006", deuda: "DEU-2026-0007", monto: 195.00, medio: "Yape", fecha: "2026-04-26 14:11", recibo: "RC-2026-0136", usuario: "tesoreria01", obs: "" },
  { id: "PAG-2026-0135", reganteCod: "REG-0013", deuda: "DEU-2026-0009", monto: 175.00, medio: "Efectivo", fecha: "2026-04-26 09:20", recibo: "RC-2026-0135", usuario: "tesoreria01", obs: "" },
  { id: "PAG-2026-0134", reganteCod: "REG-0016", deuda: "DEU-2026-0013", monto: 140.00, medio: "Plin", fecha: "2026-04-25 17:42", recibo: "RC-2026-0134", usuario: "tesoreria01", obs: "" },
  { id: "PAG-2026-0133", reganteCod: "REG-0004", deuda: "DEU-2026-0014", monto: 380.00, medio: "Transferencia BCP", fecha: "2026-04-25 11:08", recibo: "RC-2026-0133", usuario: "admin", obs: "" },
];

const ROLES = [
  { id: "admin", name: "Ana Castillo", role: "Administrador", desc: "Acceso total al sistema", initials: "AC" },
  { id: "padron", name: "Luis Mendoza", role: "Padrón", desc: "Gestión de regantes y parcelas", initials: "LM" },
  { id: "tecnico", name: "Rocío Castillo", role: "Área Técnica", desc: "Canales, tomas y mediciones", initials: "RC" },
  { id: "tesoreria", name: "Pedro Salinas", role: "Tesorería", desc: "Pagos, deudas y recibos", initials: "PS" },
  { id: "consulta", name: "Inés Vela", role: "Consulta", desc: "Solo lectura", initials: "IV" },
];

const ALERTAS = [
  { tipo: "danger", titulo: "Caudal bajo en Toma San Carlos", desc: "Medido 0.22 m³/s vs autorizado 0.48 m³/s", tiempo: "hace 3 días" },
  { tipo: "warning", titulo: "Compuerta dañada — TOM-004", desc: "Mantenimiento programado 12/05", tiempo: "hace 4 días" },
  { tipo: "warning", titulo: "Caudal bajo en Toma Aja-2", desc: "Medido 0.31 m³/s vs autorizado 0.38 m³/s", tiempo: "hace 6 días" },
  { tipo: "info", titulo: "7 regantes con deuda vencida", desc: "Total acumulado S/ 1,096.45", tiempo: "hoy" },
];

// Recaudación mensual (últimos 12 meses, S/)
const RECAUDACION_MENSUAL = [
  { mes: "May 25", monto: 18420 }, { mes: "Jun 25", monto: 21840 },
  { mes: "Jul 25", monto: 19560 }, { mes: "Ago 25", monto: 22300 },
  { mes: "Sep 25", monto: 24100 }, { mes: "Oct 25", monto: 26450 },
  { mes: "Nov 25", monto: 25980 }, { mes: "Dic 25", monto: 19800 },
  { mes: "Ene 26", monto: 21240 }, { mes: "Feb 26", monto: 23770 },
  { mes: "Mar 26", monto: 28910 }, { mes: "Abr 26", monto: 31450 },
];

const MOROSIDAD = [
  { rango: "1-30 días", count: 4, monto: 478.00, color: "var(--warning)" },
  { rango: "31-60 días", count: 2, monto: 453.95, color: "#D97706" },
  { rango: "60+ días", count: 1, monto: 267.05, color: "var(--danger)" },
];

const ACTIVIDAD = [
  { tipo: "pago", titulo: "Pago registrado", desc: "REG-0001 · Juan Quispe — S/ 420.00", tiempo: "hace 12 min", icon: "money" },
  { tipo: "pago", titulo: "Pago registrado", desc: "REG-0002 · María Huamán — S/ 245.00", tiempo: "hace 1 h", icon: "money" },
  { tipo: "medicion", titulo: "Medición de caudal", desc: "TOM-009 · 0.57 m³/s — Téc. M. Llerena", tiempo: "hace 2 h", icon: "drop" },
  { tipo: "pago", titulo: "Pago registrado", desc: "REG-0007 · Agroindustrias Nasca Sur — S/ 1,450.00", tiempo: "ayer", icon: "money" },
  { tipo: "regante", titulo: "Regante actualizado", desc: "REG-0014 · Coop. San Javier", tiempo: "ayer", icon: "user" },
  { tipo: "medicion", titulo: "Medición de caudal", desc: "TOM-005 · 0.60 m³/s — Ing. R. Castillo", tiempo: "hace 2 días", icon: "drop" },
];

window.SIRDATA = {
  REGANTES, PARCELAS, CANALES, TOMAS, COMISIONES, COMITES, CULTIVOS,
  CONCEPTOS, DEUDAS, PAGOS, ROLES, ALERTAS, RECAUDACION_MENSUAL, MOROSIDAD, ACTIVIDAD,
  nameOf,
};
