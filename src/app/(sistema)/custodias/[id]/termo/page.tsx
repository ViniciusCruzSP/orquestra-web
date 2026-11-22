import { Termo } from '@/features/custodias/paginas'
export default async function Pagina({ params }: { params: Promise<{ id: string }> }) { return <Termo id={(await params).id} /> }
