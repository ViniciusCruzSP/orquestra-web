import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Cabecalho, Paginacao, Tabela, Vazio, consulta, valor, type Busca } from '@/components/pagina'
import { Formulario } from '@/components/formulario'
import { consultar } from '@/lib/api'
import { listarTudo, sessaoAtual } from '@/lib/dados'
import { dataHora, podeInativar, podeOperar, type Colaborador, type Desligamento, type Paginado } from '@/lib/contratos'
import { executar } from '@/features/operacoes/acoes'

export default async function Desligamentos({ searchParams }: { searchParams: Promise<Busca> }) {
  const { perfil } = await sessaoAtual()
  if (perfil === 'Colaborador') redirect('/meus-ativos')
  const busca = await searchParams
  const params = consulta(busca, ['busca', 'pagina'])
  const [pessoas, lista] = await Promise.all([
    listarTudo<Colaborador>('colaboradores'), consultar<Paginado<Desligamento>>('desligamentos?' + params),
  ])
  const nomes = new Map(pessoas.map(c => [c.id, c.nomeCompleto]))
  return <><Cabecalho titulo="Desligamentos" descricao="Confira quais equipamentos precisam ser devolvidos antes de concluir o desligamento." />
    {podeOperar(perfil) && <details className="cartao"><summary>Iniciar desligamento</summary>
      <Formulario botao="Registrar desligamento" acao={executar.bind(null, { tipo: 'desligamento' })}>
        <label>Colaborador<select name="colaboradorId" defaultValue="" required><option value="" disabled>Selecione</option>
          {pessoas.filter(c => c.situacao === 'Ativo').map(c => <option key={c.id} value={c.id}>{c.nomeCompleto}</option>)}</select></label>
        <label>Observações<textarea name="observacoes" maxLength={2000} /></label>
      </Formulario>
    </details>}
    <section className="cartao"><form className="filtros">
      <label>Buscar colaborador<input name="busca" defaultValue={valor(busca, 'busca')} /></label><button className="botao">Buscar</button>
    </form>
      <Tabela colunas={['Colaborador', 'Início', 'Situação', 'Pendências', 'Ações']}>
        {lista.itens.map(d => <tr key={d.id}><td>{nomes.get(d.colaboradorId) ?? '—'}</td><td>{dataHora(d.iniciadoEm)}</td>
          <td>{d.concluidoEm ? `Concluído em ${dataHora(d.concluidoEm)}` : 'Em andamento'}</td>
          <td>{d.ativosPendentesIds.length ? <Link href={`/ativos?responsavelId=${d.colaboradorId}`}>{d.ativosPendentesIds.length} ativos</Link> : 'Nenhuma'}</td>
          <td>{!d.concluidoEm && d.ativosPendentesIds.length === 0 && podeInativar(perfil) &&
            <Formulario simples botao="Concluir desligamento" confirmar="Confirma a conclusão do desligamento?"
              acao={executar.bind(null, { tipo: 'concluir', id: d.id })} />}</td></tr>)}
        {!lista.itens.length && <Vazio colunas={5} />}
      </Tabela>
      <Paginacao total={lista.total} pagina={lista.pagina} tamanho={lista.itensPorPagina} params={params} />
    </section>
  </>
}
