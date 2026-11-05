import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Clima from './components/Clima.jsx';
import Questionario from './components/Questionario.jsx';
import Resultado from './components/Resultado.jsx';
import Leis from './components/Leis.jsx';
import Terrenos from './components/Terrenos.jsx';
import { getCidades } from './api.js';

const CHAVE_CIDADE = 'campoemdia:cidade';

function cidadeSalva() {
  try {
    return localStorage.getItem(CHAVE_CIDADE) || 'Sorocaba';
  } catch {
    return 'Sorocaba';
  }
}

export default function App() {
  const [aba, setAba] = useState('inicio'); // inicio | terrenos | leis
  const [etapa, setEtapa] = useState('intro'); // intro | perguntas | resultado
  const [dados, setDados] = useState(null); // { respostas, perguntas, resultado, cidade }
  const [cidades, setCidades] = useState([{ nome: 'Sorocaba', lat: -23.5015, lon: -47.4526 }]);
  const [cidade, setCidade] = useState(cidadeSalva);
  const [rascunho, setRascunho] = useState(null); // respostas levadas para um novo terreno

  useEffect(() => {
    getCidades()
      .then((lista) => {
        if (lista.length) {
          setCidades(lista);
          setCidade((atual) => (lista.some((c) => c.nome === atual) ? atual : lista[0].nome));
        }
      })
      .catch(() => {});
  }, []);

  function escolherCidade(nome) {
    setCidade(nome);
    try {
      localStorage.setItem(CHAVE_CIDADE, nome);
    } catch {
      /* ignora */
    }
    // Uma lista já calculada vale para a cidade antiga: volta ao começo
    setDados(null);
    setEtapa('intro');
  }

  function mudarAba(nova) {
    setAba(nova);
    window.scrollTo({ top: 0 });
  }

  function refazer() {
    setDados(null);
    setEtapa('intro');
    window.scrollTo({ top: 0 });
  }

  function salvarComoTerreno(d) {
    setRascunho(d);
    mudarAba('terrenos');
  }

  return (
    <>
      <Header aba={aba} onAba={mudarAba} cidade={cidade} cidades={cidades} onCidade={escolherCidade} />
      <main className="conteudo">
        {aba === 'leis' && <Leis cidade={cidade} />}

        {aba === 'terrenos' && (
          <Terrenos
            cidades={cidades}
            cidadeAtual={cidade}
            rascunho={rascunho}
            onRascunhoUsado={() => setRascunho(null)}
          />
        )}

        {aba === 'inicio' && etapa === 'intro' && (
          <>
            <section className="hero">
              <div className="hero-texto">
                <p className="selo">{cidade}/SP</p>
                <h1>Quais documentos a sua propriedade rural precisa?</h1>
                <p className="sub">
                  Responda 7 perguntas rápidas e veja a lista de documentos necessários
                  para o seu caso, com o órgão e a lei de cada um.
                </p>
                <button className="botao grande" onClick={() => setEtapa('perguntas')}>
                  Começar agora
                </button>
                <p className="mini">
                  Leva cerca de 2 minutos. Não pedimos nenhum dado pessoal. Mudou de cidade?
                  Troque no topo da página.
                </p>
              </div>
              <Clima cidade={cidade} />
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
                <h3>Salve seus terrenos</h3>
                <p>Marque a área no mapa e acompanhe os documentos de cada terreno.</p>
              </div>
            </section>
          </>
        )}

        {aba === 'inicio' && etapa === 'perguntas' && (
          <Questionario
            cidade={cidade}
            onCancelar={refazer}
            onConcluir={(d) => {
              setDados(d);
              setEtapa('resultado');
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {aba === 'inicio' && etapa === 'resultado' && dados && (
          <Resultado {...dados} onRefazer={refazer} onSalvarTerreno={salvarComoTerreno} />
        )}
      </main>

      <footer className="rodape">
        <p>
          <strong>Aviso:</strong> o CampoEmDia orienta, mas não substitui os órgãos
          responsáveis (CETESB, INCRA, prefeituras e secretarias de meio ambiente). Confirme
          sempre a lista com eles. Projeto acadêmico da disciplina UPx – Facens.
        </p>
      </footer>
    </>
  );
}
