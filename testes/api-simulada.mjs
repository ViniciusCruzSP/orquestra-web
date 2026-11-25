import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'

const sessao = { usuarioId: 'admin-teste', organizacaoId: 'org-teste', email: 'admin@orquestra.test', perfil: 'Administrador' }
const senha = 'Orquestra.Testes-123!'
const pessoas = new Map()
const contas = new Map()
const paginar = itens => ({ itens, total: itens.length, pagina: 1, itensPorPagina: 100 })

createServer(async (req, res) => {
  const caminho = new URL(req.url, 'http://localhost').pathname
  const responder = (codigo, dados) => {
    res.writeHead(codigo, dados === undefined ? {} : { 'Content-Type': 'application/json' })
    res.end(dados === undefined ? undefined : JSON.stringify(dados))
  }
  const corpo = async () => {
    const partes = []
    for await (const parte of req) partes.push(parte)
    return JSON.parse(Buffer.concat(partes).toString())
  }
  if (caminho === '/') return responder(200, { pronto: true })
  if (caminho === '/api/autenticacao/entrar' && req.method === 'POST') {
    const dados = await corpo()
    return dados.email === sessao.email && dados.senha === senha
      ? responder(200, { ...sessao, token: 'sessao-de-teste', expiraEm: new Date(Date.now() + 3600000).toISOString() })
      : responder(401, { title: 'Credenciais inválidas' })
  }
  if (req.headers.authorization !== 'Bearer sessao-de-teste')
    return responder(401, { title: 'Autenticação necessária' })
  if (caminho === '/api/autenticacao/usuario-atual') return responder(200, sessao)
  if (caminho === '/api/painel') return responder(200, { totalDeAtivos: 0, colaboradoresAtivos: pessoas.size })
  if (caminho === '/api/relatorios/historico' || caminho === '/api/departamentos') return responder(200, paginar([]))
  if (caminho === '/api/colaboradores') {
    if (req.method === 'GET') return responder(200, paginar([...pessoas.values()]))
    if (req.method === 'POST') {
      const dados = await corpo()
      if ([...pessoas.values()].some(p => p.email === dados.email))
        return responder(409, { detail: 'Já existe um colaborador ativo com esse e-mail.' })
      const pessoa = { ...dados, id: randomUUID(), situacao: 'Ativo' }
      pessoas.set(pessoa.id, pessoa)
      return responder(201, pessoa)
    }
  }
  const [, , recurso, id] = caminho.split('/')
  if (id && pessoas.has(id)) {
    if (recurso === 'colaboradores' && req.method === 'GET') return responder(200, pessoas.get(id))
    if (recurso === 'colaboradores' && req.method === 'PUT') {
      const pessoa = { ...pessoas.get(id), ...await corpo() }
      pessoas.set(id, pessoa)
      return responder(200, pessoa)
    }
    if (recurso === 'contas' && req.method === 'GET') {
      if (contas.has(id)) return responder(200, contas.get(id))
      if (pessoas.get(id).email === 'indisponivel@orquestra.test')
        return responder(503, { detail: 'Consulta de conta indisponível.' })
      if (pessoas.get(id).email === 'legado@orquestra.test')
        return responder(404, { detail: 'O colaborador ainda não tem conta.' })
      return responder(204)
    }
    if (recurso === 'contas' && req.method === 'PUT') {
      const dados = await corpo()
      const conta = { email: pessoas.get(id).email, perfil: dados.perfil }
      contas.set(id, conta)
      return responder(200, conta)
    }
  }
  return responder(404, { title: 'Registro não encontrado' })
}).listen(35244, '127.0.0.1')
