// Cálculos de área e perímetro a partir de pontos [[lat, lng], ...]
const R = 6378137; // raio da Terra em metros
const rad = (g) => (g * Math.PI) / 180;

// Área em m² (fórmula esférica, a mesma usada por bibliotecas de mapa)
export function areaM2(pontos) {
  const n = pontos.length;
  if (n < 3) return 0;
  let soma = 0;
  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = pontos[i];
    const [lat2, lng2] = pontos[(i + 1) % n];
    soma += rad(lng2 - lng1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((soma * R * R) / 2);
}

export const areaHa = (pontos) => areaM2(pontos) / 10000;

// Distância entre dois pontos em metros (haversine)
function distancia([lat1, lng1], [lat2, lng2]) {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Perímetro em metros (fecha o polígono quando há 3 pontos ou mais)
export function perimetro(pontos) {
  const n = pontos.length;
  if (n < 2) return 0;
  let total = 0;
  for (let i = 0; i < n - 1; i++) total += distancia(pontos[i], pontos[i + 1]);
  if (n >= 3) total += distancia(pontos[n - 1], pontos[0]);
  return total;
}

export const formatarHa = (ha) =>
  Number(ha || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export const formatarMetros = (m) =>
  m >= 1000
    ? `${(m / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} km`
    : `${Math.round(m).toLocaleString('pt-BR')} m`;
