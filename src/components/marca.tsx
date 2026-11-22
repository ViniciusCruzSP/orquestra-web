import Image from 'next/image'

export function Marca() {
  return <div className="marca">
    <Image src="/marca.png" alt="" width={52} height={52} priority />
    <div><strong>ORQUESTRA</strong><small>Gestão e Controle de Ativos de TI</small></div>
  </div>
}
