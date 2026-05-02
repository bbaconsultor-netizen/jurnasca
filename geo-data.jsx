// SIR Nasca v2 — Geo data (Nasca approx coordinates per canal/sector)
// Center of Nasca city: ~ -14.8290, -74.9320

// Canal traces — polyline points roughly following sectors used in PARCELAS
// Each canal goes from its bocatoma uIni → distributes through its sector → uFin
const CANAL_TRAZAS = {
  // C.U. Aja (north of city, Pampa de Majoro)
  "CAN-01": [[-14.7950,-74.9740],[-14.8120,-74.9760],[-14.8330,-74.9780],[-14.8512,-74.9810],[-14.8588,-74.9835],[-14.8650,-74.9850]],
  "CAN-02": [[-14.8380,-74.9580],[-14.8434,-74.9620],[-14.8478,-74.9655],[-14.8530,-74.9700]],

  // C.U. Tierras Blancas (west / Cahuachi)
  "CAN-03": [[-14.8650,-75.0050],[-14.8800,-75.0180],[-14.8901,-75.0211],[-14.9050,-75.0420],[-14.9112,-75.0455]],
  "CAN-04": [[-14.8830,-75.0150],[-14.8901,-75.0211],[-14.8970,-75.0260]],

  // C.U. Taruga (north / Curvi / Soisongo)
  "CAN-05": [[-14.7700,-74.8850],[-14.7820,-74.8950],[-14.7910,-74.9023],[-14.7860,-74.9050],[-14.7800,-74.9080]],
  "CAN-06": [[-14.7780,-74.8870],[-14.7822,-74.8911],[-14.7860,-74.8950]],

  // C.U. Las Trancas (east / La Banda)
  "CAN-07": [[-14.8050,-74.9300],[-14.8130,-74.9420],[-14.8210,-74.9500],[-14.8260,-74.9530]],
  "CAN-08": [[-14.8200,-74.9490],[-14.8230,-74.9512],[-14.8255,-74.9480],[-14.8268,-74.9525]],

  // C.U. Ingenio (south)
  "CAN-09": [[-14.7700,-74.9000],[-14.7878,-74.9070],[-14.7965,-74.9088],[-14.7995,-74.9105],[-14.8472,-74.9788]],
};

// Approx position for each TOMA (in case it differs from parcela center)
const TOMA_COORDS = {
  "TOM-001": [-14.8120,-74.9760],
  "TOM-002": [-14.8330,-74.9780],
  "TOM-003": [-14.8434,-74.9620],
  "TOM-004": [-14.8830,-75.0150],
  "TOM-005": [-14.9050,-75.0420],
  "TOM-006": [-14.7822,-74.8911],
  "TOM-007": [-14.7910,-74.9023],
  "TOM-008": [-14.8230,-74.9512],
  "TOM-009": [-14.7878,-74.9070],
  "TOM-010": [-14.8588,-74.9835],
};

// Color por comisión
const COMISION_COLOR = {
  "C.U. Aja": "#0E7C66",            // verde-teal
  "C.U. Tierras Blancas": "#B45309", // ámbar oscuro
  "C.U. Taruga": "#1E40AF",         // azul
  "C.U. Las Trancas": "#9333EA",    // violeta
  "C.U. Ingenio": "#DC2626",        // rojo
};

// Parse "lat, lng" string from PARCELAS to [lat,lng]
const parseCoords = (s) => {
  if (!s) return null;
  const parts = s.split(",").map(p => parseFloat(p.trim()));
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts;
};

// Center of Nasca for default
const NASCA_CENTER = [-14.8290, -74.9320];

window.GEODATA = { CANAL_TRAZAS, TOMA_COORDS, COMISION_COLOR, parseCoords, NASCA_CENTER };
