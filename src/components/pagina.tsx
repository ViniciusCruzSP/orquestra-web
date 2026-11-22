import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { rotulo } from '@/lib/contratos'

export function Cabecalho({ titulo, descricao, acao, voltar }: {
  titulo: string; descricao?: string; acao?: React.ReactNode; voltar?: string
}) {
  return <div className="cabecalho-pagina"><div>
    {voltar && <Link className="link-voltar" href={voltar}><ArrowLeft size={16} /> Voltar</Link>}
    <h1>{titulo}</h1>{descricao && <p className="secundario">{descricao}</p>}
  </div>{acao}</div>
}

export function Etiqueta({ valor }: { valor: string }) {
  const cores: Record<string, string> = {
    Disponível: 'estoque', EmUso: 'verde', Ativo: 'verde', EmManutenção: 'ambar',
    ComDefeito: 'vermelho', Inativo: 'cinza', Descartado: 'cinza', EmDesligamento: 'ambar',
  }
  return <span className={`etiqueta ${cores[valor] ?? 'cinza'}`}>{rotulo(valor)}</span>
}

export type Busca = Record<string, string | string[] | undefined>
export function valor(busca: Busca, nome: string) {
  const v = busca[nome]; return typeof v === 'string' ? v : ''
}
export function consulta(busca: Busca, campos: string[]) {
  const parametros = new URLSearchParams()
  for (const campo of campos) {
    const v = valor(busca, campo); if (v) parametros.set(campo, v)
  }
  return parametros
}

export function Paginacao({ total, pagina, tamanho, params }: {
  total: number; pagina: number; tamanho: number; params: URLSearchParams
}) {
  const url = (p: number) => { const q = new URLSearchParams(params); q.set('pagina', String(p)); return '?' + q.toString() }
  return <div className="paginacao">
    <span>{total ? `${Math.min((pagina - 1) * tamanho + 1, total)}–${Math.min(pagina * tamanho, total)} de ${total}` : 'Nenhum registro'}</span>
    <div className="linha">
      {pagina > 1 && <Link className="botao secundario" href={url(pagina - 1)} aria-label="Página anterior"><ChevronLeft size={17} /></Link>}
      {total > pagina * tamanho && <Link className="botao secundario" href={url(pagina + 1)} aria-label="Próxima página"><ChevronRight size={17} /></Link>}
    </div>
  </div>
}

export function Tabela({ colunas, children }: { colunas: string[]; children: React.ReactNode }) {
  return <div className="tabela"><table><thead><tr>{colunas.map(c => <th scope="col" key={c}>{c}</th>)}</tr></thead>
    <tbody>{children}</tbody></table></div>
}

export function Vazio({ colunas, texto = 'Nenhum registro encontrado.' }: { colunas: number; texto?: string }) {
  return <tr><td className="vazio" colSpan={colunas}>{texto}</td></tr>
}
