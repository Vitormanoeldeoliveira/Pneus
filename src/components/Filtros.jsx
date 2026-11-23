import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const painel = {
  fechado: { height: 0, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
  aberto: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.28, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.05 },
  },
}

const campo = {
  fechado: { y: -10, opacity: 0 },
  aberto: { y: 0, opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } },
}

export function textoContem(valor, filtro) {
  const texto = filtro.trim().toLowerCase()
  if (!texto) return true
  return String(valor ?? '').toLowerCase().includes(texto)
}

export function Filtros({ campos, valores, onChange }) {
  const [aberto, setAberto] = useState(false)
  const ativos = campos.filter((item) => valores[item.nome]).length

  return (
    <div className="filtros">
      <button
        type="button"
        className={aberto ? 'ghost filtros-botao aberto' : 'ghost filtros-botao'}
        aria-expanded={aberto}
        onClick={() => setAberto((atual) => !atual)}
      >
        Filtros{ativos > 0 ? ` · ${ativos}` : ''}
      </button>
      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div
            className="filtros-painel"
            variants={painel}
            initial="fechado"
            animate="aberto"
            exit="fechado"
          >
            <div className="filtros-grade">
              {campos.map((item) => (
                <motion.label key={item.nome} variants={campo}>
                  {item.rotulo}
                  {item.opcoes ? (
                    <select value={valores[item.nome] || ''} onChange={(event) => onChange(item.nome, event.target.value)}>
                      <option value="">Todos</option>
                      {item.opcoes.map(([valor, rotulo]) => (
                        <option key={valor} value={valor}>{rotulo}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={valores[item.nome] || ''}
                      onChange={(event) => onChange(item.nome, event.target.value)}
                      placeholder={item.rotulo}
                    />
                  )}
                </motion.label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
