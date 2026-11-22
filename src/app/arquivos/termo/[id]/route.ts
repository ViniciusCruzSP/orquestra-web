import { ErroApi, ler, requisitar } from '@/lib/api'
import type { Sessao } from '@/lib/contratos'

export async function GET(request: Request, contexto: { params: Promise<{ id: string }> }) {
  const { id } = await contexto.params
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))
    return new Response('Identificador inválido.', { status: 400 })
  try {
    const sessao = await ler<Sessao>('autenticacao/usuario-atual')
    const prefixo = sessao.perfil === 'Colaborador' ? 'minha-area/' : ''
    const pdf = await requisitar(`${prefixo}custodias/${id}/termo`)
    if (!pdf.ok) return new Response(pdf.status === 404 ? 'Termo não encontrado.' : 'Não foi possível abrir o termo.', { status: pdf.status })
    const modo = new URL(request.url).searchParams.has('baixar') ? 'attachment' : 'inline'
    return new Response(pdf.body, { headers: {
      'Content-Type': 'application/pdf', 'Content-Disposition': `${modo}; filename="termo-${id}.pdf"`,
      'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
    } })
  } catch (e) { return new Response('Não foi possível abrir o termo.', { status: e instanceof ErroApi ? e.status : 503 }) }
}
