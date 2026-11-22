import type { Busca } from '@/components/pagina'
import { Pessoas } from '@/features/cadastros/paginas'
export default async function Pagina({ searchParams }: { searchParams: Promise<Busca> }) { return <Pessoas busca={await searchParams} /> }
