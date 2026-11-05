import express from 'express';
import cors from 'cors';
import { getDados } from './src/excel.js';
import { avaliar } from './src/avaliar.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Evita repetir try/catch em cada rota
const rota = (fn) => (req, res) =>
  fn(req, res).catch((erro) => {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao ler a planilha de dados.' });
  });

const achaCidade = (cidades, nome) =>
  cidades.find((c) => c.nome.toLowerCase() === String(nome || 'Sorocaba').toLowerCase());

app.get('/api/saude', (_req, res) => res.json({ ok: true }));

// Cidades atendidas (aba "Cidades")
app.get('/api/cidades', rota(async (_req, res) => {
  const { cidades } = await getDados();
  res.json(cidades);
}));

// Perguntas do questionário (aba "Perguntas")
app.get('/api/perguntas', rota(async (_req, res) => {
  const { perguntas } = await getDados();
  res.json(perguntas);
}));

// Recebe cidade, respostas e (opcional) a área do terreno
app.post('/api/avaliar', rota(async (req, res) => {
  const dados = await getDados();
  const { cidade, respostas, areaHa, moduloFiscalHa } = req.body || {};
  const c = achaCidade(dados.cidades, cidade);
  if (!c) return res.status(400).json({ erro: 'Cidade não encontrada.' });

  const resultado = avaliar({
    regras: dados.regras,
    regrasTamanho: dados.regrasTamanho,
    perguntas: dados.perguntas,
    cidade: c.nome,
    respostas,
    areaHa,
    moduloFiscalHa: Number(moduloFiscalHa) > 0 ? Number(moduloFiscalHa) : c.moduloFiscalHa,
  });
  if (resultado.erro) return res.status(400).json(resultado);
  res.json(resultado);
}));

// Leis de referência. ?cidade=Itu filtra as municipais ("todas" mostra todas as cidades)
app.get('/api/leis', rota(async (req, res) => {
  const { leis, atualizadoEm } = await getDados();
  const cidade = String(req.query.cidade || 'todas').toLowerCase();
  const municipal =
    cidade === 'todas' ? leis.municipal : leis.municipal.filter((l) => l.cidade.toLowerCase() === cidade);
  res.json({ atualizadoEm, municipal, estadual: leis.estadual, federal: leis.federal });
}));

// Previsão do tempo (Open-Meteo, grátis e sem chave), uma por cidade
const climaCache = new Map();

app.get('/api/clima', rota(async (req, res) => {
  const { cidades } = await getDados();
  const c = achaCidade(cidades, req.query.cidade);
  if (!c || c.lat === null || c.lon === null) {
    return res.status(400).json({ erro: 'Cidade não encontrada.' });
  }

  const guardado = climaCache.get(c.nome);
  if (guardado && Date.now() - guardado.quando < 30 * 60 * 1000) return res.json(guardado.dados);

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}` +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum' +
    '&timezone=America%2FSao_Paulo&forecast_days=7';

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Open-Meteo respondeu ${resposta.status}`);
    const j = await resposta.json();
    const dias = j.daily.time.map((data, i) => ({
      data,
      max: j.daily.temperature_2m_max[i],
      min: j.daily.temperature_2m_min[i],
      chuva: j.daily.precipitation_sum[i],
    }));
    const dados = { cidade: `${c.nome}/SP`, dias };
    climaCache.set(c.nome, { quando: Date.now(), dados });
    res.json(dados);
  } catch (erro) {
    console.error(erro);
    res.status(502).json({ erro: 'Não foi possível obter a previsão do tempo agora.' });
  }
}));

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`API do CampoEmDia rodando em http://localhost:${PORTA}`);
});
