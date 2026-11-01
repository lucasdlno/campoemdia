// Lê a planilha Excel (nosso "banco de dados") e devolve os dados organizados.
import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pastaAtual = path.dirname(fileURLToPath(import.meta.url));

// Caminho da planilha: campoemdia/docs/leis_sorocaba_projeto_agro.xlsx
export const ARQUIVO =
  process.env.EXCEL_PATH ||
  path.resolve(pastaAtual, '../../docs/leis_sorocaba_projeto_agro.xlsx');

// Converte o valor de uma célula em texto simples
function texto(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    if (v.richText) return v.richText.map((t) => t.text).join('').trim();
    if ('result' in v) return texto(v.result);
    if (v.text) return String(v.text).trim();
  }
  return String(v).trim();
}

// Lê uma aba: a linha 3 tem os títulos das colunas e os dados começam na linha 4
function lerAba(wb, nome) {
  const ws = wb.getWorksheet(nome);
  if (!ws) throw new Error(`Aba "${nome}" não encontrada na planilha.`);

  const cabecalho = [];
  ws.getRow(3).eachCell((cell, col) => {
    cabecalho[col] = texto(cell.value);
  });

  const linhas = [];
  ws.eachRow((row, numero) => {
    if (numero < 4) return;
    const obj = {};
    cabecalho.forEach((titulo, col) => {
      if (titulo) obj[titulo] = texto(row.getCell(col).value);
    });
    if (Object.values(obj).some((v) => v !== '')) linhas.push(obj);
  });
  return linhas;
}

const mapearLei = (l) => ({
  esfera: l['Esfera'],
  norma: l['Norma'],
  data: l['Data'],
  assunto: l['Assunto'],
  importancia: l['Por que importa pro projeto'],
  categoria: l['Categoria'],
  orgao: l['Órgão / Responsável'],
  verificacao: l['Verificação'],
});

let cache = null;
let ultimaAlteracao = 0;

// Só relê o arquivo se ele mudou (assim você edita o Excel e atualiza a página)
export async function getDados() {
  try {
    const { mtimeMs } = fs.statSync(ARQUIVO);
    if (cache && mtimeMs === ultimaAlteracao) return cache;

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(ARQUIVO);

    const perguntas = lerAba(wb, 'Perguntas')
      .sort((a, b) => Number(a.ordem) - Number(b.ordem))
      .map((p) => ({
        id: p.id,
        pergunta: p.pergunta,
        ajuda: p.ajuda,
        opcoes: p.opcoes.split(';').map((o) => {
          const [valor, ...resto] = o.split(':');
          return { valor: valor.trim(), rotulo: resto.join(':').trim() };
        }),
      }));

    const regras = lerAba(wb, 'Regras');

    const leis = {
      municipal: lerAba(wb, 'Leis Municipais').map(mapearLei),
      estadual: lerAba(wb, 'Estaduais SP').map(mapearLei),
      federal: lerAba(wb, 'Federais').map(mapearLei),
    };

    cache = { perguntas, regras, leis };
    ultimaAlteracao = mtimeMs;
    return cache;
  } catch (erro) {
    // Se o Excel estiver aberto/bloqueado, usa a última leitura que deu certo
    if (cache) return cache;
    throw erro;
  }
}
