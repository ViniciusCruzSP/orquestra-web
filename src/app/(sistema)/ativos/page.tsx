import { type Busca } from '@/components/pagina'
import { Inventario } from '@/features/ativos/paginas'
export default async function Pagina({ searchParams }: { searchParams: Promise<Busca> }) {
  return <Inventario busca={await searchParams} />
}
