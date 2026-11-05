import { useEffect, useState } from 'react';
import { avaliar } from '../api.js';
import { formatarData } from '../lib/storage.js';
import { areaHa as calcularArea, perimetro, formatarHa, formatarMetros } from '../lib/geo.js';
import Documento from './Documento.jsx';
import MapaTerreno from './MapaTerreno.jsx';

export default function TerrenoDetalhe({ terreno, cidades, onVoltar, onEditar, onExcluir, onAtualizar }) {
  const [res, setRes] = useState(null);
  const [erro, setErro] = useState('');

  const chaveRespostas = JSON.stringify(terreno.respostas);

  useEffect(() => {
    setRes(null);
    setErro('');
    avaliar({
      cidade: terreno.cidade,
      respostas: terreno.respostas,
      areaHa: terreno.areaHa,
      moduloFiscalHa: terreno.moduloFiscalHa,
    })
      .then(setRes)
      .catch((e) => setErro(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terreno.cidade, terreno.areaHa, terreno.moduloFiscalHa, chaveRespostas]);

  const marcados = terreno.marcados || {};
  const alternar = (id) =>
    onAtualizar({ ...terreno, marcados: { ...marcados, [id]: !marcados[id] }, atualizadoEm: new Date().toISOString() });

  const temPoligono = terreno.poligono?.length >= 3;
  const cid = cidades.find((c) => c.nome === terreno.cidade);
  const centro = cid ? [cid.lat, cid.lon] : [-23.5015, -47.4526];

  const necessarios = res?.necessarios || [];
  const feitos = necessarios.filter((d) => marcados[d.id]).length;
  const porcento = necessarios.length ? Math.round((feitos / necessarios.length) * 100) : 0;
  const tam = res?.tamanho;

  return (
    <section className="detalhe-terreno">
      <button className="link-voltar" onClick={onVoltar}>← Meus terrenos</button>

      <div className="card resumo">
        <div className="doc-topo">
          <h2>{terreno.nome}</h2>
          <span className="selo-esfera municipal">{terreno.cidade}</span>
        </div>
        <p className="mini">
          Criado em {formatarData(terreno.criadoEm)} · atualizado em {formatarData(terreno.atualizadoEm)}
        </p>

        <div className="medidas">
          <div><span>Área</span><strong>{terreno.areaHa > 0 ? `${formatarHa(terreno.areaHa)} ha` : '—'}</strong></div>
          <div><span>Perímetro</span><strong>{temPoligono ? formatarMetros(perimetro(terreno.poligono)) : '—'}</strong></div>
          <div><span>Porte</span><strong>{tam?.classe || '—'}</strong></div>
          <div><span>Módulos fiscais</span><strong>{tam?.modulos ? formatarHa(tam.modulos) : '—'}</strong></div>
        </div>

        <div className="acoes">
          <button className="botao" onClick={onEditar}>Editar</button>
          <button className="botao claro" onClick={() => window.print()}>Imprimir / PDF</button>
          <button className="botao claro perigo" onClick={onExcluir}>Excluir</button>
        </div>
      </div>

      {temPoligono && (
        <MapaTerreno centro={centro} pontos={terreno.poligono} onMudar={() => {}} somenteLeitura />
      )}

      {erro && (
        <div className="card">
          <p className="erro-texto">{erro}</p>
          <p className="mini">Se faltam respostas, clique em Editar e complete o formulário.</p>
        </div>
      )}
      {!res && !erro && <p className="mudo">Calculando…</p>}

      {res && (
        <>
          <h2 className="titulo-secao">Informações pelo tamanho do terreno</h2>
          {!tam && (
            <div className="alerta-doc">Informe a área (ou desenhe no mapa) para ver as regras que dependem do tamanho.</div>
          )}
          {tam?.faltaModulo && (
            <div className="alerta-doc">
              Informe o módulo fiscal do município (botão Editar) para ver as regras por porte do imóvel.
            </div>
          )}
          {tam && (
            <ul className="lista-docs">
              {tam.informacoes.map((i) => (
                <li key={i.id} className="card info-tamanho">
                  <div className="doc-topo">
                    <h3>{i.titulo}</h3>
                    {i.verificacao && <span className="selo-verif atencao">Conferir</span>}
                  </div>
                  <p>{i.descricao}</p>
                  <p className="detalhe"><strong>Base legal:</strong> {i.baseLegal}</p>
                </li>
              ))}
            </ul>
          )}

          <h2 className="titulo-secao">Documentos do terreno</h2>
          <div className="card">
            <div className="progresso-topo">
              <span>{feitos} de {necessarios.length} prontos</span>
              <span>{porcento}%</span>
            </div>
            <div className="barra" role="progressbar" aria-valuenow={porcento} aria-valuemin="0" aria-valuemax="100">
              <div className="barra-cheia" style={{ width: `${porcento}%` }} />
            </div>
          </div>
          <ul className="lista-docs espaco-topo">
            {necessarios.map((d) => (
              <Documento key={d.id} item={d} aplica marcado={marcados[d.id]} onMarcar={alternar} />
            ))}
          </ul>

          {res.naoNecessarios.length > 0 && (
            <details className="nao-necessarios">
              <summary>Não necessários para este terreno ({res.naoNecessarios.length})</summary>
              <ul className="lista-docs">
                {res.naoNecessarios.map((d) => (
                  <Documento key={d.id} item={d} aplica={false} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}

      <p className="mini">
        Orientação preliminar. A área do mapa é uma estimativa e não substitui o
        georreferenciamento oficial nem a análise dos órgãos responsáveis.
      </p>
    </section>
  );
}
