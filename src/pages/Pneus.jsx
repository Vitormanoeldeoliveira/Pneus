import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { useConfirm } from '../components/Confirm'
import { Filtros, textoContem } from '../components/Filtros'
import { Modal } from '../components/Modal'
import { Toast, useToast } from '../components/Toast'
import { STATUS_PNEU, km, mm } from '../labels'

const VAZIO = {
  codigo: '',
  marca: '',
  modelo: '',
  medida: '',
  sulcoMm: '',
  km: '',
  status: 'ESTOQUE',
  dataAquisicao: '',
  observacao: '',
}

function numero(valor) {
  const texto = String(valor).trim()
  if (!texto) return null
  const n = Number(texto.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function validar(form) {
  const faltas = []
  if (!form.codigo.trim()) faltas.push('Falta o código')
  else if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(form.codigo.trim())) {
    faltas.push('Código só pode ter letras, números, ponto, barra e hífen')
  }
  if (!form.marca.trim()) faltas.push('Falta a marca')
  if (!form.modelo.trim()) faltas.push('Falta o modelo')
  if (!form.medida.trim()) faltas.push('Falta a medida')
  const sulco = numero(form.sulcoMm)
  if (sulco == null) faltas.push('Falta o sulco')
  else if (sulco < 0) faltas.push('O sulco não pode ser negativo')
  const rodagem = numero(form.km)
  if (rodagem == null) faltas.push('Falta a quilometragem')
  else if (rodagem < 0) faltas.push('A quilometragem não pode ser negativa')
  return faltas.length ? faltas.join('. ') : null
}

export function Pneus() {
  const [pneus, setPneus] = useState([])
  const [filtros, setFiltros] = useState({ codigo: '', marca: '', modelo: '', medida: '', status: '', equipamento: '' })
  const [form, setForm] = useState(null)
  const [erro, setErro] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [salvando, setSalvando] = useState(false)
  const { toast, notify } = useToast()
  const { confirmar, dialog } = useConfirm()

  async function carregar() {
    try {
      setPneus(await api.listarPneus())
      setErro('')
    } catch (error) {
      setErro(error.message)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const visiveis = useMemo(() => pneus.filter((pneu) => (
    textoContem(pneu.codigo, filtros.codigo)
    && textoContem(pneu.marca, filtros.marca)
    && textoContem(pneu.modelo, filtros.modelo)
    && textoContem(pneu.medida, filtros.medida)
    && textoContem(pneu.equipamento?.codigo, filtros.equipamento)
    && (!filtros.status || pneu.status === filtros.status)
  )), [pneus, filtros])

  function abrirNovo() {
    setErroForm('')
    setForm({ ...VAZIO, id: null, montado: false })
  }

  function abrirEdicao(pneu) {
    setErroForm('')
    setForm({
      id: pneu.id,
      codigo: pneu.codigo,
      marca: pneu.marca,
      modelo: pneu.modelo,
      medida: pneu.medida,
      sulcoMm: String(pneu.sulcoMm),
      km: String(pneu.km),
      status: pneu.status,
      dataAquisicao: pneu.dataAquisicao || '',
      observacao: pneu.observacao || '',
      montado: Boolean(pneu.equipamento),
      equipamento: pneu.equipamento ? `${pneu.equipamento.codigo} · posição ${pneu.posicao}` : '',
    })
  }

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function salvar(event) {
    event.preventDefault()
    const mensagem = validar(form)
    if (mensagem) {
      setErroForm(mensagem)
      return
    }
    const payload = {
      codigo: form.codigo.trim(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      medida: form.medida.trim(),
      sulcoMm: Math.round(numero(form.sulcoMm) * 10) / 10,
      km: Math.round(numero(form.km)),
      status: form.montado ? 'EM_USO' : form.status,
      dataAquisicao: form.dataAquisicao || null,
      observacao: form.observacao.trim() || null,
    }
    setSalvando(true)
    try {
      if (form.id) await api.atualizarPneu(form.id, payload)
      else await api.criarPneu(payload)
      setForm(null)
      await carregar()
      notify('ok', form.id ? 'Pneu atualizado' : 'Pneu cadastrado')
    } catch (error) {
      setErroForm(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(pneu) {
    if (!await confirmar(`Excluir o pneu ${pneu.codigo}?`)) return
    try {
      await api.excluirPneu(pneu.id)
      await carregar()
      notify('ok', 'Pneu excluído')
    } catch (error) {
      notify('erro', error.message)
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Pneus</h1>
          <p>Cadastro completo. O vínculo com o equipamento é feito arrastando o pneu na tela de rodízio.</p>
        </div>
        <button type="button" className="accent" onClick={abrirNovo}>Novo pneu</button>
      </header>
      <Filtros
        campos={[
          { nome: 'codigo', rotulo: 'Código' },
          { nome: 'marca', rotulo: 'Marca' },
          { nome: 'modelo', rotulo: 'Modelo' },
          { nome: 'medida', rotulo: 'Medida' },
          { nome: 'equipamento', rotulo: 'Equipamento' },
          { nome: 'status', rotulo: 'Status', opcoes: Object.entries(STATUS_PNEU) },
        ]}
        valores={filtros}
        onChange={(nome, valor) => setFiltros((atual) => ({ ...atual, [nome]: valor }))}
      />
      {erro && <div className="form-error">{erro} <button type="button" className="ghost" onClick={carregar}>Tentar de novo</button></div>}
      <div className="page-body table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Pneu</th>
              <th>Medida</th>
              <th>Sulco</th>
              <th>Km</th>
              <th>Status</th>
              <th>Equipamento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((pneu) => (
              <tr key={pneu.id}>
                <td><strong>{pneu.codigo}</strong></td>
                <td>{pneu.marca} {pneu.modelo}</td>
                <td>{pneu.medida}</td>
                <td>{mm(pneu.sulcoMm)}</td>
                <td>{km(pneu.km)}</td>
                <td><span className={`badge ${pneu.status}`}>{STATUS_PNEU[pneu.status]}</span></td>
                <td>{pneu.equipamento ? `${pneu.equipamento.codigo} · pos. ${pneu.posicao}` : '—'}</td>
                <td>
                  <div className="actions">
                    <button type="button" className="ghost" onClick={() => abrirEdicao(pneu)}>Editar</button>
                    <button type="button" className="danger" onClick={() => excluir(pneu)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr><td colSpan="8"><p className="empty">Nenhum pneu encontrado.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form.id ? 'Editar pneu' : 'Novo pneu'} onClose={() => setForm(null)}>
          <form onSubmit={salvar} noValidate>
            <div className="form-grid">
              <label>Código<input value={form.codigo} onChange={(event) => atualizar('codigo', event.target.value)} required /></label>
              <label>Marca<input value={form.marca} onChange={(event) => atualizar('marca', event.target.value)} required /></label>
              <label>Modelo<input value={form.modelo} onChange={(event) => atualizar('modelo', event.target.value)} required /></label>
              <label>Medida<input value={form.medida} onChange={(event) => atualizar('medida', event.target.value)} required /></label>
              <label>Sulco (mm)<input value={form.sulcoMm} onChange={(event) => atualizar('sulcoMm', event.target.value)} inputMode="decimal" required /></label>
              <label>Quilometragem<input value={form.km} onChange={(event) => atualizar('km', event.target.value)} inputMode="numeric" required /></label>
              <label>Status
                <select value={form.status} onChange={(event) => atualizar('status', event.target.value)} disabled={form.montado}>
                  {(form.montado ? ['EM_USO'] : ['ESTOQUE', 'DESCARTADO']).map((valor) => (
                    <option key={valor} value={valor}>{STATUS_PNEU[valor]}</option>
                  ))}
                </select>
              </label>
              <label>Aquisição<input type="date" value={form.dataAquisicao} onChange={(event) => atualizar('dataAquisicao', event.target.value)} /></label>
              <label className="span-2">Observação
                <textarea value={form.observacao} onChange={(event) => atualizar('observacao', event.target.value)} />
              </label>
            </div>
            {form.montado && <p className="hint">Montado em {form.equipamento}. Para devolver ao estoque, arraste o pneu para fora do equipamento.</p>}
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
