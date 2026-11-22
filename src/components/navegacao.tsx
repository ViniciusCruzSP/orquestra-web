'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Archive, Boxes, ClipboardList, LayoutDashboard, PackageCheck, Users, UserRoundMinus, Shield, Tags } from 'lucide-react'
import type { Perfil } from '@/lib/contratos'

const opcoes = [
  ['painel', 'Painel', LayoutDashboard], ['colaboradores', 'Colaboradores', Users],
  ['ativos', 'Inventário', Boxes], ['custodias', 'Custódias', PackageCheck],
  ['desligamentos', 'Desligamentos', UserRoundMinus], ['historico', 'Histórico e relatórios', ClipboardList],
  ['departamentos', 'Departamentos', Archive], ['categorias', 'Categorias', Tags], ['auditoria', 'Auditoria', Shield],
] as const

export function Navegacao({ perfil }: { perfil: Perfil }) {
  const caminho = usePathname()
  const items = perfil === 'Colaborador' ? [['meus-ativos', 'Meus ativos', Boxes] as const] :
    opcoes.filter(([id]) => id !== 'auditoria' || perfil === 'Administrador' || perfil === 'Auditor')
  return <nav aria-label="Menu principal">
    {items.map(([id, texto, Icone]) => {
      const ativo = caminho === '/' + id || caminho.startsWith('/' + id + '/')
      return <Link key={id} href={'/' + id} aria-current={ativo ? 'page' : undefined}>
        <Icone size={18} aria-hidden /> {texto}
      </Link>
    })}
  </nav>
}
