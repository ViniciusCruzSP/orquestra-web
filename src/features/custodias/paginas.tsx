import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Download, FileText, Plus } from 'lucide-react'
import { Cabecalho, Etiqueta, Paginacao, Tabela, Vazio, consulta, valor, type Busca } from '@/components/pagina'
import { Formulario } from '@/components/formulario'
import { consultar, requisitar } from '@/lib/api'
import { listarTudo, sessaoAtual } from '@/lib/dados'
import { dataHora, type Ativo, type Colaborador, type Custodia, type CustodiaPessoal, type Paginado } from '@/lib/contratos'
import { executar } from '@/features/operacoes/acoes'

export async function Custodias({ busca }: { busca: Busca }) {
  const { perfil } = await sessaoAtual()
  if (perfil === 'Colaborador') redirect('/meus-ativos')
  const params = consulta(busca, ['busca', 'pagina'])
  const [resultado, pessoas] = await Promise.all([
    consultar<Paginado<Custodia>>(`custodias?${params}`), listarTudo<Colaborador>('colaboradores'),
  ])
  const nomes = new Map(pessoas.map(p => [p.id, p.nomeCompleto]))
  return <><Cabecalho titulo="Custódias" descricao="Acompanhe entregas, termos e devoluções de equipamentos."
    acao={perfil === 'Administrador' && <Link className="botao" href="/custodias/nova"><Plus size={17} /> Registrar entrega</Link>} />
    <section className="cartao">
      <form className="filtros"><label>Buscar colaborador<input name="busca" defaultValue={valor(busca, 'busca')} /></label>
        <button className="botao">Buscar</button><Link className="botao secundario" href="/custodias">Limpar</Link></form>
      <Tabela colunas={['Colaborador', 'Entrega', 'Itens', 'Pendentes', 'Ações']}>
        {resultado.itens.map(c => <tr key={c.id}><td>{nomes.get(c.colaboradorId) ?? '—'}</td><td>{dataHora(c.entregueEm)}</td>
          <td>{c.itens.length}</td><td>{c.itens.filter(i => !i.devolvidoEm).length}</td>
          <td><Link href={`/custodias/${c.id}`}>Abrir custódia</Link></td></tr>)}
        {!resultado.itens.length && <Vazio colunas={5} />}
      </Tabela>
      <Paginacao total={resultado.total} pagina={resultado.pagina} tamanho={resultado.itensPorPagina} params={params} />
    </section></>
}

export async function NovaCustodia({ selecionado }: { selecionado?: string }) {
  if ((await sessaoAtual()).perfil !== 'Administrador') redirect('/custodias')
  const [pessoas, ativos] = await Promise.all([
    listarTudo<Colaborador>('colaboradores', new URLSearchParams({ situacao: 'Ativo' })),
    listarTudo<Ativo>('ativos', new URLSearchParams({ situacao: 'Disponível', ativo: 'true' })),
  ])
  return <><Cabecalho titulo="Registrar entrega" voltar="/custodias" descricao="Selecione o colaborador e os equipamentos. O termo é gerado após a confirmação." />
    <div className="cartao">
      {!pessoas.length || !ativos.length ? <p>Para registrar uma entrega, você precisa de um colaborador ativo e de pelo menos um equipamento disponível.</p> :
        <Formulario acao={executar.bind(null, { tipo: 'entrega' })} botao="Confirmar entrega e gerar termo">
          <label>Colaborador<select name="colaboradorId" defaultValue="" required><option disabled value="">Selecione</option>
            {pessoas.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}</select></label>
          <fieldset className="lista-check"><legend>Equipamentos disponíveis</legend>
            {ativos.map(a => <label className="check" key={a.id}>
              <input type="checkbox" name="ativosIds" value={a.id} defaultChecked={a.id === selecionado} /> {a.patrimonio} · {a.nome}
            </label>)}
          </fieldset>
          <label>Observações<textarea name="observacoes" maxLength={2000} /></label>
        </Formulario>}
    </div></>
}

