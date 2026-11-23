export const STATUS_PNEU = {
  ESTOQUE: 'Estoque',
  EM_USO: 'Em uso',
  DESCARTADO: 'Descartado',
}

export const STATUS_EQUIPAMENTO = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  MANUTENCAO: 'Manutenção',
}

export const TIPO_EQUIPAMENTO = {
  CAMINHAO: 'Caminhão',
  ONIBUS: 'Ônibus',
  TRATOR: 'Trator',
  EMPILHADEIRA: 'Empilhadeira',
  CARREGADEIRA: 'Carregadeira',
  OUTRO: 'Outro',
}

export const STATUS_RODIZIO = {
  A_FAZER: 'A fazer',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
}

export const COLUNAS = [
  { id: 'A_FAZER', titulo: 'A fazer', detalhe: 'Agendado' },
  { id: 'EM_ANDAMENTO', titulo: 'Em andamento', detalhe: 'Na oficina' },
  { id: 'CONCLUIDO', titulo: 'Concluído', detalhe: 'Pneus vinculados' },
]

export function dataBr(valor) {
  if (!valor) return '—'
  const [ano, mes, dia] = valor.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function mm(valor) {
  return `${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mm`
}

export function km(valor) {
  return `${Number(valor).toLocaleString('pt-BR')} km`
}
