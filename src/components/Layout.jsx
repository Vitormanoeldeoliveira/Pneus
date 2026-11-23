import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Painel', end: true, icon: 'P' },
  { to: '/pneus', label: 'Pneus', icon: 'N' },
  { to: '/equipamentos', label: 'Equipamentos', icon: 'E' },
  { to: '/rodizio', label: 'Rodízio', icon: 'R' },
  { to: '/movimentacoes', label: 'Movimentações', icon: 'M' },
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
              <span className="nav-icon" aria-hidden="true">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="sidebar-toggle"
          aria-expanded={aberta}
          onClick={() => setAberta((valor) => !valor)}
        >
          {aberta ? 'Recolher' : 'Expandir'}
        </button>
        <a className="swagger" href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" title="Swagger">
          <span className="nav-icon" aria-hidden="true">S</span>
          <span className="nav-label">Abrir Swagger</span>
        </a>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
