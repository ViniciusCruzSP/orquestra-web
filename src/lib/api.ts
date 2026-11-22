import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const cookieSessao = 'orquestra_sessao'

export class ErroApi extends Error {
  constructor(public status: number, mensagem: string) { super(mensagem) }
}

export async function requisitar(caminho: string, opcoes: RequestInit = {}) {
  const base = process.env.ORQUESTRA_API_URL
  if (!base) throw new ErroApi(503, 'Configure a URL da API no arquivo .env.local.')
  const token = (await cookies()).get(cookieSessao)?.value
  const headers = new Headers(opcoes.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (opcoes.body) headers.set('Content-Type', 'application/json')
  try {
    return await fetch(`${base.replace(/\/$/, '')}/api/${caminho}`, {
      ...opcoes, headers, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new ErroApi(503, 'Não foi possível conectar à API do Orquestra. Confira se ela está rodando.')
  }
}

export async function ler<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await requisitar(caminho, opcoes)
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null)
    throw new ErroApi(resposta.status, erro?.detail ?? erro?.title ??
      (resposta.status === 429 ? 'Muitas tentativas. Aguarde alguns minutos.' : 'Não foi possível concluir a operação.'))
  }
  return resposta.status === 204 ? (undefined as T) : resposta.json()
}

export async function consultar<T>(caminho: string): Promise<T> {
  try { return await ler<T>(caminho) }
  catch (erro) {
    if (erro instanceof ErroApi && erro.status === 401) redirect('/entrar')
    throw erro
  }
}
