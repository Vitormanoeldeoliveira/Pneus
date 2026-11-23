import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { Filtros, textoContem } from '../components/Filtros'

function quando(valor) {
  if (!valor) return '—'
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return valor
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function Movimentacoes() {
  const [itens, setItens] = useState([])
  const [filtros, setFiltros] = useState({ pneu: '', origem: '', destino: '' })
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      setItens(await api.listarMovimentacoes())
      setErro('')
    } catch (error) {
      setErro(error.message)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const visiveis = useMemo(() => itens.filter((item) => (
    textoContem(item.pneu?.codigo, filtros.pneu)
    && textoContem(item.origem, filtros.origem)
    && textoContem(item.destino, filtros.destino)
  )), [itens, filtros])

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Movimentações</h1>
          <p>Cada vez que um pneu sai de um lugar, fica registrado de onde saiu e para onde foi.</p>
        </div>
      </header>
      <Filtros
        campos={[
          { nome: 'pneu', rotulo: 'Pneu' },
          { nome: 'origem', rotulo: 'Origem' },
          { nome: 'destino', rotulo: 'Destino' },
        ]}
        valores={filtros}
        onChange={(nome, valor) => setFiltros((atual) => ({ ...atual, [nome]: valor }))}
      />
      {erro && <div className="form-error">{erro} <button type="button" className="ghost" onClick={carregar}>Tentar de novo</button></div>}
      <div className="page-body table-wrap">
        <table>
          <thead>
            <tr>
              <th>Quando</th>
              <th>Pneu</th>
              <th>De</th>
              <th>Para</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((item) => (
              <tr key={item.id}>
                <td>{quando(item.dataHora)}</td>
                <td><strong>{item.pneu?.codigo || '—'}</strong></td>
                <td>{item.origem}</td>
                <td>{item.destino}</td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan="4">
                  <p className="empty">Nenhuma movimentação encontrada. Elas aparecem ao montar, retirar ou trocar um pneu.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
