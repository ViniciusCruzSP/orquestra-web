'use client'

export default function Erro({ reset }: { reset: () => void }) {
  return <section className="cartao vazio">
    <h1>Não foi possível carregar esta tela</h1>
    <p>Confira se a API está disponível e se a sua conta tem acesso a esta área.</p>
    <button className="botao" onClick={reset}>Tentar novamente</button>
  </section>
}
