import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LogOut } from 'lucide-react'
import { Marca } from '@/components/marca'
import { Navegacao } from '@/components/navegacao'
import { consultar, cookieSessao } from '@/lib/api'
import type { Sessao } from '@/lib/contratos'
import { sair } from '@/features/sessao/acoes'

export default async function Sistema({ children }: { children: React.ReactNode }) {
  if (!(await cookies()).has(cookieSessao)) redirect('/entrar')
  const sessao = await consultar<Sessao>('autenticacao/usuario-atual')
  return <div className="sistema">
    <aside className="barra"><Marca /><Navegacao perfil={sessao.perfil} /></aside>
    <div className="area">
      <header className="topo">
        <span>Gestão de ativos de TI</span>
        <div className="linha">
          <div className="avatar" aria-hidden>{sessao.email.slice(0, 2).toUpperCase()}</div>
          <div className="identidade"><strong>{sessao.email}</strong><small>{sessao.perfil}</small></div>
          <form action={sair}><button className="botao texto" aria-label="Sair"><LogOut size={17} /> Sair</button></form>
        </div>
      </header>
      <main className="conteudo" id="conteudo">{children}</main>
    </div>
  </div>
}
