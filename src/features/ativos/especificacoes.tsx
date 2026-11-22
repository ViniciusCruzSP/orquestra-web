'use client'

import { useState } from 'react'
import type { Especificacoes as Dados } from '@/lib/contratos'

export function Especificacoes({ dados }: { dados?: Dados | null }) {
  const [tipo, definir] = useState(dados?.tipo ?? 'Computador')
  return <>
    <label>Tipo<select name="tipo" value={tipo} onChange={e => definir(e.target.value)}>
      <option>Computador</option><option>Periférico</option>
    </select></label>
    <label>Data de aquisição<input type="date" name="adquiridoEm" defaultValue={dados?.adquiridoEm ?? ''} /></label>
    {tipo === 'Computador' ? <>
      <label>Processador<input name="processador" maxLength={120} defaultValue={dados?.processador ?? ''} required /></label>
      <label>Memória RAM<input name="memoriaRam" maxLength={50} defaultValue={dados?.memoriaRam ?? ''} required /></label>
      <label>Armazenamento<input name="armazenamento" maxLength={80} defaultValue={dados?.armazenamento ?? ''} required /></label>
      <label>Sistema operacional<input name="sistemaOperacional" maxLength={100} defaultValue={dados?.sistemaOperacional ?? ''} required /></label>
    </> : <label>Tipo de periférico<input name="tipoPeriferico" maxLength={50} defaultValue={dados?.tipoPeriferico ?? ''} required /></label>}
  </>
}
