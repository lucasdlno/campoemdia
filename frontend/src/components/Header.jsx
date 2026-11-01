export default function Header({ aba, onAba }) {
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
          <button className={aba === 'leis' ? 'ativo' : ''} onClick={() => onAba('leis')}>
            Leis de referência
          </button>
        </nav>
      </div>
    </header>
  );
}
