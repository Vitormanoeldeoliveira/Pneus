import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Filtros } from '../components/Filtros'
import { TIPO_EQUIPAMENTO } from '../labels'

export function Painel() {
  const [totais, setTotais] = useState({ pneus: [], equipamentos: [] })
  const [equipamentos, setEquipamentos] = useState([])
  const [prontos, setProntos] = useState([])
  const [erro, setErro] = useState('')
  const [filtros, setFiltros] = useState({ codigo: '', nome: '', tipo: '', marca: '', medida: '' })

  useEffect(() => {
    let vivo = true
    Promise.all([api.listarPneus(), api.listarEquipamentos()])
      .then(([pneus, lista]) => {
        if (vivo) setTotais({ pneus, equipamentos: lista })
      })
      .catch((error) => {
        if (vivo) setErro(error.message)
      })
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    let vivo = true
    const espera = setTimeout(() => {
      Promise.all([
        api.listarEstoque({ codigo: filtros.codigo, marca: filtros.marca, medida: filtros.medida }),
        api.listarEquipamentos({ codigo: filtros.codigo, nome: filtros.nome, tipo: filtros.tipo }),
      ])
        .then(([livres, lista]) => {
          if (!vivo) return
          setProntos(livres)
          setEquipamentos(lista)
          setErro('')
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

  const estoque = totais.pneus.filter((pneu) => pneu.status === 'ESTOQUE').length
  const emUso = totais.pneus.filter((pneu) => pneu.status === 'EM_USO').length
  const ativos = totais.equipamentos.filter((item) => item.status === 'ATIVO').length
  const montados = totais.equipamentos.reduce((total, item) => total + item.pneus.length, 0)

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
