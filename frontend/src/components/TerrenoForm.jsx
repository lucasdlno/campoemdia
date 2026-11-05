import { useEffect, useState } from 'react';
import { getPerguntas } from '../api.js';
import { novoId } from '../lib/storage.js';
import { areaHa as calcularArea, perimetro, formatarHa, formatarMetros } from '../lib/geo.js';
import MapaTerreno from './MapaTerreno.jsx';

export default function TerrenoForm({ inicial, cidades, cidadeAtual, onSalvar, onCancelar }) {
  const [perguntas, setPerguntas] = useState([]);
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState(inicial?.nome || '');
  const [cidade, setCidade] = useState(inicial?.cidade || cidadeAtual);
  const [pontos, setPontos] = useState(inicial?.poligono || []);
  const [areaManual, setAreaManual] = useState(
    inicial?.poligono?.length >= 3 ? '' : inicial?.areaHa || '',
  );
  const [modulo, setModulo] = useState(inicial?.moduloFiscalHa || '');
  const [respostas, setRespostas] = useState(inicial?.respostas || {});
  const [foco, setFoco] = useState(null); // { centro, zoom } vindo da localização do aparelho
  const [avisoGps, setAvisoGps] = useState('');

  useEffect(() => {
    getPerguntas().then(setPerguntas).catch((e) => setErro(e.message));
  }, []);

  const cid = cidades.find((c) => c.nome === cidade);
  const centroCidade = cid ? [cid.lat, cid.lon] : [-23.5015, -47.4526];
  const centro = foco ? foco.centro : centroCidade;
  const zoom = foco ? foco.zoom : 14;

  const temArea = pontos.length >= 3;
  const areaDesenhada = temArea ? calcularArea(pontos) : 0;
  const areaManualNum = Number(String(areaManual).replace(',', '.')) || 0;
  const areaFinal = temArea ? areaDesenhada : areaManualNum;
  const moduloFinal = Number(String(modulo).replace(',', '.')) || cid?.moduloFiscalHa || null;

  function usarLocalizacao() {
    setAvisoGps('');
    if (!navigator.geolocation) {
      setAvisoGps('Seu navegador não oferece localização.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setFoco({ centro: [pos.coords.latitude, pos.coords.longitude], zoom: 17 }),
      () => setAvisoGps('Não foi possível pegar a localização. Verifique a permissão do navegador.'),
    );
  }

  function salvar(e) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Dê um nome ao terreno.');
      return;
    }
    const agora = new Date().toISOString();
    onSalvar({
      id: inicial?.id || novoId(),
      nome: nome.trim(),
      cidade,
      areaHa: areaFinal > 0 ? Number(areaFinal.toFixed(4)) : 0,
      poligono: pontos,
      moduloFiscalHa: moduloFinal,
      respostas,
      marcados: inicial?.marcados || {},
      criadoEm: inicial?.criadoEm || agora,
      atualizadoEm: agora,
    });
  }

  return (
    <form className="card form-terreno" onSubmit={salvar}>
      <h2>{inicial?.id ? 'Editar terreno' : 'Novo terreno'}</h2>

      <div className="campos">
        <label className="campo">
          <span>Nome do terreno</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Sítio Boa Vista" maxLength={60} />
        </label>
        <label className="campo">
          <span>Cidade</span>
          <select value={cidade} onChange={(e) => { setCidade(e.target.value); setFoco(null); }}>
            {cidades.map((c) => (
              <option key={c.nome} value={c.nome}>{c.nome}</option>
            ))}
          </select>
        </label>
      </div>

      <h3>Localização e tamanho</h3>
      <p className="ajuda">
        Clique no mapa para marcar os cantos do terreno. As linhas se ligam e o sistema
        calcula a área. Arraste um ponto para ajustar.
      </p>

      <MapaTerreno centro={centro} zoom={zoom} pontos={pontos} onMudar={setPontos} />

      <div className="barra-mapa">
        <button type="button" className="botao claro pequeno" onClick={() => setPontos(pontos.slice(0, -1))} disabled={!pontos.length}>
          Desfazer último ponto
        </button>
        <button type="button" className="botao claro pequeno" onClick={() => setPontos([])} disabled={!pontos.length}>
          Limpar desenho
        </button>
        <button type="button" className="botao claro pequeno" onClick={usarLocalizacao}>
          Usar minha localização
        </button>
      </div>
      {avisoGps && <p className="erro-texto">{avisoGps}</p>}

      <div className="medidas">
        <div><span>Pontos</span><strong>{pontos.length}</strong></div>
        <div><span>Perímetro</span><strong>{pontos.length >= 2 ? formatarMetros(perimetro(pontos)) : '—'}</strong></div>
        <div><span>Área</span><strong>{areaFinal > 0 ? `${formatarHa(areaFinal)} ha` : '—'}</strong></div>
      </div>

      <div className="campos">
        <label className="campo">
          <span>Área em hectares {temArea && '(calculada pelo mapa)'}</span>
          <input
            inputMode="decimal"
            value={temArea ? formatarHa(areaDesenhada) : areaManual}
            onChange={(e) => setAreaManual(e.target.value)}
            disabled={temArea}
            placeholder="Ou digite aqui se souber"
          />
        </label>
        <label className="campo">
          <span>Módulo fiscal do município (ha)</span>
          <input
            inputMode="decimal"
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
            placeholder={cid?.moduloFiscalHa ? String(cid.moduloFiscalHa) : 'Veja no INCRA'}
          />
        </label>
      </div>
      <p className="mini">
        O módulo fiscal vem do INCRA e muda de cidade para cidade. Ele define se o terreno é
        pequeno, médio ou grande e libera regras específicas.
      </p>

      <h3>Sobre o terreno</h3>
      <div className="campos">
        {perguntas.map((p) => (
          <label className="campo" key={p.id}>
            <span>{p.pergunta}</span>
            <select
              value={respostas[p.id] || ''}
              onChange={(e) => setRespostas({ ...respostas, [p.id]: e.target.value })}
            >
              <option value="">Escolha…</option>
              {p.opcoes.map((o) => (
                <option key={o.valor} value={o.valor}>{o.rotulo}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {erro && <p className="erro-texto">{erro}</p>}

      <div className="navegacao">
        <button type="button" className="botao claro" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="botao">Salvar terreno</button>
      </div>
    </form>
  );
}
