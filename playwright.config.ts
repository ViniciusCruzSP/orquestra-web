import { defineConfig } from '@playwright/test'

const web = 'http://127.0.0.1:33100'
const api = 'http://127.0.0.1:35244'

export default defineConfig({
  testDir: './testes',
  workers: 1,
  use: {
    baseURL: web,
    channel: process.env.ORQUESTRA_TESTES_NAVEGADOR || undefined,
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'node testes/api-simulada.mjs', url: api },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 33100',
      url: web + '/entrar',
      env: { ORQUESTRA_API_URL: api },
    },
  ],
})
