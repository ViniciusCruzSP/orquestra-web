import type { Metadata } from 'next'
import './estilos.css'

export const metadata: Metadata = {
  title: { default: 'Orquestra', template: '%s | Orquestra' },
  description: 'Gestão e controle de ativos de TI',
  icons: '/marca.png',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
