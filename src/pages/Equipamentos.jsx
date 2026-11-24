import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useConfirm } from '../components/Confirm'
import { Filtros } from '../components/Filtros'
import { Modal } from '../components/Modal'
import { Toast, useToast } from '../components/Toast'
import { STATUS_EQUIPAMENTO, TIPO_EQUIPAMENTO } from '../labels'

function CarrosselPosicoes({ quantidade, pneus }) {
  const [passo, setPasso] = useState(0)
  const pausa = useRef(false)
  const total = quantidade

  useEffect(() => {
    if (total <= 3) return undefined
    const id = window.setInterval(() => {
      if (!pausa.current) setPasso((atual) => (atual + 1) % total)
    }, 2600)
    return () => window.clearInterval(id)
  }, [total])

  const janela = Array.from({ length: Math.min(3, total) }, (_, indice) => ((passo + indice) % total) + 1)

  return (
    <div
      className="pos-map"
      onMouseEnter={() => { pausa.current = true }}
      onMouseLeave={() => { pausa.current = false }}
    >
      {janela.map((posicao) => {
        const pneu = pneus.find((atual) => atual.posicao === posicao)
        const descricao = pneu
          ? `${pneu.marca} ${pneu.modelo}${pneu.medida ? ` · ${pneu.medida}` : ''}`
          : 'Posição livre'
        return (
          <div className={pneu ? 'pos filled' : 'pos'} key={posicao}>
            <strong>Posição {posicao}</strong>
            <span>{pneu ? pneu.codigo : 'vazia'}</span>
            <span className="pos-tip">{descricao}</span>
          </div>
        )
      })}
      {total > 3 && (
        <div className="pos-dots" aria-hidden="true">
          {Array.from({ length: total }, (_, indice) => (
            <span key={indice} className={janela.includes(indice + 1) ? 'on' : ''} />
          ))}
        </div>
      )}
    </div>
  )
}

const VAZIO = {
  codigo: '',
  nome: '',
  tipo: 'CAMINHAO',
  placa: '',
  quantidadePosicoes: '6',
  status: 'ATIVO',
  observacao: '',
}