export async function DetalhesCustodia({ id }: { id: string }) {
  const { perfil } = await sessaoAtual()
  if (perfil === 'Colaborador') redirect('/meus-ativos')
  const c = await consultar<Custodia>(`custodias/${encodeURIComponent(id)}`)
  const [pessoa, ativos] = await Promise.all([
    consultar<Colaborador>(`colaboradores/${c.colaboradorId}`),
    Promise.all(c.itens.map(x => consultar<Ativo>(`ativos/${x.ativoId}`))),
  ])
  return <><Cabecalho titulo="Detalhes da custódia" voltar="/custodias" descricao={`${pessoa.nomeCompleto} · ${dataHora(c.entregueEm)}`}
    acao={perfil === 'Administrador' && <Link href={`/custodias/${id}/termo`} className="botao"><FileText size={17} /> Ver termo</Link>} />
    <section className="cartao">{c.observacoes && <p>{c.observacoes}</p>}
      <Tabela colunas={['Equipamento', 'Situação da entrega', 'Ações']}>
        {c.itens.map((item, i) => <tr key={item.id}><td><Link href={`/ativos/${item.ativoId}`}>{ativos[i].patrimonio}</Link> · {ativos[i].nome}</td>
          <td>{item.devolvidoEm ? `Devolvido em ${dataHora(item.devolvidoEm)}` : <Etiqueta valor="EmUso" />}</td>
          <td>{!item.devolvidoEm && perfil === 'Administrador' && <details><summary>Registrar devolução</summary>
            <Formulario acao={executar.bind(null, { tipo: 'devolver', id })} botao="Confirmar devolução">
              <input type="hidden" name="ativoId" value={item.ativoId} />
              <label>Estado após devolução<select name="destino"><option value="Disponível">Em estoque</option>
                <option value="EmManutenção">Em manutenção</option><option value="ComDefeito">Com defeito</option></select></label>
              <label>Observações<textarea name="observacoes" maxLength={2000} /></label>
            </Formulario></details>}</td></tr>)}
      </Tabela>
    </section>
  </>
}

export async function Termo({ id }: { id: string }) {
  const { perfil } = await sessaoAtual()
  const colaborador = perfil === 'Colaborador'
  const voltar = colaborador ? '/meus-ativos' : `/custodias/${id}`
  const endpoint = `${colaborador ? 'minha-area/' : ''}custodias/${encodeURIComponent(id)}/termo`
  const resposta = await requisitar(endpoint)
  if (resposta.status === 401) redirect('/entrar')
  await resposta.body?.cancel()
  const arquivo = `/arquivos/termo/${encodeURIComponent(id)}`
  return <><Cabecalho titulo="Termo de compromisso" voltar={voltar}
    descricao="Documento emitido no momento da entrega dos equipamentos."
    acao={resposta.ok && <a className="botao" href={arquivo + '?baixar=1'}><Download size={17} /> Baixar PDF</a>} />
    <div className="cartao">{resposta.ok ? <iframe className="pdf" title="Prévia do termo de compromisso" src={arquivo} /> :
      <p className="erro">{resposta.status === 404 ? 'Esta custódia não possui um termo disponível.' : 'Não foi possível abrir o termo com esta conta.'}</p>}</div>
  </>
}

export async function MinhaArea({ busca }: { busca: Busca }) {
  if ((await sessaoAtual()).perfil !== 'Colaborador') redirect('/painel')
  const pagina = Math.max(1, Number.parseInt(valor(busca, 'pagina'), 10) || 1)
  const itens = await consultar<CustodiaPessoal[]>(`minha-area/custodias?pagina=${pagina}`)
  return <><Cabecalho titulo="Meus ativos" descricao="Consulte seus equipamentos, devoluções e termos de compromisso." />
    {itens.map(c => <section className="cartao" key={c.id}>
      <div className="linha entre"><h2>Entrega de {dataHora(c.entregueEm)}</h2>
        <Link className="botao secundario" href={`/custodias/${c.id}/termo`}>Ver termo</Link></div>
      <Tabela colunas={['Patrimônio', 'Equipamento', 'Situação']}>
        {c.itens.map(i => <tr key={i.ativoId}><td>{i.patrimonio}</td><td>{i.nome}</td>
          <td>{i.devolvidoEm ? `Devolvido em ${dataHora(i.devolvidoEm)}` : <Etiqueta valor="EmUso" />}</td></tr>)}
      </Tabela>
    </section>)}
    {!itens.length && <p className="cartao vazio">Nenhuma custódia nesta página.</p>}
    <div className="linha acoes">{pagina > 1 && <Link href={`?pagina=${pagina - 1}`}>Anterior</Link>}
      {itens.length === 20 && <Link href={`?pagina=${pagina + 1}`}>Próxima página</Link>}</div>
  </>
}
