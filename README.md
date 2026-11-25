# Orquestra Web

O Orquestra ajuda a equipe de TI a responder perguntas do dia a dia: com quem está esse notebook, quais equipamentos ainda precisam ser devolvidos e quando foi feita a última manutenção? Este repositório contém a interface que consulta e atualiza esses dados na API do Orquestra.

## Rodar na sua máquina

Use Node.js 22 ou mais recente. Para rodar todas as funcionalidades desta versão, use a [branch de homologação da API](https://github.com/ViniciusCruzSP/Orquestra/tree/feat/homologacao). O README da API explica como preparar o SQL Server e cadastrar o administrador inicial.

Para rodar a API localmente:

```powershell
dotnet run --project Orquestra.API --launch-profile http
```

Depois, neste repositório:

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Abra `http://localhost:3000` e entre com a conta da API. Se a API estiver em outro endereço, ajuste `ORQUESTRA_API_URL` em `.env.local`. Em homologação ou produção use HTTPS e configure o SMTP na API para habilitar a recuperação de senha.

## Primeiro fluxo para testar

1. Cadastre uma categoria e um departamento. Cadastre um colaborador e, no formulário de edição dele, crie sua conta de acesso.
2. Em Inventário, cadastre um computador ou periférico. No detalhe do ativo, selecione **Atribuir ativo** ou use **Registrar entrega** em Custódias para entregar vários equipamentos juntos.
3. Confirme a entrega e abra o termo. Você pode visualizar ou baixar o PDF para assinatura manual.
4. Volte à custódia, registre a devolução e escolha o estado em que o equipamento voltou.
5. Consulte a movimentação no histórico ou exporte o inventário em CSV. A conta de colaborador entra em **Meus ativos**, onde só aparecem as próprias entregas.

## Onde mexer no código

| Pasta | Responsabilidade |
| --- | --- |
| `src/app` | Páginas e rotas do Next.js, separadas entre acesso público e área autenticada |
| `src/features` | Formulários e fluxos organizados por funcionalidade |
| `src/components` | Elementos usados em várias telas, como navegação, tabelas e paginação |
| `src/lib` | Contratos TypeScript, sessão e comunicação com a API |

As páginas carregam os dados pelo servidor Next.js. Os formulários chamam ações do servidor, que usam o token em um cookie HttpOnly para autenticar na API. A API valida as permissões. Para alterar uma tela existente, comece pela pasta dela em `src/app` e siga o componente importado em `src/features`.

Para validar o projeto, rode `npm run lint`, `npm run tipos` e `npm run build`.

## Testes no navegador

Com as dependências instaladas, rode:

```powershell
npx playwright install chromium
npm run testar
```

Os testes em `testes/` sobem o Next e uma API simulada em portas locais dedicadas. Cobrem login inválido, acesso sem sessão, cadastro só com nome e e-mail, edição sem conta, criação de acesso, cadastro duplicado e falha ao consultar a conta. No Windows, defina `$env:ORQUESTRA_TESTES_NAVEGADOR = 'msedge'` se preferir usar o Edge instalado.

## Roteiro manual

1. Cadastre um colaborador só com nome e e-mail. Clique em **Editar**, confirme o aviso **Sem conta de acesso**, altere o nome e salve. Tente cadastrar outro com o mesmo e-mail. A tela deve informar a duplicidade.
2. Na edição, crie uma conta com perfil **Colaborador**. Entre com ela em outra janela anônima. **Meus ativos** deve abrir mesmo antes da primeira entrega.
3. Como administrador, entregue dois equipamentos à mesma pessoa e baixe o termo. Na conta de colaborador, confirme que os dois aparecem em **Meus ativos**.
4. Inicie o desligamento. Devolva só um equipamento e confira que ainda existe uma pendência. Devolva o segundo e conclua o desligamento. Entre novamente com a conta do colaborador para verificar que o acesso foi encerrado.
5. Abra a edição do mesmo ativo em duas abas. Salve em uma e tente salvar na outra. A segunda deve pedir que você recarregue os dados.
