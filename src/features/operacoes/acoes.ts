'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ErroApi, ler } from '@/lib/api'
import type { Custodia, Ativo } from '@/lib/contratos'
import type { Resultado } from '@/features/sessao/acoes'

type Rota = 'departamentos' | 'categorias-de-ativos' | 'colaboradores' | 'ativos'
type Operacao = { tipo: 'salvar' | 'inativar'; recurso: Rota; id?: string } |
  { tipo: 'estado'; id: string; acao: 'manutencao' | 'concluir-manutencao' | 'marcar-com-defeito' | 'descartar' } |
  { tipo: 'entrega' | 'desligamento' } | { tipo: 'conta' | 'devolver' | 'concluir'; id: string }

const rotas = { departamentos: '/departamentos', 'categorias-de-ativos': '/categorias', colaboradores: '/colaboradores', ativos: '/ativos' }

export async function executar(op: Operacao, _: Resultado, dados: FormData): Promise<Resultado> {
  const campo = (nome: string) => String(dados.get(nome) ?? '').trim()
  const opcional = (nome: string) => campo(nome) || null
  if ('id' in op && op.id && !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(op.id))
    return { erro: 'Identificador inválido.' }

  let destino: string | undefined
  const enviar = <T,>(rota: string, method: string, corpo?: object) =>
    ler<T>(rota, { method, body: corpo === undefined ? undefined : JSON.stringify(corpo) })

  try {
    switch (op.tipo) {
      case 'salvar': {
        const corpo = op.recurso === 'colaboradores' ? {
          nomeCompleto: campo('nomeCompleto'), email: campo('email'), departamentoId: opcional('departamentoId'),
          cpf: campo('cpf'), cargo: campo('cargo'), telefone: campo('telefone'),
        } : op.recurso === 'ativos' ? {
          nome: campo('nome'), patrimonio: campo('patrimonio'), marca: campo('marca'), modelo: campo('modelo'),
          categoriaId: campo('categoriaId'), numeroDeSerie: opcional('numeroDeSerie'), observacoes: opcional('observacoes'),
          versaoDoRegistro: opcional('versaoDoRegistro'),
          situacaoInicial: opcional('situacaoInicial'),
          especificacoes: {
            tipo: campo('tipo'), adquiridoEm: opcional('adquiridoEm'), processador: opcional('processador'),
            memoriaRam: opcional('memoriaRam'), armazenamento: opcional('armazenamento'),
            sistemaOperacional: opcional('sistemaOperacional'), tipoPeriferico: opcional('tipoPeriferico'),
          },
        } : { nome: campo('nome') }
        const saved = await enviar<Ativo>(op.recurso + (op.id ? '/' + op.id : ''), op.id ? 'PUT' : 'POST', corpo)
        destino = op.recurso === 'ativos' ? `/ativos/${saved.id}` : rotas[op.recurso]
        break
      }
      case 'inativar':
        await enviar(`${op.recurso}/${op.id}`, 'DELETE')
        destino = rotas[op.recurso]
        break
      case 'estado':
        await enviar(`ativos/${op.id}/${op.acao}`, 'POST', { observacoes: opcional('observacoes') })
        destino = `/ativos/${op.id}`
        break
      case 'entrega': {
        const entrega = await enviar<Custodia>('custodias', 'POST', {
          colaboradorId: campo('colaboradorId'), ativosIds: dados.getAll('ativosIds'), observacoes: opcional('observacoes'),
        })
        destino = `/custodias/${entrega.id}/termo`
        break
      }
      case 'devolver':
        await enviar(`custodias/${op.id}/devolver`, 'POST', {
          itens: [{ ativoId: campo('ativoId'), destino: campo('destino'), observacoes: opcional('observacoes') }],
        })
        destino = `/custodias/${op.id}`
        break
      case 'desligamento':
        await enviar('desligamentos', 'POST', { colaboradorId: campo('colaboradorId'), observacoes: opcional('observacoes') })
        destino = '/desligamentos'
        break
      case 'concluir':
        await enviar(`desligamentos/${op.id}/concluir`, 'POST')
        destino = '/desligamentos'
        break
      case 'conta':
        await enviar(`contas/${op.id}`, 'PUT', { perfil: campo('perfil'), senhaInicial: dados.get('senhaInicial') || null })
        break
    }
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 401) redirect('/entrar')
    return { erro: erro instanceof ErroApi ? erro.message : 'Não foi possível salvar. Tente novamente.' }
  }
  revalidatePath('/', 'layout')
  if (destino) redirect(destino)
  return { mensagem: 'Alterações salvas.' }
}
