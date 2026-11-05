// Guarda os terrenos no navegador (localStorage). Os dados ficam só neste computador.
const CHAVE = 'campoemdia:terrenos';

export function lerTerrenos() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE) || '[]');
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function salvarTerrenos(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    /* sem espaço ou bloqueado: ignora */
  }
}

export const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const formatarData = (iso) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '';
