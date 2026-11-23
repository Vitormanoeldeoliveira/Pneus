import { useState } from 'react'

export function useConfirm() {
  const [pedido, setPedido] = useState(null)

  function confirmar(mensagem) {
    return new Promise((resolve) => {
      setPedido({ mensagem, resolve })
    })
  }

  function responder(valor) {
    pedido?.resolve(valor)
    setPedido(null)
  }

  const dialog = pedido ? (
    <div className="overlay confirm-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Confirmar">
        <h2>Confirmar</h2>
        <p className="hint" style={{ marginTop: 8 }}>{pedido.mensagem}</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => responder(false)}>Cancelar</button>
          <button type="button" className="accent" onClick={() => responder(true)}>Confirmar</button>
        </div>
      </div>
    </div>
  ) : null

  return { confirmar, dialog }
}
