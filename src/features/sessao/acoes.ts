'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cookieSessao, ErroApi, ler } from '@/lib/api'
import type { Login } from '@/lib/contratos'

export type Resultado = { erro?: string; mensagem?: string }

export async function entrar(_: Resultado, dados: FormData): Promise<Resultado> {
  let login: Login
  try {
    login = await ler<Login>('autenticacao/entrar', {
      method: 'POST', body: JSON.stringify({ email: dados.get('email'), senha: dados.get('senha') }),
    })
  } catch (erro) {
    return { erro: erro instanceof ErroApi ? erro.message : 'Não foi possível entrar.' }
  }
  const expires = new Date(login.expiraEm)
  ;(await cookies()).set(cookieSessao, login.token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/',
    ...(dados.get('lembrar') ? { expires } : {}),
  })
  redirect(login.perfil === 'Colaborador' ? '/meus-ativos' : '/painel')
}

export async function sair() {
  ;(await cookies()).delete(cookieSessao)
  redirect('/entrar')
}

async function senha(caminho: string, corpo: object): Promise<Resultado> {
  try {
    const resposta = await ler<{ mensagem?: string } | undefined>(caminho, {
      method: 'POST', body: JSON.stringify(corpo),
    })
    return { mensagem: resposta?.mensagem ?? 'Senha alterada. Você já pode entrar com a nova senha.' }
  } catch (erro) {
    return { erro: erro instanceof ErroApi ? erro.message : 'Não foi possível concluir a solicitação.' }
  }
}

export async function recuperar(_: Resultado, dados: FormData): Promise<Resultado> {
  return senha('autenticacao/recuperar-senha', { email: dados.get('email') })
}

export async function redefinir(_: Resultado, dados: FormData): Promise<Resultado> {
  if (!dados.get('email') || !dados.get('codigo')) return { erro: 'Abra o link enviado por e-mail.' }
  if (dados.get('senha') !== dados.get('confirmacao')) return { erro: 'As senhas não coincidem.' }
  return senha('autenticacao/redefinir-senha', { email: dados.get('email'), codigo: dados.get('codigo'), senha: dados.get('senha') })
}
