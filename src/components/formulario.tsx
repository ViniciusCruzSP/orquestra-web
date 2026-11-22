'use client'

import { useActionState } from 'react'
import type { Resultado } from '@/features/sessao/acoes'

export function Formulario({ acao, children, botao, perigo, confirmar, simples }: {
  acao: (estado: Resultado, dados: FormData) => Promise<Resultado>
  children?: React.ReactNode; botao: string; perigo?: boolean; confirmar?: string; simples?: boolean
}) {
  const [estado, executar, enviando] = useActionState(acao, {})
  return <form className={simples ? 'formulario-simples' : 'formulario'} action={executar} onSubmit={evento => {
    if (confirmar && !window.confirm(confirmar)) evento.preventDefault()
  }}>
    {children}
    {estado.erro && <p role="alert" className="erro">{estado.erro}</p>}
    {estado.mensagem && <p role="status" className="sucesso">{estado.mensagem}</p>}
    <div><button className={'botao' + (perigo ? ' perigo' : '')} disabled={enviando}>{enviando ? 'Aguarde…' : botao}</button></div>
  </form>
}
