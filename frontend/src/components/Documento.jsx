// Cartão de um documento da lista (usado no resultado rápido e nos terrenos)
export default function Documento({ item, marcado, onMarcar, aplica }) {
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
