function Roda({ posicao, pneu, destaque, onSoltar, onArrastarPosicao, onSobre }) {
  if (!posicao) return <div className="roda oca" aria-hidden="true" />

  return (
    <div
      className={`roda ${pneu ? 'ocupada' : 'vazia'} ${destaque === posicao ? 'alvo' : ''}`}
      role="button"
      aria-label={pneu ? `Posição ${posicao} ${pneu.codigo}` : `Posição ${posicao} vazia`}
      draggable={Boolean(pneu)}
      onDragStart={(event) => pneu && onArrastarPosicao(event, posicao)}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        onSobre?.(posicao)
      }}
      onDrop={(event) => onSoltar(event, posicao)}
    >
      <span>P{posicao}</span>
      <strong>{pneu ? pneu.codigo : 'vazia'}</strong>
    </div>
  )
}

export function Maquina({ quantidade, pneus, destaque, onSoltar, onArrastarPosicao, onSobre }) {
  const eixos = []
  for (let inicio = 1; inicio <= quantidade; inicio += 2) {
    eixos.push({
      esquerda: inicio,
      direita: inicio + 1 <= quantidade ? inicio + 1 : null,
    })
  }

  const roda = (posicao) => (
    <Roda
      posicao={posicao}
      pneu={pneus.find((item) => item.posicao === posicao)}
      destaque={destaque}
      onSoltar={onSoltar}
      onArrastarPosicao={onArrastarPosicao}
      onSobre={onSobre}
    />
  )

  return (
    <div className="eixos" aria-label="Eixos do equipamento">
      {eixos.length > 1 && <span className="tronco" aria-hidden="true" />}
      {eixos.map((eixo, indice) => (
        <div className={indice === 0 ? 'eixo eixo-dianteiro' : 'eixo eixo-seguinte'} key={eixo.esquerda}>
          <div className="eixo-corpo">
            {roda(eixo.esquerda)}
            {indice === 0 ? (
              <div className="miolo" aria-hidden="true">
                <span className="braco" />
                <div className="cubo">
                  <span className="furo" />
                  <span className="furo" />
                  <span className="pino"><span className="furo" /></span>
                </div>
                <span className="braco" />
              </div>
            ) : (
              <div className="travessa" aria-hidden="true" />
            )}
            {roda(eixo.direita)}
          </div>
        </div>
      ))}
    </div>
  )
}
