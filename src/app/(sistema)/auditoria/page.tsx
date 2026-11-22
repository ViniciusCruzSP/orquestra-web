import { redirect } from 'next/navigation'
import { Cabecalho, Paginacao, Tabela, Vazio, consulta, valor, type Busca } from '@/components/pagina'
import { consultar } from '@/lib/api'
import { sessaoAtual } from '@/lib/dados'
import { dataHora, rotulo, type Auditoria, type Paginado } from '@/lib/contratos'

export default async function PaginaAuditoria({ searchParams }: { searchParams: Promise<Busca> }) {
  const { perfil } = await sessaoAtual()
  if (perfil !== 'Administrador' && perfil !== 'Auditor') redirect('/painel')
  const busca = await searchParams
  const params = consulta(busca, ['pagina', 'busca'])
  const lista = await consultar<Paginado<Auditoria>>('auditoria?' + params)
  return <><Cabecalho titulo="Auditoria" descricao="Consulte as operações registradas na organização." />
    <section className="cartao"><form className="filtros"><label>Buscar ação ou registro
      <input name="busca" defaultValue={valor(busca, 'busca')} /></label><button className="botao">Buscar</button></form>
      <Tabela colunas={['Data e hora', 'Ação', 'Registro', 'Usuário']}>
        {lista.itens.map(a => <tr key={a.id}><td>{dataHora(a.ocorridoEm)}</td><td>{a.acao}</td>
          <td>{rotulo(a.tipoDeEntidade)}</td><td><code>{a.usuarioId}</code></td></tr>)}
        {!lista.itens.length && <Vazio colunas={4} />}
      </Tabela>
      <Paginacao total={lista.total} pagina={lista.pagina} tamanho={lista.itensPorPagina} params={params} />
    </section></>
}
