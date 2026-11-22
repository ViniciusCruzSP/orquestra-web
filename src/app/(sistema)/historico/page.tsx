import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Download } from 'lucide-react'
import { Cabecalho, Paginacao, consulta, valor, type Busca } from '@/components/pagina'
import { TabelaHistorico } from '@/features/historico/tabela'
import { consultar } from '@/lib/api'
import { sessaoAtual } from '@/lib/dados'
import { estados, type Movimento, type Paginado } from '@/lib/contratos'

export default async function Historico({ searchParams }: { searchParams: Promise<Busca> }) {
  if ((await sessaoAtual()).perfil === 'Colaborador') redirect('/meus-ativos')
  const busca = await searchParams
  const params = consulta(busca, ['busca', 'situacao', 'de', 'ate', 'pagina'])
  const itens = await consultar<Paginado<Movimento>>('relatorios/historico?' + params)
  return <><Cabecalho titulo="Histórico e relatórios" descricao="Confira as mudanças de estado e exporte o inventário."
    acao={<a className="botao" href="/arquivos/inventario"><Download size={17} /> Exportar inventário CSV</a>} />
    <section className="cartao"><form className="filtros">
      <label>Ativo<input name="busca" defaultValue={valor(busca, 'busca')} placeholder="Nome ou patrimônio" /></label>
      <label>Novo estado<select name="situacao" defaultValue={valor(busca, 'situacao')}><option value="">Todos os estados</option>
        {estados.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}</select></label>
      <label>De<input type="date" name="de" defaultValue={valor(busca, 'de')} /></label>
      <label>Até<input type="date" name="ate" defaultValue={valor(busca, 'ate')} /></label>
      <button className="botao">Filtrar</button><Link className="botao secundario" href="/historico">Limpar</Link>
    </form><TabelaHistorico itens={itens.itens} />
      <Paginacao total={itens.total} pagina={itens.pagina} tamanho={itens.itensPorPagina} params={params} />
    </section>
  </>
}
