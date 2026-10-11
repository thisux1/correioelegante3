export const MOMENTOS = [
  { id: 'crush_secreto', nome: 'Crush secreto', descricao: 'Mistério, pistas e a revelação de quem sempre quis contar', disponivel: true },
  { id: 'carta_amor', nome: 'Carta de amor', descricao: 'Memórias, intimidade e futuro', disponivel: true },
  { id: 'convite_date', nome: 'Convite pra sair', descricao: 'Chama pra um date com resposta na hora', disponivel: true },
  { id: 'pedido_namoro', nome: 'Pedido de namoro', descricao: 'Buildup, clímax e celebração', disponivel: true },
  { id: 'data_especial', nome: 'Data especial', descricao: 'Aniversário de namoro, meses juntos, conquistas', disponivel: true },
  { id: 'desculpas', nome: 'Pedido de desculpas', descricao: 'Vulnerável e direto, sem jogos', disponivel: true },
  { id: 'anonimo', nome: 'Anônimo', descricao: 'Intriga total. Ela descobre aos poucos', disponivel: true },
  { id: 'so_porque_sim', nome: 'Só porque sim', descricao: 'Um gesto pequeno que vale muito', disponivel: true },
] as const

export type MomentoId = (typeof MOMENTOS)[number]['id']
