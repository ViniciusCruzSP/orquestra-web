import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Cabecalho, Etiqueta, Paginacao, Tabela, Vazio, consulta, valor, type Busca } from '@/components/pagina'
import { Formulario } from '@/components/formulario'
import { consultar, ErroApi } from '@/lib/api'
import { listarTudo, sessaoAtual } from '@/lib/dados'
import { estados, podeOperar, type Ativo, type Cadastro, type Colaborador, type Movimento, type Paginado } from '@/lib/contratos'
import { executar } from '@/features/operacoes/acoes'
import { TabelaHistorico } from '@/features/historico/tabela'
import { Especificacoes } from './especificacoes'

export const camposFiltro = ['busca', 'tipo', 'situacao', 'responsavelId', 'ativo', 'de', 'ate']

export async function Inventario({ busca }: { busca: Busca }) {
  const params = consulta(busca, [...camposFiltro, 'pagina'])
  const { perfil } = await sessaoAtual()
  if (perfil === 'Colaborador') redirect('/meus-ativos')
  const [lista, colaboradores] = await Promise.all([
    consultar<Paginado<Ativo>>('ativos?' + params), listarTudo<Colaborador>('colaboradores'),
  ])
  return <>
    <Cabecalho titulo="Inventário de ativos" descricao="Consulte computadores e periféricos da organização."
      acao={perfil === 'Administrador' && <Link className="botao" href="/ativos/novo"><Plus size={17} /> Cadastrar ativo</Link>} />
    <section className="cartao">
      <form className="filtros">
        <label>Buscar<input name="busca" placeholder="Nome ou patrimônio" defaultValue={valor(busca, 'busca')} /></label>
        <label>Tipo<select name="tipo" defaultValue={valor(busca, 'tipo')}><option value="">Todos os tipos</option><option>Computador</option><option>Periférico</option></select></label>
        <label>Estado<select name="situacao" defaultValue={valor(busca, 'situacao')}><option value="">Todos os estados</option>
          {estados.map(([id, nome]) => <option value={id} key={id}>{nome}</option>)}</select></label>
        <label>Responsável<select name="responsavelId" defaultValue={valor(busca, 'responsavelId')}><option value="">Todos</option>
          {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nomeCompleto}</option>)}</select></label>
        <label>Situação<select name="ativo" defaultValue={valor(busca, 'ativo')}><option value="">Todas</option><option value="true">Ativo</option><option value="false">Inativo</option></select></label>
        <label>Aquisição de<input type="date" name="de" defaultValue={valor(busca, 'de')} /></label>
        <label>Aquisição até<input type="date" name="ate" defaultValue={valor(busca, 'ate')} /></label>
        <button className="botao">Filtrar</button><Link className="botao secundario" href="/ativos">Limpar</Link>
      </form>
      <Tabela colunas={['Patrimônio', 'Tipo', 'Equipamento', 'Fabricante', 'Estado', 'Situação', 'Responsável', 'Ações']}>
        {lista.itens.map(a => <tr key={a.id}><td><Link href={`/ativos/${a.id}`}>{a.patrimonio}</Link></td>
          <td>{a.especificacoes?.tipo ?? '—'}</td><td>{a.nome}<br /><small>{a.modelo}</small></td><td>{a.marca}</td>
          <td><Etiqueta valor={a.situacao} /></td><td><Etiqueta valor={a.ativo ? 'Ativo' : 'Inativo'} /></td><td>{a.responsavel ?? '—'}</td>
          <td><Link href={`/ativos/${a.id}`}>Visualizar</Link></td></tr>)}
        {!lista.itens.length && <Vazio colunas={8} />}
      </Tabela>
      <Paginacao total={lista.total} pagina={lista.pagina} tamanho={lista.itensPorPagina} params={params} />
    </section>
  </>
}

async function obterAtivo(id: string) {
  try { return await consultar<Ativo>('ativos/' + encodeURIComponent(id)) }
  catch (e) { if (e instanceof ErroApi && e.status === 404) notFound(); throw e }
}

export async function EditarAtivo({ id }: { id?: string }) {
  if ((await sessaoAtual()).perfil !== 'Administrador') redirect('/ativos')
  const [ativo, categorias] = await Promise.all([id ? obterAtivo(id) : null, listarTudo<Cadastro>('categorias-de-ativos')])
  return <><Cabecalho titulo={ativo ? 'Editar ativo' : 'Cadastrar ativo'} voltar={id ? `/ativos/${id}` : '/ativos'} />
    <div className="cartao"><Formulario acao={executar.bind(null, { tipo: 'salvar', recurso: 'ativos', id })} botao="Salvar ativo">
      <input type="hidden" name="versaoDoRegistro" value={ativo?.versaoDoRegistro ?? ''} />
      <div className="campos">
        <label>Patrimônio<input name="patrimonio" maxLength={80} defaultValue={ativo?.patrimonio} required /></label>
        <label>Nome<input name="nome" maxLength={160} defaultValue={ativo?.nome} required /></label>
        <label>Fabricante<input name="marca" maxLength={120} defaultValue={ativo?.marca} required /></label>
        <label>Modelo<input name="modelo" maxLength={120} defaultValue={ativo?.modelo} required /></label>
        <label>Categoria<select name="categoriaId" defaultValue={ativo?.categoriaId ?? ''} required>
          <option value="" disabled>Selecione a categoria</option>
          {categorias.filter(c => c.ativa || c.id === ativo?.categoriaId).map(c => <option value={c.id} key={c.id}>{c.nome}</option>)}
        </select></label>
        <label>Número de série<input name="numeroDeSerie" maxLength={120} defaultValue={ativo?.numeroDeSerie ?? ''} /></label>
        <Especificacoes dados={ativo?.especificacoes} />
        <label className="campo-largo">Observações<textarea name="observacoes" maxLength={2000} defaultValue={ativo?.observacoes ?? ''} /></label>
      </div>
      {categorias.every(c => !c.ativa) && <p>Cadastre uma <Link href="/categorias">categoria de ativo</Link> para continuar.</p>}
    </Formulario></div></>
}

