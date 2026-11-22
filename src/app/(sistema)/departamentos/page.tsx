import type { Busca } from '@/components/pagina'
import { Catalogo } from '@/features/cadastros/paginas'
export default async function Pagina({ searchParams }: { searchParams: Promise<Busca> }) { return <Catalogo categoria={false} busca={await searchParams} /> }
