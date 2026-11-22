import { ErroApi, ler } from '@/lib/api'
import { type Ativo, type Paginado, rotulo } from '@/lib/contratos'

function celula(valor: string) {
  const seguro = /^[\s]*[=+\-@\t\r\n]/.test(valor) ? "'" + valor : valor
  return '"' + seguro.replaceAll('"', '""') + '"'
}

export async function GET() {
  const linhas = ['Patrimônio;Ativo;Tipo;Fabricante;Modelo;Estado;Situação;Responsável']
  try {
    for (let pagina = 1; ; pagina++) {
      const lote = await ler<Paginado<Ativo>>(`ativos?pagina=${pagina}&itensPorPagina=100`)
      for (const a of lote.itens) linhas.push([
        a.patrimonio, a.nome, a.especificacoes?.tipo ?? '', a.marca, a.modelo, rotulo(a.situacao),
        a.ativo ? 'Ativo' : 'Inativo', a.responsavel ?? '',
      ].map(celula).join(';'))
      if (lote.itens.length < 100 || pagina * 100 >= lote.total) break
    }
  } catch (e) {
    return new Response('Não foi possível exportar o inventário.', { status: e instanceof ErroApi ? e.status : 503 })
  }
  return new Response('\uFEFF' + linhas.join('\r\n'), { headers: {
    'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="inventario-orquestra.csv"',
    'Cache-Control': 'private, no-store',
  } })
}
