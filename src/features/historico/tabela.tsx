import Link from 'next/link'
import { Etiqueta, Tabela, Vazio } from '@/components/pagina'
import { dataHora, rotulo, type Movimento } from '@/lib/contratos'

export function TabelaHistorico({ itens }: { itens: Movimento[] }) {
  return <Tabela colunas={['Data e hora', 'Ativo', 'Operação', 'Estado anterior', 'Novo estado', 'Responsável', 'Motivo']}>
    {itens.map(m => <tr key={m.id}>
      <td>{dataHora(m.ocorridoEm)}</td><td>{m.patrimonio ? <Link href={`/ativos/${m.ativoId}`}>{m.patrimonio}</Link> : 'Este ativo'}</td>
      <td>{rotulo(m.operacao ?? m.tipo ?? '')}</td><td><Etiqueta valor={m.situacaoAnterior} /></td>
      <td><Etiqueta valor={m.novaSituacao} /></td><td><code>{m.usuarioId ?? m.realizadoPorUsuarioId}</code></td>
      <td>{m.motivo ?? m.observacoes ?? '—'}</td>
    </tr>)}
    {!itens.length && <Vazio colunas={7} />}
  </Tabela>
}
