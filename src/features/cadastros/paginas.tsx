import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Cabecalho, Etiqueta, Paginacao, Tabela, Vazio, consulta, valor, type Busca } from '@/components/pagina'
import { Formulario } from '@/components/formulario'
import { listarTudo, sessaoAtual } from '@/lib/dados'
import { consultar, ErroApi } from '@/lib/api'
import { podeInativar, podeOperar, type Cadastro, type Colaborador, type Paginado } from '@/lib/contratos'
import { executar } from '@/features/operacoes/acoes'

export async function Catalogo({ categoria, busca }: { categoria: boolean; busca: Busca }) {
  const { perfil } = await sessaoAtual()
  if (perfil === 'Colaborador') redirect('/meus-ativos')
  const recurso = categoria ? 'categorias-de-ativos' : 'departamentos'
  const caminho = categoria ? '/categorias' : '/departamentos'
  const params = consulta(busca, ['busca', 'pagina'])
  const itens = await consultar<Paginado<Cadastro>>(`${recurso}?${params}`)
  return <><Cabecalho titulo={categoria ? 'Categorias de ativos' : 'Departamentos'} />
    {podeOperar(perfil) && <section className="cartao">
      <h2>{categoria ? 'Nova categoria' : 'Novo departamento'}</h2>
      <Formulario acao={executar.bind(null, { tipo: 'salvar', recurso })} botao="Cadastrar">
        <label>Nome<input name="nome" required maxLength={120} /></label>
      </Formulario>
    </section>}
    <section className="cartao">
      <form className="filtros"><label>Buscar por nome<input name="busca" defaultValue={valor(busca, 'busca')} /></label>
        <button className="botao">Buscar</button><Link className="botao secundario" href={caminho}>Limpar</Link></form>
      <Tabela colunas={['Nome', 'Situação', 'Ações']}>
        {itens.itens.map(item => {
          const ativo = item.ativo ?? item.ativa
          return <tr key={item.id}><td>{item.nome}</td><td><Etiqueta valor={ativo ? 'Ativo' : 'Inativo'} /></td><td>
            {ativo && podeOperar(perfil) && <details><summary>Editar</summary>
              <Formulario acao={executar.bind(null, { tipo: 'salvar', recurso, id: item.id })} botao="Salvar nome">
                <label>Nome<input name="nome" defaultValue={item.nome} maxLength={120} required /></label>
              </Formulario>
            </details>}
            {ativo && podeInativar(perfil) && <Formulario simples perigo botao="Inativar"
              confirmar={`Inativar ${item.nome}?`} acao={executar.bind(null, { tipo: 'inativar', recurso, id: item.id })} />}
          </td></tr>
        })}
        {!itens.itens.length && <Vazio colunas={3} />}
      </Tabela>
      <Paginacao total={itens.total} pagina={itens.pagina} tamanho={itens.itensPorPagina} params={params} />
    </section>
  </>
}

export async function Pessoas({ busca }: { busca: Busca }) {
  const { perfil } = await sessaoAtual()
  if (perfil === 'Colaborador') redirect('/meus-ativos')
  const params = consulta(busca, ['busca', 'situacao', 'departamentoId', 'pagina'])
  const [lista, departamentos] = await Promise.all([
    consultar<Paginado<Colaborador>>('colaboradores?' + params), listarTudo<Cadastro>('departamentos'),
  ])
  const nomes = new Map(departamentos.map(d => [d.id, d.nome]))
  return <><Cabecalho titulo="Colaboradores" descricao="Gerencie quem recebe equipamentos e as contas de acesso."
    acao={perfil === 'Administrador' && <Link className="botao" href="/colaboradores/novo"><Plus size={17} /> Cadastrar colaborador</Link>} />
    <section className="cartao"><form className="filtros">
      <label>Buscar<input name="busca" defaultValue={valor(busca, 'busca')} placeholder="Nome ou e-mail" /></label>
      <label>Situação<select name="situacao" defaultValue={valor(busca, 'situacao')}><option value="">Todas</option>
        <option>Ativo</option><option value="EmDesligamento">Em desligamento</option><option>Inativo</option></select></label>
      <label>Departamento<select name="departamentoId" defaultValue={valor(busca, 'departamentoId')}><option value="">Todos</option>
        {departamentos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}</select></label>
      <button className="botao">Filtrar</button><Link className="botao secundario" href="/colaboradores">Limpar</Link>
    </form>
      <Tabela colunas={['Nome', 'E-mail', 'Departamento', 'Cargo', 'Situação', 'Ações']}>{lista.itens.map(c =>
        <tr key={c.id}><td>{c.nomeCompleto}</td><td>{c.email}</td><td>{nomes.get(c.departamentoId ?? '') ?? '—'}</td>
          <td>{c.cargo ?? '—'}</td><td><Etiqueta valor={c.situacao} /></td>
          <td>{perfil === 'Administrador' && c.situacao === 'Ativo' ? <Link href={`/colaboradores/${c.id}`}>Editar</Link> : '—'}</td></tr>)}
        {!lista.itens.length && <Vazio colunas={6} />}
      </Tabela>
      <Paginacao total={lista.total} pagina={lista.pagina} tamanho={lista.itensPorPagina} params={params} />
    </section>
  </>
}

