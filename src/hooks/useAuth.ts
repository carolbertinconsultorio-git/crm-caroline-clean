import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { emailPermitido } from '../config/authAllowlist'
import {
  entrarComGoogle as entrarComGoogleService,
  observarSessao,
  sair as sairService,
} from '../services/authService'

export type AuthStatus =
  | 'carregando'
  | 'nao_logado'
  | 'autorizado'
  | 'nao_autorizado'

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>('carregando')
  const [usuario, setUsuario] = useState<User | null>(null)
  const [erroLogin, setErroLogin] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)

  useEffect(() => {
    return observarSessao((firebaseUser) => {
      if (!firebaseUser) {
        setUsuario(null)
        setStatus('nao_logado')
        return
      }

      setUsuario(firebaseUser)

      if (emailPermitido(firebaseUser.email)) {
        setStatus('autorizado')
        return
      }

      setStatus('nao_autorizado')
    })
  }, [])

  async function entrarComGoogle() {
    setErroLogin(null)
    setEntrando(true)

    try {
      await entrarComGoogleService()
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : 'Não foi possível entrar com Google.'
      setErroLogin(mensagem)
    } finally {
      setEntrando(false)
    }
  }

  async function sair() {
    setErroLogin(null)
    await sairService()
  }

  return {
    status,
    usuario,
    erroLogin,
    entrando,
    entrarComGoogle,
    sair,
  }
}
