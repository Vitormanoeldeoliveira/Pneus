import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  PiArrowsClockwise,
  PiBookOpen,
  PiCaretLeft,
  PiCaretRight,
  PiClockCounterClockwise,
  PiGauge,
  PiTire,
  PiTruck,
} from 'react-icons/pi'

const LINKS = [
  { to: '/', label: 'Painel', end: true, Icon: PiGauge },
  { to: '/pneus', label: 'Pneus', Icon: PiTire },
  { to: '/equipamentos', label: 'Equipamentos', Icon: PiTruck },
  { to: '/rodizio', label: 'Rodízio', Icon: PiArrowsClockwise },
  { to: '/movimentacoes', label: 'Movimentações', Icon: PiClockCounterClockwise },
]

export function Layout() {
  const [aberta, setAberta] = useState(() => localStorage.getItem('rodizio-sidebar') !== 'recolhida')

  useEffect(() => {
    localStorage.setItem('rodizio-sidebar', aberta ? 'aberta' : 'recolhida')
  }, [aberta])

  return (
    <div className={aberta ? 'app' : 'app recolhida'}>
      <aside>
        <div className="brand">
          <span className="tire" aria-hidden="true" />
          <div className="brand-text">
            <strong>Rodízio API</strong>
            <span>Pneus e rodízio</span>
          </div>
        </div>
        <nav>
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} title={link.label}>
              <span className="nav-icon" aria-hidden="true"><link.Icon size={17} /></span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="sidebar-toggle"
          aria-expanded={aberta}
          title={aberta ? 'Recolher' : 'Expandir'}
          onClick={() => setAberta((valor) => !valor)}
        >
          {aberta ? <PiCaretLeft size={18} /> : <PiCaretRight size={18} />}
          <span className="nav-label">{aberta ? 'Recolher' : 'Expandir'}</span>
        </button>
        <a className="swagger" href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" title="Swagger">
          <PiBookOpen size={16} aria-hidden="true" />
          <span className="nav-label">Abrir Swagger</span>
        </a>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
