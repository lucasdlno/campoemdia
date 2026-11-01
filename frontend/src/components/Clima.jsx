import { useEffect, useState } from 'react';
import { getClima } from '../api.js';

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

export default function Clima() {
  const [clima, setClima] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    getClima().then(setClima).catch((e) => setErro(e.message));
  }, []);

  const secos = clima ? clima.dias.filter((d) => d.chuva < 2).length : 0;

  return (
    <aside className="card clima" aria-label="Previsão do tempo">
      <h2>Tempo em Sorocaba</h2>
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
