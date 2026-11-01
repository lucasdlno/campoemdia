import { useEffect, useState } from 'react';
import { getPerguntas, avaliar } from '../api.js';

export default function Questionario({ onConcluir, onCancelar }) {
  const [perguntas, setPerguntas] = useState(null);
  const [erro, setErro] = useState('');
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getPerguntas().then(setPerguntas).catch((e) => setErro(e.message));
  }, []);

  if (!perguntas) {
    return (
      <div className="card questionario">
        {erro ? (
          <>
            <p className="erro-texto">{erro}</p>
            <button className="botao" onClick={onCancelar}>Voltar</button>
          </>
        ) : (
          <p className="mudo">Carregando perguntas…</p>
        )}
      </div>
    );
  }

  const pergunta = perguntas[indice];
  const escolhida = respostas[pergunta.id];
  const ultima = indice === perguntas.length - 1;
  const porcento = Math.round(((indice + (escolhida ? 1 : 0)) / perguntas.length) * 100);

  async function avancar() {
    if (!ultima) {
      setIndice(indice + 1);
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      const resultado = await avaliar(respostas);
      onConcluir({ respostas, perguntas, resultado });
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  function voltar() {
    if (indice === 0) onCancelar();
    else setIndice(indice - 1);
  }

  return (
    <section className="card questionario" aria-live="polite">
      <div className="progresso-topo">
        <span>Pergunta {indice + 1} de {perguntas.length}</span>
        <span>{porcento}%</span>
      </div>
      <div className="barra" role="progressbar" aria-valuenow={porcento} aria-valuemin="0" aria-valuemax="100">
        <div className="barra-cheia" style={{ width: `${porcento}%` }} />
      </div>

      <h2 className="pergunta">{pergunta.pergunta}</h2>
      {pergunta.ajuda && <p className="ajuda">{pergunta.ajuda}</p>}

      <div className="opcoes" role="radiogroup" aria-label={pergunta.pergunta}>
        {pergunta.opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={escolhida === o.valor}
            className={`opcao${escolhida === o.valor ? ' ativa' : ''}`}
            onClick={() => setRespostas({ ...respostas, [pergunta.id]: o.valor })}
          >
            <span className="marca" aria-hidden="true" />
            {o.rotulo}
          </button>
        ))}
      </div>

      {erro && <p className="erro-texto">{erro}</p>}

      <div className="navegacao">
        <button className="botao claro" onClick={voltar} disabled={enviando}>Voltar</button>
        <button className="botao" onClick={avancar} disabled={!escolhida || enviando}>
          {enviando ? 'Calculando…' : ultima ? 'Ver meu resultado' : 'Próxima'}
        </button>
      </div>
    </section>
  );
}
