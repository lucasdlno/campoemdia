import { useEffect, useRef, useState } from 'react';
import { avaliar } from '../api.js';
import { lerTerrenos, salvarTerrenos } from '../lib/storage.js';
import { formatarHa } from '../lib/geo.js';
import TerrenoForm from './TerrenoForm.jsx';
import TerrenoDetalhe from './TerrenoDetalhe.jsx';

export default function Terrenos({ cidades, cidadeAtual, rascunho, onRascunhoUsado }) {
  const [terrenos, setTerrenos] = useState(lerTerrenos);
  const [tela, setTela] = useState({ nome: 'lista' }); // lista | form | detalhe
  const [resumos, setResumos] = useState({});
  const arquivoRef = useRef(null);

  useEffect(() => {
    salvarTerrenos(terrenos);
  }, [terrenos]);

  // Veio do questionário rápido: abre o formulário já com as respostas
  useEffect(() => {
    if (rascunho) {
      setTela({ nome: 'form', inicial: { respostas: rascunho.respostas, cidade: rascunho.cidade } });
      onRascunhoUsado();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rascunho]);

  // Calcula o andamento (documentos prontos) de cada terreno
  useEffect(() => {
    let cancelado = false;
    terrenos.forEach(async (t) => {
      try {
        const r = await avaliar({
          cidade: t.cidade,
          respostas: t.respostas,
          areaHa: t.areaHa,
          moduloFiscalHa: t.moduloFiscalHa,
        });
        const feitos = r.necessarios.filter((d) => t.marcados?.[d.id]).length;
        if (!cancelado) {
          setResumos((s) => ({ ...s, [t.id]: { total: r.necessarios.length, feitos, classe: r.tamanho?.classe } }));
        }
      } catch {
        if (!cancelado) setResumos((s) => ({ ...s, [t.id]: null }));
      }
    });
    return () => {
      cancelado = true;
    };
  }, [terrenos]);

  function salvar(t) {
    setTerrenos((lista) =>
      lista.some((x) => x.id === t.id) ? lista.map((x) => (x.id === t.id ? t : x)) : [...lista, t],
    );
    setTela({ nome: 'detalhe', id: t.id });
    window.scrollTo({ top: 0 });
  }

  const atualizar = (t) => setTerrenos((lista) => lista.map((x) => (x.id === t.id ? t : x)));

  function excluir(id) {
    if (window.confirm('Excluir este terreno? Isso não pode ser desfeito.')) {
      setTerrenos((lista) => lista.filter((t) => t.id !== id));
      setTela({ nome: 'lista' });
    }
  }

  function exportar() {
    const blob = new Blob([JSON.stringify(terrenos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campoemdia-terrenos.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importar(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    arquivo.text().then((txt) => {
      try {
        const dados = JSON.parse(txt);
        if (!Array.isArray(dados)) throw new Error('formato');
        setTerrenos((lista) => {
          const ids = new Set(lista.map((t) => t.id));
          return [...lista, ...dados.filter((t) => t && t.id && t.nome && !ids.has(t.id))];
        });
      } catch {
        window.alert('Arquivo inválido. Use um arquivo exportado pelo CampoEmDia.');
      }
    });
    e.target.value = '';
  }

  if (tela.nome === 'form') {
    return (
      <TerrenoForm
        inicial={tela.inicial}
        cidades={cidades}
        cidadeAtual={cidadeAtual}
        onSalvar={salvar}
        onCancelar={() => setTela(tela.inicial?.id ? { nome: 'detalhe', id: tela.inicial.id } : { nome: 'lista' })}
      />
    );
  }

  if (tela.nome === 'detalhe') {
    const t = terrenos.find((x) => x.id === tela.id);
    if (t) {
      return (
        <TerrenoDetalhe
          terreno={t}
          cidades={cidades}
          onVoltar={() => setTela({ nome: 'lista' })}
          onEditar={() => setTela({ nome: 'form', inicial: t })}
          onExcluir={() => excluir(t.id)}
          onAtualizar={atualizar}
        />
      );
    }
  }

  const areaTotal = terrenos.reduce((soma, t) => soma + (t.areaHa || 0), 0);

  return (
    <section>
      <h1 className="titulo-pagina">Meus terrenos</h1>
      <p className="sub">
        Cadastre cada terreno, marque a área no mapa e acompanhe os documentos de cada um.
        Os dados ficam salvos neste navegador.
      </p>

      <div className="acoes">
        <button className="botao" onClick={() => setTela({ nome: 'form', inicial: { cidade: cidadeAtual } })}>
          + Novo terreno
        </button>
        <button className="botao claro" onClick={exportar} disabled={!terrenos.length}>Exportar (backup)</button>
        <button className="botao claro" onClick={() => arquivoRef.current?.click()}>Importar</button>
        <input ref={arquivoRef} type="file" accept="application/json" onChange={importar} hidden />
      </div>

      {terrenos.length > 0 && (
        <div className="medidas espaco-topo">
          <div><span>Terrenos</span><strong>{terrenos.length}</strong></div>
          <div><span>Área total</span><strong>{formatarHa(areaTotal)} ha</strong></div>
        </div>
      )}

      {terrenos.length === 0 ? (
        <div className="card vazio">
          <p><strong>Você ainda não tem terrenos.</strong></p>
          <p className="mudo">Clique em "Novo terreno" para começar.</p>
        </div>
      ) : (
        <ul className="grade-terrenos">
          {terrenos.map((t) => {
            const r = resumos[t.id];
            const pct = r && r.total ? Math.round((r.feitos / r.total) * 100) : 0;
            return (
              <li key={t.id}>
                <button className="card cartao-terreno" onClick={() => setTela({ nome: 'detalhe', id: t.id })}>
                  <div className="doc-topo">
                    <h3>{t.nome}</h3>
                    <span className="selo-esfera municipal">{t.cidade}</span>
                  </div>
                  <p className="detalhe">
                    {t.areaHa > 0 ? `${formatarHa(t.areaHa)} ha` : 'Área não informada'}
                    {r?.classe ? ` · ${r.classe}` : ''}
                  </p>
                  {r ? (
                    <>
                      <div className="progresso-topo">
                        <span>{r.feitos} de {r.total} documentos</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="barra"><div className="barra-cheia" style={{ width: `${pct}%` }} /></div>
                    </>
                  ) : (
                    <p className="alerta-doc">Complete as respostas do terreno.</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
