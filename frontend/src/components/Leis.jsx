import { useEffect, useMemo, useState } from 'react';
import { getLeis } from '../api.js';

const ABAS = [
  { id: 'municipal', nome: 'Municipais' },
  { id: 'estadual', nome: 'Estaduais (SP)' },
  { id: 'federal', nome: 'Federais' },
];

function dataHora(iso) {
  return iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '';
}

export default function Leis({ cidade }) {
  const [leis, setLeis] = useState(null);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState('municipal');
  const [busca, setBusca] = useState('');
  const [todas, setTodas] = useState(false);

  useEffect(() => {
    setLeis(null);
    setErro('');
    getLeis(todas ? 'todas' : cidade).then(setLeis).catch((e) => setErro(e.message));
  }, [cidade, todas]);

  const lista = useMemo(() => {
    if (!leis) return [];
    const termo = busca.trim().toLowerCase();
    return leis[aba].filter(
      (l) =>
        !termo ||
        [l.norma, l.assunto, l.categoria, l.orgao, l.cidade].join(' ').toLowerCase().includes(termo),
    );
  }, [leis, aba, busca]);

  return (
    <section>
      <h1 className="titulo-pagina">Leis de referência</h1>
      <p className="sub">
        Normas ligadas à regularização e ao plantio. Cada lei mostra quando foi criada e
        quando o sistema foi atualizado com ela. Itens marcados como "Conferir" precisam
        ter o texto e a vigência verificados na fonte oficial.
      </p>
      {leis && (
        <p className="atualizacao">
          Base de dados atualizada em <strong>{dataHora(leis.atualizadoEm)}</strong>
        </p>
      )}

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

      {aba === 'municipal' && (
        <label className="opcao-simples">
          <input type="checkbox" checked={todas} onChange={(e) => setTodas(e.target.checked)} />
          Mostrar as leis de todas as cidades (agora: {cidade})
        </label>
      )}

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
        {lista.map((l) => {
          const ok = l.verificacao.startsWith('Confirmada');
          return (
            <li key={`${l.cidade}-${l.norma}`} className="card lei">
              <div className="doc-topo">
                <h3>{l.norma}</h3>
                <span className={`selo-verif ${ok ? 'ok' : 'atencao'}`}>{ok ? 'Confirmada' : 'Conferir'}</span>
              </div>
              <p className="detalhe">
                {l.cidade !== 'Todas' && <strong>{l.cidade} · </strong>}
                {l.categoria} · {l.orgao}
              </p>
              <p>{l.assunto}</p>
              <p className="motivo">{l.importancia}</p>
              <p className="datas">
                <span>📜 Criada em: <strong>{l.data || 'não informada'}</strong></span>
                <span>🔄 Sistema atualizado em: <strong>{l.atualizadoEm || 'não informado'}</strong></span>
              </p>
            </li>
          );
        })}
        {leis && lista.length === 0 && (
          <li className="mudo">
            {aba === 'municipal' && !busca
              ? `Ainda não há leis municipais cadastradas para ${cidade}. O grupo pode acrescentá-las na aba "Leis Municipais" da planilha.`
              : 'Nenhuma lei encontrada.'}
          </li>
        )}
      </ul>
    </section>
  );
}
