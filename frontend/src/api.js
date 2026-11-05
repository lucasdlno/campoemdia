// Funções que conversam com o back-end. O Vite redireciona "/api" para a porta 3000.
async function pedir(url, opcoes) {
  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch {
    throw new Error('Não consegui falar com o servidor. Confira se o back-end está rodando.');
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Algo deu errado. Tente de novo.');
  return dados;
}

const q = encodeURIComponent;

export const getCidades = () => pedir('/api/cidades');
export const getPerguntas = () => pedir('/api/perguntas');
export const getLeis = (cidade = 'todas') => pedir(`/api/leis?cidade=${q(cidade)}`);
export const getClima = (cidade) => pedir(`/api/clima?cidade=${q(cidade)}`);
export const avaliar = (payload) =>
  pedir('/api/avaliar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
