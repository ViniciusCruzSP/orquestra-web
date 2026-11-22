import { type Busca, valor } from '@/components/pagina'
import { NovaCustodia } from '@/features/custodias/paginas'
export default async function Pagina({ searchParams }: { searchParams: Promise<Busca> }) { return <NovaCustodia selecionado={valor(await searchParams, 'ativo')} /> }
