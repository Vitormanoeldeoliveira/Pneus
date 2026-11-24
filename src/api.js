async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch('/api' + path, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Não conectou na API. Confira se ela está no ar em http://localhost:8080.')
  }

  if (response.status === 204) return null
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(data?.message || 'Não foi possível concluir a operação')
  }
  return data
}

function consulta(path, params) {
  const search = new URLSearchParams()
  if (params) {
    for (const [chave, valor] of Object.entries(params)) {
      if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
        search.set(chave, String(valor).trim())
      }
    }
  }
  const texto = search.toString()
  return request(texto ? `${path}?${texto}` : path)
}

export const api = {
  listarPneus: (filtros) => consulta('/pneus', filtros),
  criarPneu: (body) => request('/pneus', { method: 'POST', body }),
  atualizarPneu: (id, body) => request(`/pneus/${id}`, { method: 'PUT', body }),
  excluirPneu: (id) => request(`/pneus/${id}`, { method: 'DELETE' }),
  listarEstoque: (filtros) => consulta('/pneus/estoque', filtros),
  montar: (equipamentoId, posicao, pneuId) => request(`/equipamentos/${equipamentoId}/posicoes/${posicao}`, {
    method: 'POST',
    body: { pneuId },
  }),
  retirar: (equipamentoId, posicao) => request(`/equipamentos/${equipamentoId}/posicoes/${posicao}`, { method: 'DELETE' }),
  trocar: (equipamentoId, posicaoOrigem, posicaoDestino) => request(`/equipamentos/${equipamentoId}/troca`, {
    method: 'POST',
    body: { posicaoOrigem, posicaoDestino },
  }),

  listarEquipamentos: (filtros) => consulta('/equipamentos', filtros),
  buscarEquipamento: (id) => request(`/equipamentos/${id}`),
  criarEquipamento: (body) => request('/equipamentos', { method: 'POST', body }),
  atualizarEquipamento: (id, body) => request(`/equipamentos/${id}`, { method: 'PUT', body }),
  excluirEquipamento: (id) => request(`/equipamentos/${id}`, { method: 'DELETE' }),
  listarMovimentacoes: (filtros) => consulta('/movimentacoes', filtros),
}