async function contaAtual(id: string) {
  try {
    const conta = await consultar<{ email: string; perfil: string } | undefined>(`contas/${encodeURIComponent(id)}`)
    return { conta: conta ?? null, indisponivel: false }
  } catch (erro) {
    if (!(erro instanceof ErroApi)) throw erro
    return { conta: null, indisponivel: erro.status !== 404 }
  }
}

export async function EditarPessoa({ id }: { id?: string }) {
  if ((await sessaoAtual()).perfil !== 'Administrador') redirect('/colaboradores')
  const [departamentos, pessoa, acesso] = await Promise.all([
    listarTudo<Cadastro>('departamentos'),
    id ? consultar<Colaborador>(`colaboradores/${encodeURIComponent(id)}`) : null, id ? contaAtual(id) : null,
  ])
  const conta = acesso?.conta
  return <><Cabecalho titulo={pessoa ? 'Editar colaborador' : 'Cadastrar colaborador'} voltar="/colaboradores" />
    <section className="cartao"><Formulario acao={executar.bind(null, { tipo: 'salvar', recurso: 'colaboradores', id })}
      botao="Salvar colaborador"><div className="campos">
      <label>Nome completo<input name="nomeCompleto" defaultValue={pessoa?.nomeCompleto} maxLength={160} required /></label>
      <label>CPF<input name="cpf" inputMode="numeric" maxLength={14} defaultValue={pessoa?.cpf ?? ''} /></label>
      <label>Cargo<input name="cargo" maxLength={100} defaultValue={pessoa?.cargo ?? ''} /></label>
      <label>Departamento<select name="departamentoId" defaultValue={pessoa?.departamentoId ?? ''}>
        <option value="">Selecione</option>{departamentos.filter(d => d.ativo).map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
      </select></label>
      <label>E-mail corporativo<input name="email" type="email" defaultValue={pessoa?.email} maxLength={254} required /></label>
      <label>Telefone<input name="telefone" type="tel" defaultValue={pessoa?.telefone ?? ''} maxLength={20} /></label>
    </div></Formulario></section>
    {id && pessoa?.situacao === 'Ativo' && <section className="cartao"><h2>Conta de acesso</h2>
      {acesso?.indisponivel ? <p className="erro" role="alert">
        Não foi possível consultar a conta de acesso. Recarregue a página para tentar novamente.
      </p> : <>
        <p className="secundario">{conta ? `E-mail da conta: ${conta.email}` : 'Sem conta de acesso.'}</p>
        <Formulario botao={conta ? 'Salvar perfil' : 'Criar conta'} acao={executar.bind(null, { tipo: 'conta', id })}>
          <label>Perfil<select name="perfil" defaultValue={conta?.perfil ?? 'Colaborador'}>
            <option>Colaborador</option><option value="GestorTI">Gestor de TI</option>
            <option value="OperadorTI">Operador de TI</option><option>Auditor</option>
          </select></label>
          {!conta && <label>Senha inicial<input type="password" name="senhaInicial" minLength={12} maxLength={256} autoComplete="new-password" required /></label>}
        </Formulario>
      </>}
    </section>}
    {id && pessoa?.situacao === 'Ativo' && <div className="acoes"><Formulario simples perigo botao="Inativar colaborador"
      confirmar="Deseja inativar este colaborador?" acao={executar.bind(null, { tipo: 'inativar', recurso: 'colaboradores', id })} /></div>}
  </>
}
