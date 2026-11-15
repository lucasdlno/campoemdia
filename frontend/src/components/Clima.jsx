import { useEffect, useState } from 'react';
import { getCidades } from '../api.js';

const MEIA_HORA = 30 * 60 * 1000;

function lerCache(cidade) {
  try {
    const c = JSON.parse(sessionStorage.getItem(`campoemdia:clima:${cidade}`) || 'null');
    if (c && Date.now() - c.quando < MEIA_HORA) return c.dados;
  } catch {
    /* ignora */
  }
  return null;
}

function guardarCache(cidade, dados) {
  try {
    sessionStorage.setItem(`campoemdia:clima:${cidade}`, JSON.stringify({ quando: Date.now(), dados }));
  } catch {
    /* ignora */
  }
}

// A previsão é buscada direto do navegador de quem acessa. Assim cada visitante usa o
// próprio endereço de internet e o servidor não estoura o limite gratuito da Open-Meteo.
async function buscarClima(cidade) {
  const guardado = lerCache(cidade);
  if (guardado) return guardado;

  const cidades = await getCidades();
  const c = cidades.find((x) => x.nome === cidade);
  if (!c || c.lat == null || c.lon == null) throw new Error('Cidade não encontrada.');

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}` +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum' +
    '&timezone=America%2FSao_Paulo&forecast_days=7';

  let resposta;
  try {
    resposta = await fetch(url);
  } catch {
    throw new Error('Não foi possível obter a previsão do tempo agora.');
  }
  if (!resposta.ok) {
    throw new Error(
      resposta.status === 429
        ? 'O serviço de clima está com muitos acessos. Tente de novo em alguns minutos.'
        : 'Não foi possível obter a previsão do tempo agora.',
    );
  }

  const j = await resposta.json();
  const dados = {
    dias: j.daily.time.map((data, i) => ({
      data,
      max: j.daily.temperature_2m_max[i],
      min: j.daily.temperature_2m_min[i],
      chuva: j.daily.precipitation_sum[i],
    })),
  };
  guardarCache(cidade, dados);
  return dados;
}

function icone(chuva) {
  if (chuva >= 10) return '🌧️';
  if (chuva >= 2) return '🌦️';
  return '☀️';
}

function diaSemana(data) {
  const d = new Date(`${data}T12:00:00`);
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
}

function diaMes(data) {
  const d = new Date(`${data}T12:00:00`);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function Clima({ cidade }) {
  const [clima, setClima] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelado = false;
    setClima(null);
    setErro('');
    buscarClima(cidade)
      .then((dados) => {
        if (!cancelado) setClima(dados);
      })
      .catch((e) => {
        if (!cancelado) setErro(e.message);
      });
    return () => {
      cancelado = true;
    };
  }, [cidade]);

  const secos = clima ? clima.dias.filter((d) => d.chuva < 2).length : 0;

  return (
    <aside className="card clima" aria-label="Previsão do tempo">
      <h2>Tempo em {cidade}</h2>
      {erro && <p className="erro-texto">{erro}</p>}
      {!clima && !erro && <p className="mudo">Carregando previsão…</p>}
      {clima && (
        <>
          <ul className="dias">
            {clima.dias.map((d) => (
              <li key={d.data}>
                <span className="dia-nome">{diaSemana(d.data)}</span>
                <span className="dia-data">{diaMes(d.data)}</span>
                <span className="dia-icone" aria-hidden="true">{icone(d.chuva)}</span>
                <span className="dia-temp">
                  {Math.round(d.max)}° <small>{Math.round(d.min)}°</small>
                </span>
                <span className="dia-chuva">{d.chuva.toFixed(1)} mm</span>
              </li>
            ))}
          </ul>
          <p className="resumo-clima">
            {secos} de {clima.dias.length} dias com pouca chuva (menos de 2 mm).
          </p>
          <p className="mini">
            Dados da Open-Meteo. Serve de apoio e não substitui o ZARC da Embrapa nem a
            orientação de um agrônomo.
          </p>
        </>
      )}
    </aside>
  );
}
