import { DetalhesCustodia } from '@/features/custodias/paginas'
export default async function Pagina({ params }: { params: Promise<{ id: string }> }) { return <DetalhesCustodia id={(await params).id} /> }
