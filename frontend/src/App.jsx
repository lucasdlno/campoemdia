import { useState } from 'react';
import Header from './components/Header.jsx';
import Clima from './components/Clima.jsx';
import Questionario from './components/Questionario.jsx';
import Resultado from './components/Resultado.jsx';
import Leis from './components/Leis.jsx';

export default function App() {
  const [aba, setAba] = useState('inicio'); // inicio | leis
  const [etapa, setEtapa] = useState('intro'); // intro | perguntas | resultado
  const [dados, setDados] = useState(null); // { respostas, perguntas, resultado }

  function mudarAba(nova) {
    setAba(nova);
    window.scrollTo({ top: 0 });
  }

  function refazer() {
    setDados(null);
    setEtapa('intro');
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <Header aba={aba} onAba={mudarAba} />
      <main className="conteudo">
        {aba === 'leis' && <Leis />}

        {aba === 'inicio' && etapa === 'intro' && (
          <>
            <section className="hero">
              <div className="hero-texto">
                <p className="selo">Sorocaba/SP</p>
                <h1>Quais documentos a sua propriedade rural precisa?</h1>
                <p className="sub">
                  Responda 7 perguntas rápidas e veja a lista de documentos necessários
                  para o seu caso, com o órgão e a lei de cada um.
                </p>
                <button className="botao grande" onClick={() => setEtapa('perguntas')}>
                  Começar agora
                </button>
                <p className="mini">Leva cerca de 2 minutos. Não pedimos nenhum dado pessoal.</p>
              </div>
              <Clima />
            </section>

            <section className="passos" aria-label="Como funciona">
              <div className="card passo">
                <span className="numero">1</span>
                <h3>Responda</h3>
                <p>Perguntas simples sobre a sua atividade e a sua terra.</p>
              </div>
              <div className="card passo">
                <span className="numero">2</span>
                <h3>Veja a lista</h3>
                <p>Mostramos o que é necessário e o que não se aplica ao seu caso.</p>
              </div>
              <div className="card passo">
                <span className="numero">3</span>
                <h3>Acompanhe</h3>
                <p>Marque o que já tem em mãos e imprima a sua lista.</p>
              </div>
            </section>
          </>
        )}

        {aba === 'inicio' && etapa === 'perguntas' && (
          <Questionario
            onCancelar={refazer}
            onConcluir={(d) => {
              setDados(d);
              setEtapa('resultado');
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {aba === 'inicio' && etapa === 'resultado' && dados && (
          <Resultado {...dados} onRefazer={refazer} />
        )}
      </main>

      <footer className="rodape">
        <p>
          <strong>Aviso:</strong> o CampoEmDia orienta, mas não substitui os órgãos
          responsáveis (CETESB, INCRA, SEMA e Prefeitura de Sorocaba). Confirme sempre a
          lista com eles. Projeto acadêmico da disciplina UPx – Facens.
        </p>
      </footer>
    </>
  );
}
