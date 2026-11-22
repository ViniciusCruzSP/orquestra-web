# Orquestra Web

O Orquestra ajuda a equipe de TI a responder perguntas do dia a dia: com quem está esse notebook, quais equipamentos ainda precisam ser devolvidos e quando foi feita a última manutenção? Este repositório contém a interface que consulta e atualiza esses dados na API do Orquestra.

## Rodar na sua máquina

Use Node.js 22 ou mais recente e a API ASP.NET Core do Orquestra na branch `feat/contas-e-recuperacao` ou na branch de integração que a contenha. Prepare o SQL Server e o administrador inicial conforme o README da API.

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
