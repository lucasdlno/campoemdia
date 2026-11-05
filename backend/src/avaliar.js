// Decide quais documentos são necessários e quais informações valem para o tamanho do terreno.
const ORDEM_ESFERA = { Municipal: 1, Estadual: 2, Federal: 3 };

const fmt = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const num = (v) => (v === '' || v === undefined || v === null ? null : Number(v));

// A regra vale para esta cidade? (todas | nome da cidade | outras = qualquer uma que não seja Sorocaba)
function valeParaCidade(regraCidade, cidade) {
  const c = (regraCidade || 'todas').trim().toLowerCase();
  if (c === 'todas') return true;
  if (c === 'outras') return cidade.toLowerCase() !== 'sorocaba';
  return c === cidade.toLowerCase();
}

export function infoTamanho(regrasTamanho, areaHa, moduloFiscalHa) {
  if (!(areaHa > 0)) return null;

  const modulos = moduloFiscalHa > 0 ? areaHa / moduloFiscalHa : null;
  const reservaLegalHa = areaHa * 0.2;
  let faltaModulo = false;
  const informacoes = [];

  for (const r of regrasTamanho) {
    const minHa = num(r.min_ha);
    const maxHa = num(r.max_ha);
    const minMod = num(r.min_modulos);
    const maxMod = num(r.max_modulos);

    if (minHa !== null && areaHa < minHa) continue;
    if (maxHa !== null && areaHa > maxHa) continue;
    if (minMod !== null || maxMod !== null) {
      if (modulos === null) {
        faltaModulo = true;
        continue;
      }
      if (minMod !== null && modulos < minMod) continue;
      if (maxMod !== null && modulos > maxMod) continue;
    }

    informacoes.push({
      id: r.id,
      titulo: r.titulo,
      descricao: r.descricao
        .replaceAll('{area_ha}', fmt(areaHa))
        .replaceAll('{rl_ha}', fmt(reservaLegalHa))
        .replaceAll('{modulos}', modulos === null ? '' : fmt(modulos)),
      baseLegal: r.base_legal,
      verificacao: r.verificacao,
    });
  }

  let classe = null;
  if (modulos !== null) {
    classe = modulos <= 4 ? 'Pequena propriedade' : modulos <= 15 ? 'Média propriedade' : 'Grande propriedade';
  }

  return { areaHa, moduloFiscalHa: moduloFiscalHa || null, modulos, classe, reservaLegalHa, informacoes, faltaModulo };
}

export function avaliar({ regras, regrasTamanho, perguntas, cidade, respostas, areaHa, moduloFiscalHa }) {
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
    if (!valeParaCidade(r.cidade, cidade)) continue;

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

  const porEsfera = (a, b) => (ORDEM_ESFERA[a.esfera] || 9) - (ORDEM_ESFERA[b.esfera] || 9);
  necessarios.sort(porEsfera);
  naoNecessarios.sort(porEsfera);

  return {
    necessarios,
    naoNecessarios,
    tamanho: infoTamanho(regrasTamanho, Number(areaHa), Number(moduloFiscalHa)),
  };
}
