export type Perfil = 'Administrador' | 'Gestor de TI' | 'Operador de TI' | 'Auditor' | 'Colaborador'
export interface Sessao { usuarioId: string; email: string; perfil: Perfil; organizacaoId: string }
export interface Login extends Sessao { token: string; expiraEm: string }
export interface Paginado<T> { itens: T[]; total: number; pagina: number; itensPorPagina: number }
export interface Cadastro { id: string; nome: string; ativo?: boolean; ativa?: boolean }
export interface Colaborador { id: string; nomeCompleto: string; email: string; departamentoId: string | null; situacao: string; cpf?: string; cargo?: string; telefone?: string }
export interface Especificacoes {
  tipo: string; adquiridoEm: string | null; processador: string | null; memoriaRam: string | null
  armazenamento: string | null; sistemaOperacional: string | null; tipoPeriferico: string | null
}
export interface Ativo {
  id: string; categoriaId: string; patrimonio: string; nome: string; marca: string; modelo: string
  numeroDeSerie: string | null; observacoes: string | null; situacao: string; ativo: boolean; versaoDoRegistro: string
  especificacoes: Especificacoes | null; responsavel: string | null; custodiaAtualId: string | null
}
export interface Custodia { id: string; colaboradorId: string; entregueEm: string; observacoes: string | null; itens: ItemCustodia[] }
export interface ItemCustodia { id: string; ativoId: string; devolvidoEm: string | null }
export interface CustodiaPessoal { id: string; entregueEm: string; itens: { ativoId: string; patrimonio: string; nome: string; devolvidoEm: string | null }[] }
export interface Desligamento { id: string; colaboradorId: string; iniciadoEm: string; concluidoEm: string | null; ativosPendentesIds: string[] }
export interface Movimento {
  id: string; ativoId: string; patrimonio?: string; nome?: string; operacao?: string; tipo?: string
  situacaoAnterior: string; novaSituacao: string; ocorridoEm: string; usuarioId?: string; realizadoPorUsuarioId?: string
  motivo?: string; observacoes?: string
}
export interface Auditoria { id: string; acao: string; tipoDeEntidade: string; usuarioId: string; ocorridoEm: string }
export interface Painel {
  totalDeAtivos: number; ativosDisponiveis: number; ativosEmUso: number; ativosEmManutencao: number
  ativosComDefeito: number; ativosDescartados: number; colaboradoresAtivos: number; desligamentosAbertos: number
  itensPendentesDeDevolucao: number
}

export const estados = [
  ['Disponível', 'Em estoque'], ['EmUso', 'Em uso'], ['EmManutenção', 'Em manutenção'],
  ['ComDefeito', 'Com defeito'], ['Descartado', 'Descartado'],
] as const

export function rotulo(valor: string) {
  return estados.find(([chave]) => chave === valor)?.[1] ?? valor.replace(/([\p{Ll}])([\p{Lu}])/gu, '$1 $2')
}

export function dataHora(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
  }).format(new Date(valor))
}

export const podeOperar = (perfil: Perfil) => ['Administrador', 'Gestor de TI', 'Operador de TI'].includes(perfil)
export const podeInativar = (perfil: Perfil) => ['Administrador', 'Gestor de TI'].includes(perfil)
