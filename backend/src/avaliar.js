// Decide quais documentos são necessários, com base nas respostas e nas regras do Excel.
const ORDEM_ESFERA = { Municipal: 1, Estadual: 2, Federal: 3 };

export function avaliar(regras, perguntas, respostas) {
  if (!respostas || typeof respostas !== 'object') {
    return { erro: 'Envie as respostas do questionário.' };
  }

  // Confere se todas as perguntas foram respondidas com uma opção válida
  for (const p of perguntas) {
    const valor = respostas[p.id];
    if (!valor) return { erro: `Falta responder: ${p.pergunta}` };
    if (!p.opcoes.some((o) => o.valor === valor)) {
      return { erro: `Resposta inválida para: ${p.pergunta}` };
    }
  }

  const necessarios = [];
  const naoNecessarios = [];

  for (const r of regras) {
    const valores = r.valores.split('|').map((v) => v.trim());
    const aplica = r.campo === 'sempre' || valores.includes(respostas[r.campo]);

    const item = {
      id: r.id,
      documento: r.documento,
      esfera: r.esfera,
      orgao: r.orgao,
      baseLegal: r.base_legal,
      descricao: r.descricao,
      verificacao: r.verificacao,
      motivo: aplica ? r.motivo_sim : r.motivo_nao,
    };
    (aplica ? necessarios : naoNecessarios).push(item);
  }

  const porEsfera = (a, b) =>
    (ORDEM_ESFERA[a.esfera] || 9) - (ORDEM_ESFERA[b.esfera] || 9);
  necessarios.sort(porEsfera);
  naoNecessarios.sort(porEsfera);

  return { necessarios, naoNecessarios };
}
