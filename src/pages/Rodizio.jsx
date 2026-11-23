import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { Filtros, textoContem } from '../components/Filtros'
import { Maquina } from '../components/Maquina'
import { Toast, useToast } from '../components/Toast'
import { TIPO_EQUIPAMENTO } from '../labels'

function lerArraste(event) {
  const bruto = event.dataTransfer.getData('text/plain')
  const [tipo, valor] = bruto.split(':')
  const numero = Number(valor)
  if (!tipo || !Number.isFinite(numero)) return null
  return { tipo, valor: numero }
}

export function Rodizio() {
  const [params, setParams] = useSearchParams()
  const [equipamentos, setEquipamentos] = useState([])
  const [equipamentoId, setEquipamentoId] = useState(params.get('equipamento') || params.get('novo') || '')
  const [equipamento, setEquipamento] = useState(null)
  const [estoque, setEstoque] = useState([])
  const [filtros, setFiltros] = useState({ codigo: '', marca: '', modelo: '', medida: '' })
  const [destaque, setDestaque] = useState(0)
  const [sobreEstoque, setSobreEstoque] = useState(false)
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const { toast, notify } = useToast()

  useEffect(() => {
    let vivo = true
    api.listarEquipamentos()
      .then((lista) => {
        if (vivo) setEquipamentos(lista)
      })
      .catch((error) => {
        if (vivo) setErro(error.message)
      })
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    if (!equipamentoId) {
      setEquipamento(null)
      setEstoque([])
      return undefined
    }
    let vivo = true
    Promise.all([api.buscarEquipamento(equipamentoId), api.listarEstoque()])
      .then(([detalhe, livres]) => {
        if (!vivo) return
        setEquipamento(detalhe)
        setEstoque(livres)
        setErro('')
      })
      .catch((error) => {
        if (vivo) setErro(error.message)
      })
    return () => {
      vivo = false
    }
  }, [equipamentoId])

  function escolher(id) {
    setEquipamentoId(id)
    setParams(id ? { equipamento: id } : {}, { replace: true })
  }

  async function recarregar() {
    const [detalhe, livres] = await Promise.all([
      api.buscarEquipamento(equipamentoId),
      api.listarEstoque(),
    ])
    setEquipamento(detalhe)
    setEstoque(livres)
  }

  async function executar(acao) {
    if (ocupado) return
    setOcupado(true)
    try {
      await acao()
      await recarregar()
    } catch (error) {
      notify('erro', error.message)
    } finally {
      setOcupado(false)
      setDestaque(0)
      setSobreEstoque(false)
    }
  }

  function arrastarEstoque(event, pneuId) {
    event.dataTransfer.setData('text/plain', `estoque:${pneuId}`)
    event.dataTransfer.effectAllowed = 'move'
  }

  function arrastarPosicao(event, posicao) {
    event.dataTransfer.setData('text/plain', `posicao:${posicao}`)
    event.dataTransfer.effectAllowed = 'move'
  }

  function soltarNaPosicao(event, posicao) {
    event.preventDefault()
    const dado = lerArraste(event)
    if (!dado || !equipamentoId) return
    if (dado.tipo === 'estoque') {
      const ocupada = equipamento?.pneus.some((pneu) => pneu.posicao === posicao)
      if (ocupada) {
        notify('erro', 'Essa posição já tem pneu. Arraste um pneu montado para trocar, ou retire antes.')
        setDestaque(0)
        return
      }
      executar(() => api.montar(equipamentoId, posicao, dado.valor))
      return
    }
    if (dado.tipo === 'posicao' && dado.valor !== posicao) {
      executar(() => api.trocar(equipamentoId, dado.valor, posicao))
    }
  }

  function soltarNoEstoque(event) {
    event.preventDefault()
    const dado = lerArraste(event)
    if (!dado || dado.tipo !== 'posicao') {
      setSobreEstoque(false)
      return
    }
    executar(() => api.retirar(equipamentoId, dado.valor))
  }

  const visiveis = estoque.filter((pneu) => (
    textoContem(pneu.codigo, filtros.codigo)
    && textoContem(pneu.marca, filtros.marca)
    && textoContem(pneu.modelo, filtros.modelo)
    && textoContem(pneu.medida, filtros.medida)
  ))

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Rodízio</h1>
          <p>Escolha o equipamento e arraste os pneus do estoque até a posição. Pneu vinculado fica em uso e sai desta lista.</p>
        </div>
      </header>
      <div className="toolbar">
        <select value={equipamentoId} onChange={(event) => escolher(event.target.value)} aria-label="Equipamento">
          <option value="">Selecione o equipamento</option>
          {equipamentos.map((item) => (
            <option key={item.id} value={item.id}>
              {item.codigo} · {item.nome}
            </option>
          ))}
        </select>
        <Filtros
          campos={[
            { nome: 'codigo', rotulo: 'Código' },
            { nome: 'marca', rotulo: 'Marca' },
            { nome: 'modelo', rotulo: 'Modelo' },
            { nome: 'medida', rotulo: 'Medida' },
          ]}
          valores={filtros}
          onChange={(nome, valor) => setFiltros((atual) => ({ ...atual, [nome]: valor }))}
        />
      </div>
      {erro && <div className="form-error">{erro}</div>}
      {!equipamento && <p className="empty">Selecione um equipamento para abrir as posições.</p>}
      {equipamento && (
        <section className="page-body bancada">
          <aside
            className={sobreEstoque ? 'estoque-zona alvo' : 'estoque-zona'}
            onDragOver={(event) => {
              event.preventDefault()
              setSobreEstoque(true)
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setSobreEstoque(false)
            }}
            onDrop={soltarNoEstoque}
          >
            <h2>Estoque</h2>
            <p className="hint">Solte um pneu montado aqui para retirar do equipamento.</p>
            <div className="estoque-lista">
              {visiveis.map((pneu) => (
                <article
                  key={pneu.id}
                  className="pneu-arraste"
                  role="button"
                  aria-label={`${pneu.codigo} em estoque`}
                  draggable={!ocupado}
                  onDragStart={(event) => arrastarEstoque(event, pneu.id)}
                >
                  <strong>{pneu.codigo}</strong>
                  <span>{pneu.marca} {pneu.modelo}</span>
                  <small>{pneu.medida}</small>
                </article>
              ))}
              {visiveis.length === 0 && <p className="empty">Nenhum pneu em estoque.</p>}
            </div>
          </aside>
          <div className="maquina-painel">
            <div className="card-top">
              <div>
                <div className="hint">{equipamento.codigo} · {TIPO_EQUIPAMENTO[equipamento.tipo]}</div>
                <h2>{equipamento.nome}</h2>
              </div>
              <span className={`badge ${equipamento.status}`}>{equipamento.placa || 'sem placa'}</span>
            </div>
            <Maquina
              tipo={equipamento.tipo}
              nome={equipamento.nome}
              quantidade={equipamento.quantidadePosicoes}
              pneus={equipamento.pneus}
              destaque={destaque}
              onArrastarPosicao={arrastarPosicao}
              onSobre={setDestaque}
              onSoltar={(event, posicao) => {
                setDestaque(posicao)
                soltarNaPosicao(event, posicao)
              }}
            />
            <p className="hint">Arraste um pneu de uma posição para outra para trocar. Arraste de volta ao estoque para desmontar.</p>
          </div>
        </section>
      )}
      <Toast toast={toast} />
    </>
  )
}
