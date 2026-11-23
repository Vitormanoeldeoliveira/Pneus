import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Painel } from './pages/Painel'
import { Pneus } from './pages/Pneus'
import { Equipamentos } from './pages/Equipamentos'
import { Rodizio } from './pages/Rodizio'
import { Movimentacoes } from './pages/Movimentacoes'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Painel />} />
        <Route path="pneus" element={<Pneus />} />
        <Route path="equipamentos" element={<Equipamentos />} />
        <Route path="rodizio" element={<Rodizio />} />
        <Route path="movimentacoes" element={<Movimentacoes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