export async function DetalhesAtivo({ id, busca }: { id: string; busca: Busca }) {
  const { perfil } = await sessaoAtual()
  if (perfil === 'Colaborador') redirect('/meus-ativos')
  const params = consulta(busca, ['pagina'])
  const [a, historico] = await Promise.all([obterAtivo(id),
    consultar<Paginado<Movimento>>(`ativos/${encodeURIComponent(id)}/historico?${params}`)])
  const ativoOperavel = a.ativo && podeOperar(perfil) && a.situacao !== 'Descartado'
  const operacoes = [
    ['manutencao', 'Enviar para manutenção', ['Disponível', 'ComDefeito']],
    ['concluir-manutencao', 'Concluir manutenção', ['EmManutenção']],
    ['marcar-com-defeito', 'Marcar com defeito', ['Disponível', 'EmManutenção']],
    ['descartar', 'Descartar ativo', ['Disponível', 'ComDefeito']],
  ] as const
  const apresentacao = [
    ['Patrimônio', a.patrimonio], ['Modelo', a.modelo], ['Fabricante', a.marca], ['Responsável atual', a.responsavel],
    ['Número de série', a.numeroDeSerie], ['Tipo', a.especificacoes?.tipo], ['Data de aquisição', a.especificacoes?.adquiridoEm],
    ['Processador', a.especificacoes?.processador], ['Memória RAM', a.especificacoes?.memoriaRam],
    ['Armazenamento', a.especificacoes?.armazenamento], ['Sistema operacional', a.especificacoes?.sistemaOperacional],
    ['Tipo de periférico', a.especificacoes?.tipoPeriferico], ['Observações', a.observacoes],
  ]
  return <><Cabecalho titulo={a.nome} descricao={a.patrimonio} voltar="/ativos" acao={<Etiqueta valor={a.situacao} />} />
    <section className="cartao"><h2>Dados do ativo</h2>
      <dl className="dados">{apresentacao.filter(([, info]) => info).map(([nome, info]) => <div key={nome}><dt>{nome}</dt><dd>{info}</dd></div>)}</dl>
    </section>
    <div className="linha acoes">
      {ativoOperavel && perfil === 'Administrador' && <Link className="botao secundario" href={`/ativos/${id}/editar`}>Editar ativo</Link>}
      {ativoOperavel && perfil === 'Administrador' && a.situacao === 'Disponível' && <Link className="botao" href={`/custodias/nova?ativo=${id}`}>Atribuir ativo</Link>}
      {a.custodiaAtualId && <Link className="botao secundario" href={`/custodias/${a.custodiaAtualId}`}>Abrir custódia atual</Link>}
      {a.custodiaAtualId && perfil === 'Administrador' && <Link className="botao secundario" href={`/custodias/${a.custodiaAtualId}/termo`}>Ver termo de compromisso</Link>}
      {a.ativo && perfil === 'Administrador' && !['EmUso', 'EmManutenção'].includes(a.situacao) &&
        <Formulario simples perigo confirmar="Deseja inativar este ativo?" botao="Inativar ativo"
          acao={executar.bind(null, { tipo: 'inativar', recurso: 'ativos', id })} />}
    </div>
    {ativoOperavel && operacoes.filter(([acao, , estados]) => (estados as readonly string[]).includes(a.situacao) &&
      (acao !== 'descartar' || perfil === 'Administrador')).map(([acao, titulo]) =>
      <details className="cartao" key={acao}><summary>{titulo}</summary>
        <Formulario botao={titulo} perigo={acao === 'descartar'} confirmar={acao === 'descartar' ? 'Confirmar descarte?' : undefined}
          acao={executar.bind(null, { tipo: 'estado', id, acao })}>
          <label>{acao === 'descartar' ? 'Motivo do descarte' : 'Observações'}
            <textarea name="observacoes" required={acao === 'descartar'} maxLength={acao === 'descartar' ? 500 : 2000} /></label>
        </Formulario></details>)}
    <section className="cartao"><h2>Histórico de movimentações</h2><TabelaHistorico itens={historico.itens} />
      <Paginacao total={historico.total} pagina={historico.pagina} tamanho={historico.itensPorPagina} params={params} /></section>
  </>
}
