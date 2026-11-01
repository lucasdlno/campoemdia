import express from 'express';
import cors from 'cors';
import { getDados } from './src/excel.js';
import { avaliar } from './src/avaliar.js';

const app = express();
app.use(cors());
app.use(express.json());

// Evita repetir try/catch em cada rota
const rota = (fn) => (req, res) =>
  fn(req, res).catch((erro) => {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao ler a planilha de dados.' });
  });

app.get('/api/saude', (_req, res) => res.json({ ok: true }));

// Perguntas do questionário (vêm da aba "Perguntas")
app.get('/api/perguntas', rota(async (_req, res) => {
  const { perguntas } = await getDados();
  res.json(perguntas);
}));

// Recebe as respostas e devolve os documentos necessários e não necessários
app.post('/api/avaliar', rota(async (req, res) => {
  const { perguntas, regras } = await getDados();
  const resultado = avaliar(regras, perguntas, req.body?.respostas);
  if (resultado.erro) return res.status(400).json(resultado);
  res.json(resultado);
}));

// Leis de referência (abas de leis)
app.get('/api/leis', rota(async (_req, res) => {
  const { leis } = await getDados();
  res.json(leis);
}));

// Previsão do tempo de Sorocaba (Open-Meteo, grátis e sem chave)
const URL_CLIMA =
  'https://api.open-meteo.com/v1/forecast?latitude=-23.5015&longitude=-47.4526' +
  '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum' +
  '&timezone=America%2FSao_Paulo&forecast_days=7';

let climaCache = { quando: 0, dados: null };

app.get('/api/clima', async (_req, res) => {
  try {
    const meiaHora = 30 * 60 * 1000;
    if (climaCache.dados && Date.now() - climaCache.quando < meiaHora) {
      return res.json(climaCache.dados);
    }
    const resposta = await fetch(URL_CLIMA);
    if (!resposta.ok) throw new Error(`Open-Meteo respondeu ${resposta.status}`);
    const j = await resposta.json();

    const dias = j.daily.time.map((data, i) => ({
      data,
      max: j.daily.temperature_2m_max[i],
      min: j.daily.temperature_2m_min[i],
      chuva: j.daily.precipitation_sum[i],
    }));
    climaCache = { quando: Date.now(), dados: { cidade: 'Sorocaba/SP', dias } };
    res.json(climaCache.dados);
  } catch (erro) {
    console.error(erro);
    res.status(502).json({ erro: 'Não foi possível obter a previsão do tempo agora.' });
  }
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`API do CampoEmDia rodando em http://localhost:${PORTA}`);
});
