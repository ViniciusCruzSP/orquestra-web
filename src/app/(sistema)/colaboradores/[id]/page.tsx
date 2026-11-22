import { EditarPessoa } from '@/features/cadastros/paginas'
export default async function Pagina({ params }: { params: Promise<{ id: string }> }) { return <EditarPessoa id={(await params).id} /> }
