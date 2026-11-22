import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Boxes, Check, CircleAlert, Package, Wrench } from 'lucide-react'
import { Cabecalho, Etiqueta } from '@/components/pagina'
import { consultar } from '@/lib/api'
import { sessaoAtual } from '@/lib/dados'
import { dataHora, rotulo, type Movimento, type Paginado, type Painel } from '@/lib/contratos'

export default async function PaginaPainel() {
  if ((await sessaoAtual()).perfil === 'Colaborador') redirect('/meus-ativos')
  const [painel, movimentos] = await Promise.all([
    consultar<Painel>('painel'), consultar<Paginado<Movimento>>('relatorios/historico?itensPorPagina=5'),
  ])
  const cards = [
    ['Total de ativos', painel.totalDeAtivos, Boxes, 'azul'],
    ['Em uso', painel.ativosEmUso, Check, 'verde'],
    ['Em estoque', painel.ativosDisponiveis, Package, 'estoque'],
    ['Com defeito', painel.ativosComDefeito, CircleAlert, 'vermelho'],
    ['Em manutenção', painel.ativosEmManutencao, Wrench, 'ambar'],
  ] as const
  const grupos = [
    ['Em uso', painel.ativosEmUso, '#278460'], ['Em estoque', painel.ativosDisponiveis, '#3267b5'],
    ['Em manutenção', painel.ativosEmManutencao, '#c0821c'], ['Com defeito', painel.ativosComDefeito, '#ba4747'],
    ['Descartado', painel.ativosDescartados, '#a5adba'],
  ] as const
  let cursor = 0
  const segmentos = grupos.map(([, n, cor]) => {
    const inicio = cursor
    cursor += n * 100 / Math.max(1, painel.totalDeAtivos)
    return `${cor} ${inicio}% ${cursor}%`
  })
  return <>
    <Cabecalho titulo="Visão geral" descricao="Acompanhe o inventário e as últimas movimentações da organização." />
    <div className="indicadores">{cards.map(([titulo, n, Icone, classe]) =>
      <div className="cartao indicador" key={titulo}><span className={`etiqueta ${classe}`}><Icone size={20} /></span>
        <div><strong>{n}</strong><small>{titulo}</small></div></div>)}</div>
    <div className="grade-painel">
      <section className="cartao"><h2>Ativos por estado</h2><p className="secundario">Distribuição atual do inventário</p>
        <div className="grafico"><div className="anel" aria-hidden style={{
          background: painel.totalDeAtivos ? `conic-gradient(${segmentos.join(',')})` : '#e8edf4',
        }}><div><strong>{painel.totalDeAtivos}</strong><small>ativos</small></div></div>
        <ul>{grupos.map(([texto, n, cor]) => <li key={texto}><span style={{ background: cor }} />{texto}<strong>{n}</strong></li>)}</ul></div>
      </section>
      <section className="cartao"><div className="linha entre"><h2>Últimos movimentos</h2><Link href="/historico">Ver histórico</Link></div>
        <ul className="movimentos-painel">{movimentos.itens.map(m => <li key={m.id}>
          <div><Link href={`/ativos/${m.ativoId}`}>{m.patrimonio}</Link> {rotulo(m.operacao ?? '')}
            <small>{dataHora(m.ocorridoEm)}</small></div><Etiqueta valor={m.novaSituacao} />
        </li>)}</ul>{!movimentos.itens.length && <p className="secundario">Nenhuma movimentação registrada.</p>}
      </section>
    </div>
  </>
}
