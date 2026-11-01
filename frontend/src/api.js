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

export const getPerguntas = () => pedir('/api/perguntas');
export const getLeis = () => pedir('/api/leis');
export const getClima = () => pedir('/api/clima');
export const avaliar = (respostas) =>
  pedir('/api/avaliar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respostas }),
  });
