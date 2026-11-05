export default function Header({ aba, onAba, cidade, cidades, onCidade }) {
  return (
    <header className="topo">
      <div className="topo-in">
        <div className="logo">
          <span aria-hidden="true">🌱</span> CampoEmDia
        </div>
        <nav aria-label="Menu principal">
          <button className={aba === 'inicio' ? 'ativo' : ''} onClick={() => onAba('inicio')}>
            Verificar documentos
          </button>
          <button className={aba === 'terrenos' ? 'ativo' : ''} onClick={() => onAba('terrenos')}>
            Meus terrenos
          </button>
          <button className={aba === 'leis' ? 'ativo' : ''} onClick={() => onAba('leis')}>
            Leis
          </button>
        </nav>
        <label className="cidade-sel">
          <span>Cidade</span>
          <select value={cidade} onChange={(e) => onCidade(e.target.value)}>
            {cidades.map((c) => (
              <option key={c.nome} value={c.nome}>{c.nome}</option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
