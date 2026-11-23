import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Filtros, textoContem } from '../components/Filtros'
import { TIPO_EQUIPAMENTO } from '../labels'

export function Painel() {
  const [dados, setDados] = useState({ pneus: [], equipamentos: [] })
  const [erro, setErro] = useState('')
  const [filtros, setFiltros] = useState({ codigo: '', nome: '', tipo: '', marca: '', medida: '' })

  useEffect(() => {
    let vivo = true
    Promise.all([api.listarPneus(), api.listarEquipamentos()])
      .then(([pneus, equipamentos]) => {
        if (vivo) setDados({ pneus, equipamentos })
      })
      .catch((error) => {
        if (vivo) setErro(error.message)
      })
    return () => {
      vivo = false
    }
  }, [])

  const equipamentos = useMemo(() => dados.equipamentos.filter((item) => (
    textoContem(item.codigo, filtros.codigo)
    && textoContem(item.nome, filtros.nome)
    && (!filtros.tipo || item.tipo === filtros.tipo)
  )), [dados.equipamentos, filtros])
  const prontos = useMemo(() => dados.pneus.filter((pneu) => (
    pneu.status === 'ESTOQUE'
    && textoContem(pneu.codigo, filtros.codigo)
    && textoContem(pneu.marca, filtros.marca)
    && textoContem(pneu.medida, filtros.medida)
  )), [dados.pneus, filtros])
  const estoque = dados.pneus.filter((pneu) => pneu.status === 'ESTOQUE').length
  const emUso = dados.pneus.filter((pneu) => pneu.status === 'EM_USO').length
  const ativos = dados.equipamentos.filter((item) => item.status === 'ATIVO').length
  const montados = dados.equipamentos.reduce((total, item) => total + item.pneus.length, 0)

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Oficina</h1>
          <p>Escolha um equipamento e arraste os pneus do estoque até a posição.</p>
        </div>
        <Link className="btn accent" to="/rodizio">Montar pneus</Link>
      </header>
      <Filtros
        campos={[
          { nome: 'codigo', rotulo: 'Código' },
          { nome: 'nome', rotulo: 'Nome' },
          { nome: 'tipo', rotulo: 'Tipo', opcoes: Object.entries(TIPO_EQUIPAMENTO) },
          { nome: 'marca', rotulo: 'Marca' },
          { nome: 'medida', rotulo: 'Medida' },
        ]}
        valores={filtros}
        onChange={(nome, valor) => setFiltros((atual) => ({ ...atual, [nome]: valor }))}
      />
      {erro && <div className="form-error">{erro}</div>}
      <section className="stats">
        <article className="stat"><span>Em estoque</span><strong>{estoque}</strong></article>
        <article className="stat"><span>Em uso</span><strong>{emUso}</strong></article>
        <article className="stat"><span>Equipamentos ativos</span><strong>{ativos}</strong></article>
        <article className="stat"><span>Pneus montados</span><strong>{montados}</strong></article>
      </section>
      <section className="page-body split">
        <article className="panel">
          <h2>Equipamentos</h2>
          {equipamentos.length === 0 && <p className="empty">Nenhum equipamento cadastrado.</p>}
          <ul>
            {equipamentos.map((item) => (
              <li className="line" key={item.id}>
                <Link to={`/rodizio?equipamento=${item.id}`}>
                  <strong>{item.codigo} · {item.nome}</strong>
                  <div className="hint">{TIPO_EQUIPAMENTO[item.tipo]} · {item.pneus.length}/{item.quantidadePosicoes} posições</div>
                </Link>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>Prontos para montar</h2>
          {prontos.length === 0 && <p className="empty">Estoque vazio.</p>}
          <ul>
            {prontos.slice(0, 6).map((pneu) => (
              <li className="line" key={pneu.id}>
                <div>
                  <strong>{pneu.codigo}</strong>
                  <div className="hint">{pneu.marca} {pneu.modelo}</div>
                </div>
                <span>{pneu.medida}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  )
}
