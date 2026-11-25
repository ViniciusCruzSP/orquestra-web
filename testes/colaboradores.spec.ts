import { expect, test, type Page } from '@playwright/test'

async function preencherLogin(page: Page, senha: string) {
  await page.goto('/entrar')
  await page.getByLabel('E-mail').fill('admin@orquestra.test')
  await page.locator('input[name="senha"]').fill(senha)
  await page.getByRole('button', { name: 'Entrar' }).click()
}

async function entrar(page: Page) {
  await preencherLogin(page, 'Orquestra.Testes-123!')
  await expect(page).toHaveURL(/\/painel$/)
}

async function cadastrar(page: Page, nome: string, email: string) {
  await page.goto('/colaboradores/novo')
  await page.getByLabel('Nome completo').fill(nome)
  await page.getByLabel('E-mail corporativo').fill(email)
  await page.getByRole('button', { name: 'Salvar colaborador' }).click()
}

test('cadastro mínimo permite editar dados e criar acesso depois', async ({ page }) => {
  await entrar(page)
  const email = 'pessoa@orquestra.test'
  await cadastrar(page, 'Pessoa inicial', email)
  await expect(page).toHaveURL(/\/colaboradores$/)
  await page.getByRole('row').filter({ hasText: email }).getByRole('link', { name: 'Editar' }).click()
  await expect(page.getByRole('heading', { name: 'Editar colaborador' })).toBeVisible()
  await expect(page.getByText('Sem conta de acesso.')).toBeVisible()
  await page.getByLabel('Nome completo').fill('Pessoa atualizada')
  await page.getByRole('button', { name: 'Salvar colaborador' }).click()
  const linha = page.getByRole('row').filter({ hasText: email })
  await expect(linha).toContainText('Pessoa atualizada')
  await linha.getByRole('link', { name: 'Editar' }).click()
  await page.getByLabel('Senha inicial').fill('Colaborador.Teste-123!')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page.getByText('E-mail da conta: ' + email)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Salvar perfil' })).toBeVisible()
})

test('continua editável com o retorno 404 da API anterior e avisa sobre duplicidade', async ({ page }) => {
  await entrar(page)
  const email = 'legado@orquestra.test'
  await cadastrar(page, 'Pessoa com API anterior', email)
  await expect(page).toHaveURL(/\/colaboradores$/)
  await page.getByRole('row').filter({ hasText: email }).getByRole('link', { name: 'Editar' }).click()
  await expect(page.getByText('Sem conta de acesso.')).toBeVisible()
  await cadastrar(page, 'Duplicado', email)
  await expect(page.getByRole('alert').filter({ hasText: 'Já existe um colaborador ativo com esse e-mail.' })).toBeVisible()
  await expect(page).toHaveURL(/\/colaboradores\/novo$/)
})

test('protege página sem sessão e explica credenciais inválidas', async ({ page }) => {
  await page.goto('/colaboradores')
  await expect(page).toHaveURL(/\/entrar$/)
  await preencherLogin(page, 'incorreta')
  await expect(page.getByRole('alert').filter({ hasText: 'Credenciais inválidas' })).toBeVisible()
  await expect(page).toHaveURL(/\/entrar$/)
})

test('preserva a edição quando a consulta da conta está indisponível', async ({ page }) => {
  await entrar(page)
  const email = 'indisponivel@orquestra.test'
  await cadastrar(page, 'Pessoa de teste', email)
  await expect(page).toHaveURL(/\/colaboradores$/)
  const linha = page.getByRole('row').filter({ hasText: email })
  await linha.getByRole('link', { name: 'Editar' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível consultar a conta de acesso.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Criar conta' })).toHaveCount(0)
  await page.getByLabel('Nome completo').fill('Dados corrigidos')
  await page.getByRole('button', { name: 'Salvar colaborador' }).click()
  await expect(linha).toContainText('Dados corrigidos')
})
