import { type Busca } from '@/components/pagina'
import { DetalhesAtivo } from '@/features/ativos/paginas'
export default async function Pagina({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Busca> }) {
  return <DetalhesAtivo id={(await params).id} busca={await searchParams} />
}
