import { useEffect, useState } from 'react';
import Documento from './Documento.jsx';

const CHAVE = 'campoemdia:marcados';

function lerMarcados() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) || '{}');
  } catch {
    return {};
  }
}

export default function Resultado({ respostas, perguntas, resultado, cidade, onRefazer, onSalvarTerreno }) {
  const { necessarios, naoNecessarios } = resultado;
  const [marcados, setMarcados] = useState(lerMarcados);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(marcados));
    } catch {
      /* ignora */
    }
  }, [marcados]);

  const feitos = necessarios.filter((d) => marcados[d.id]).length;
  const porcento = necessarios.length ? Math.round((feitos / necessarios.length) * 100) : 0;
  const alternar = (id) => setMarcados((m) => ({ ...m, [id]: !m[id] }));

  async function copiar() {
    const linhas = necessarios.map(
      (d) => `${marcados[d.id] ? '[x]' : '[ ]'} ${d.documento} (${d.esfera} – ${d.orgao})`,
    );
    const textoLista = `Documentos necessários em ${cidade} – CampoEmDia\n\n${linhas.join('\n')}`;
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
          Em {cidade}, você precisa de {necessarios.length} documento{necessarios.length === 1 ? '' : 's'}
        </h2>
        <p>Marque os que você já tem. Seu progresso fica salvo neste navegador.</p>
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

        <div className="caixa-dica">
          Quer ver regras que mudam com o tamanho da área e acompanhar vários terrenos?
          Salve estas respostas como um terreno.
        </div>

        <div className="acoes">
          <button className="botao" onClick={() => onSalvarTerreno({ respostas, cidade })}>
            Salvar como terreno
          </button>
          <button className="botao claro" onClick={() => window.print()}>Imprimir / PDF</button>
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
