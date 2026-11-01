import { useEffect, useState } from 'react';

const CHAVE = 'campoemdia:marcados';

function lerMarcados() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) || '{}');
  } catch {
    return {};
  }
}

function Documento({ item, marcado, onMarcar, aplica }) {
  const confirmar = item.verificacao === 'Sugestão do grupo';
  return (
    <li className={`doc card${marcado ? ' feito' : ''}${aplica ? '' : ' nao'}`}>
      {aplica && (
        <label className="check">
          <input type="checkbox" checked={!!marcado} onChange={() => onMarcar(item.id)} />
          <span className="caixa" aria-hidden="true" />
          <span className="sr">Já tenho: {item.documento}</span>
        </label>
      )}
      <div className="doc-corpo">
        <div className="doc-topo">
          <h3>{item.documento}</h3>
          <span className={`selo-esfera ${item.esfera.toLowerCase()}`}>{item.esfera}</span>
        </div>
        <p className="motivo">{item.motivo}</p>
        <p className="detalhe"><strong>O que é:</strong> {item.descricao}</p>
        <p className="detalhe"><strong>Onde:</strong> {item.orgao}</p>
        <p className="detalhe"><strong>Base legal:</strong> {item.baseLegal}</p>
        {aplica && confirmar && (
          <p className="alerta-doc">Confirme este item com o órgão responsável.</p>
        )}
      </div>
    </li>
  );
}

export default function Resultado({ respostas, perguntas, resultado, onRefazer }) {
  const { necessarios, naoNecessarios } = resultado;
  const [marcados, setMarcados] = useState(lerMarcados);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(marcados));
  }, [marcados]);

  const feitos = necessarios.filter((d) => marcados[d.id]).length;
  const porcento = necessarios.length ? Math.round((feitos / necessarios.length) * 100) : 0;

  const alternar = (id) => setMarcados((m) => ({ ...m, [id]: !m[id] }));

  async function copiar() {
    const linhas = necessarios.map(
      (d) => `${marcados[d.id] ? '[x]' : '[ ]'} ${d.documento} (${d.esfera} – ${d.orgao})`,
    );
    const textoLista = `Documentos necessários – CampoEmDia\n\n${linhas.join('\n')}`;
    try {
      await navigator.clipboard.writeText(textoLista);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt('Copie a lista abaixo:', textoLista);
    }
  }

  return (
    <section className="resultado">
      <div className="card resumo">
        <h2>
          Você precisa de {necessarios.length} documento{necessarios.length === 1 ? '' : 's'}
        </h2>
        <p>
          Marque os que você já tem. Seu progresso fica salvo neste navegador.
        </p>
        <div className="progresso-topo">
          <span>{feitos} de {necessarios.length} prontos</span>
          <span>{porcento}%</span>
        </div>
        <div className="barra" role="progressbar" aria-valuenow={porcento} aria-valuemin="0" aria-valuemax="100">
          <div className="barra-cheia" style={{ width: `${porcento}%` }} />
        </div>

        <details className="respostas">
          <summary>Ver minhas respostas</summary>
          <ul>
            {perguntas.map((p) => (
              <li key={p.id}>
                <span>{p.pergunta}</span>
                <strong>{p.opcoes.find((o) => o.valor === respostas[p.id])?.rotulo}</strong>
              </li>
            ))}
          </ul>
        </details>

        <div className="acoes">
          <button className="botao" onClick={() => window.print()}>Imprimir / salvar PDF</button>
          <button className="botao claro" onClick={copiar}>{copiado ? 'Copiado!' : 'Copiar lista'}</button>
          <button className="botao claro" onClick={onRefazer}>Refazer</button>
        </div>
      </div>

      <h2 className="titulo-secao">Documentos necessários</h2>
      <ul className="lista-docs">
        {necessarios.map((d) => (
          <Documento key={d.id} item={d} aplica marcado={marcados[d.id]} onMarcar={alternar} />
        ))}
      </ul>

      {naoNecessarios.length > 0 && (
        <details className="nao-necessarios">
          <summary>Não necessários para o seu caso ({naoNecessarios.length})</summary>
          <ul className="lista-docs">
            {naoNecessarios.map((d) => (
              <Documento key={d.id} item={d} aplica={false} />
            ))}
          </ul>
        </details>
      )}

      <p className="mini">
        Esta lista é uma orientação preliminar baseada no relatório do projeto. Itens
        marcados para confirmação vêm de sugestões do grupo e precisam ser validados com
        CETESB, INCRA, SEMA ou a Prefeitura.
      </p>
    </section>
  );
}
