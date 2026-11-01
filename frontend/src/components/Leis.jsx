import { useEffect, useMemo, useState } from 'react';
import { getLeis } from '../api.js';

const ABAS = [
  { id: 'municipal', nome: 'Municipais (Sorocaba)' },
  { id: 'estadual', nome: 'Estaduais (SP)' },
  { id: 'federal', nome: 'Federais' },
];

export default function Leis() {
  const [leis, setLeis] = useState(null);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState('municipal');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    getLeis().then(setLeis).catch((e) => setErro(e.message));
  }, []);

  const lista = useMemo(() => {
    if (!leis) return [];
    const termo = busca.trim().toLowerCase();
    return leis[aba].filter((l) =>
      !termo ||
      [l.norma, l.assunto, l.categoria, l.orgao].join(' ').toLowerCase().includes(termo),
    );
  }, [leis, aba, busca]);

  return (
    <section>
      <h1 className="titulo-pagina">Leis de referência</h1>
      <p className="sub">
        Normas ligadas à regularização e ao plantio. Itens em amarelo precisam ter o
        texto e a vigência conferidos na fonte oficial.
      </p>

      <div className="abas" role="tablist">
        {ABAS.map((a) => (
          <button
            key={a.id}
            role="tab"
            aria-selected={aba === a.id}
            className={aba === a.id ? 'ativo' : ''}
            onClick={() => setAba(a.id)}
          >
            {a.nome}
          </button>
        ))}
      </div>

      <input
        className="busca"
        type="search"
        placeholder="Buscar por lei, assunto ou órgão…"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        aria-label="Buscar leis"
      />

      {erro && <p className="erro-texto">{erro}</p>}
      {!leis && !erro && <p className="mudo">Carregando leis…</p>}

      <ul className="lista-docs">
        {lista.map((l) => (
          <li key={l.norma} className="card lei">
            <div className="doc-topo">
              <h3>{l.norma}</h3>
              <span className={`selo-verif ${l.verificacao.startsWith('Confirmada') ? 'ok' : 'atencao'}`}>
                {l.verificacao.startsWith('Confirmada') ? 'Confirmada' : 'Conferir'}
              </span>
            </div>
            <p className="detalhe">{l.data} · {l.categoria} · {l.orgao}</p>
            <p>{l.assunto}</p>
            <p className="motivo">{l.importancia}</p>
          </li>
        ))}
        {leis && lista.length === 0 && <li className="mudo">Nenhuma lei encontrada.</li>}
      </ul>
    </section>
  );
}
