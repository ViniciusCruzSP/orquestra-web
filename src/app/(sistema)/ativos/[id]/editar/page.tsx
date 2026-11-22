import { EditarAtivo } from '@/features/ativos/paginas'
export default async function Pagina({ params }: { params: Promise<{ id: string }> }) {
  return <EditarAtivo id={(await params).id} />
}
