import type { Busca } from '@/components/pagina'
import { Custodias } from '@/features/custodias/paginas'
export default async function Pagina({ searchParams }: { searchParams: Promise<Busca> }) { return <Custodias busca={await searchParams} /> }
