import 'server-only'
import { cache } from 'react'
import { consultar } from '@/lib/api'
import type { Paginado, Sessao } from '@/lib/contratos'

export const sessaoAtual = cache(() => consultar<Sessao>('autenticacao/usuario-atual'))

export async function listarTudo<T>(rota: string, filtros = new URLSearchParams()): Promise<T[]> {
  const resultado: T[] = []
  const params = new URLSearchParams(filtros)
  params.set('itensPorPagina', '100')
  for (let pagina = 1; ; pagina++) {
    params.set('pagina', String(pagina))
    const lista = await consultar<Paginado<T>>(`${rota}?${params}`)
    resultado.push(...lista.itens)
    if (lista.itens.length < 100 || resultado.length >= lista.total) return resultado
  }
}
