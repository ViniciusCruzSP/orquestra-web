import { Marca } from '@/components/marca'

export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return <main className="acesso"><div className="cartao-acesso"><Marca />{children}</div></main>
}
