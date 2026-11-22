'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { entrar, recuperar, redefinir } from './acoes'

export function FormularioSessao({ modo }: { modo: 'entrar' | 'recuperar' | 'redefinir' }) {
  const [estado, acao, pendente] = useActionState({ entrar, recuperar, redefinir }[modo], {})
  const [visivel, setVisivel] = useState(false)
  const titulo = { entrar: 'Acesse sua conta', recuperar: 'Recuperar senha', redefinir: 'Definir nova senha' }[modo]
  return <>
    <h1>{titulo}</h1>
    <p className="secundario acesso-intro">{modo === 'entrar' ? 'Entre com suas credenciais corporativas para continuar.' :
      modo === 'recuperar' ? 'Informe seu e-mail corporativo para receber as instruções de redefinição.' : 'Escolha uma nova senha para sua conta.'}</p>
    <form action={acao} onSubmit={evento => {
      if (modo !== 'redefinir') return
      const valores = new URLSearchParams(window.location.hash.slice(1))
      for (const campo of ['email', 'codigo']) {
        const input = evento.currentTarget.elements.namedItem(campo) as HTMLInputElement
        input.value = valores.get(campo) ?? ''
      }
    }}>
      {modo === 'redefinir' ? <><input type="hidden" name="email" /><input type="hidden" name="codigo" /></> :
        <label>E-mail<input name="email" type="email" placeholder="nome@empresa.com.br" autoComplete="username" required /></label>}
      {modo !== 'recuperar' && <label>Senha
        <span className="campo-senha"><input name="senha" type={visivel ? 'text' : 'password'}
          autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
          minLength={modo === 'redefinir' ? 12 : undefined} required placeholder="Digite sua senha" />
          <button type="button" className="icone" aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setVisivel(!visivel)}>
            {visivel ? <EyeOff size={17} /> : <Eye size={17} />}
          </button></span>
      </label>}
      {modo === 'redefinir' && <label>Confirme a nova senha<input type="password" name="confirmacao" autoComplete="new-password" required /></label>}
      {modo === 'entrar' && <div className="linha acesso-opcoes">
        <label className="check"><input name="lembrar" type="checkbox" /> Lembrar meu acesso</label>
        <Link href="/recuperar-senha">Esqueci minha senha</Link>
      </div>}
      {estado.erro && <p className="erro" role="alert">{estado.erro}</p>}
      {estado.mensagem && <p className="sucesso" role="status">{estado.mensagem}</p>}
      <button className="botao" disabled={pendente}>{pendente ? 'Aguarde…' :
        { entrar: 'Entrar', recuperar: 'Enviar instruções', redefinir: 'Salvar nova senha' }[modo]}</button>
    </form>
    {modo !== 'entrar' && <Link className="voltar-login" href="/entrar">Voltar ao login</Link>}
  </>
}
