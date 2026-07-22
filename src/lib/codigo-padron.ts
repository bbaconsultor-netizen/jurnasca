const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I, para evitar confusiones al leerlo en papel

export function generarCodigoPadron(): string {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}