export function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([])
  const [filtros, setFiltros] = useState({ codigo: '', nome: '', placa: '', tipo: '', status: '' })
  const [form, setForm] = useState(null)
  const [erro, setErro] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [salvando, setSalvando] = useState(false)
  const { toast, notify } = useToast()
  const { confirmar, dialog } = useConfirm()

  async function carregar() {
    try {
      setEquipamentos(await api.listarEquipamentos(filtros))
      setErro('')
    } catch (error) {
      setErro(error.message)
    }
  }

  useEffect(() => {
    let vivo = true
    const espera = setTimeout(() => {
      api.listarEquipamentos(filtros)
        .then((lista) => {
          if (vivo) {
            setEquipamentos(lista)
            setErro('')
          }
        })
        .catch((error) => {
          if (vivo) setErro(error.message)
        })
    }, 250)
    return () => {
      vivo = false
      clearTimeout(espera)
    }
  }, [filtros])

  function abrirNovo() {
    setErroForm('')
    setForm({ ...VAZIO, id: null })
  }

  function abrirEdicao(item) {
    setErroForm('')
    setForm({
      id: item.id,
      codigo: item.codigo,
      nome: item.nome,
      tipo: item.tipo,
      placa: item.placa || '',
      quantidadePosicoes: String(item.quantidadePosicoes),
      status: item.status,
      observacao: item.observacao || '',
    })
  }

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function salvar(event) {
    event.preventDefault()
    const posicoes = Number(form.quantidadePosicoes)
    const faltas = []
    if (!form.codigo.trim()) faltas.push('Falta o código')
    if (!form.nome.trim()) faltas.push('Falta o nome')
    if (!form.tipo) faltas.push('Falta o tipo')
    if (!form.status) faltas.push('Falta o status')
    if (!String(form.quantidadePosicoes).trim()) faltas.push('Falta a quantidade de posições')
    else if (!Number.isInteger(posicoes) || posicoes < 1 || posicoes > 24) {
      faltas.push('A quantidade de posições precisa ser de 1 a 24')
    }
    if (faltas.length) {
      setErroForm(faltas.join('. '))
      return
    }
    const payload = {
      codigo: form.codigo.trim(),
      nome: form.nome.trim(),
      tipo: form.tipo,
      placa: form.placa.trim() || null,
      quantidadePosicoes: posicoes,
      status: form.status,
      observacao: form.observacao.trim() || null,
    }
    setSalvando(true)
    try {
      if (form.id) await api.atualizarEquipamento(form.id, payload)
      else await api.criarEquipamento(payload)
      setForm(null)
      await carregar()
      notify('ok', form.id ? 'Equipamento atualizado' : 'Equipamento cadastrado')
    } catch (error) {
      setErroForm(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(item) {
    if (!await confirmar(`Excluir o equipamento ${item.codigo}?`)) return
    try {
      await api.excluirEquipamento(item.id)
      await carregar()
      notify('ok', 'Equipamento excluído')
    } catch (error) {
      notify('erro', error.message)
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Equipamentos</h1>
          <p>Passe o mouse na posição para ver o pneu. O carrossel mostra três por vez.</p>
        </div>
        <button type="button" className="accent" onClick={abrirNovo}>Novo equipamento</button>
      </header>
      <Filtros
        campos={[
          { nome: 'codigo', rotulo: 'Código' },
          { nome: 'nome', rotulo: 'Nome' },
          { nome: 'placa', rotulo: 'Placa' },
          { nome: 'tipo', rotulo: 'Tipo', opcoes: Object.entries(TIPO_EQUIPAMENTO) },
          { nome: 'status', rotulo: 'Status', opcoes: Object.entries(STATUS_EQUIPAMENTO) },
        ]}
        valores={filtros}
        onChange={(nome, valor) => setFiltros((atual) => ({ ...atual, [nome]: valor }))}
      />
      {erro && <div className="form-error">{erro}</div>}
      <section className="page-body eq-grid">
        {equipamentos.map((item) => (
          <article className="eq-card" key={item.id}>
            <div className="card-top">
              <div>
                <div className="hint">{item.codigo}</div>
                <h3>{item.nome}</h3>
              </div>
              <span className={`badge ${item.status}`}>{STATUS_EQUIPAMENTO[item.status]}</span>
            </div>
            <p className="meta">{TIPO_EQUIPAMENTO[item.tipo]}{item.placa ? ` · ${item.placa}` : ''}</p>
            <CarrosselPosicoes quantidade={item.quantidadePosicoes} pneus={item.pneus} />
            <div className="actions">
              <Link className="btn accent" to={`/rodizio?equipamento=${item.id}`}>Montar pneus</Link>
              <button type="button" className="ghost" onClick={() => abrirEdicao(item)}>Editar</button>
              <button type="button" className="danger" onClick={() => excluir(item)}>Excluir</button>
            </div>
          </article>
        ))}
      </section>
      {equipamentos.length === 0 && !erro && <p className="empty">Nenhum equipamento encontrado.</p>}

      {form && (
        <Modal title={form.id ? 'Editar equipamento' : 'Novo equipamento'} onClose={() => setForm(null)}>
          <form onSubmit={salvar} noValidate>
            <div className="form-grid">
              <label>Código<input value={form.codigo} onChange={(event) => atualizar('codigo', event.target.value)} required /></label>
              <label>Nome<input value={form.nome} onChange={(event) => atualizar('nome', event.target.value)} required /></label>
              <label>Tipo
                <select value={form.tipo} onChange={(event) => atualizar('tipo', event.target.value)}>
                  {Object.entries(TIPO_EQUIPAMENTO).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>{rotulo}</option>
                  ))}
                </select>
              </label>
              <label>Placa<input value={form.placa} onChange={(event) => atualizar('placa', event.target.value)} /></label>
              <label>Posições de pneu
                <input type="number" min="1" max="24" value={form.quantidadePosicoes} onChange={(event) => atualizar('quantidadePosicoes', event.target.value)} required />
              </label>
              <label>Status
                <select value={form.status} onChange={(event) => atualizar('status', event.target.value)}>
                  {Object.entries(STATUS_EQUIPAMENTO).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>{rotulo}</option>
                  ))}
                </select>
              </label>
              <label className="span-2">Observação
                <textarea value={form.observacao} onChange={(event) => atualizar('observacao', event.target.value)} />
              </label>
            </div>
            {erroForm && <div className="form-error">{erroForm}</div>}
            <div className="modal-actions">
              <button type="button" className="ghost" onClick={() => setForm(null)}>Cancelar</button>
              <button type="submit" className="accent" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </Modal>
      )}
      {dialog}
      <Toast toast={toast} />
    </>
  )
}
