import type { Busca } from '@/components/pagina'
import { MinhaArea } from '@/features/custodias/paginas'
export default async function Pagina({ searchParams }: { searchParams: Promise<Busca> }) { return <MinhaArea busca={await searchParams} /> }
