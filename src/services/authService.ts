import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

export function observarSessao(callback: (usuario: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

export async function entrarComGoogle(): Promise<void> {
  const provedor = new GoogleAuthProvider()
  await signInWithPopup(auth, provedor)
}

export async function sair(): Promise<void> {
  await signOut(auth)
}
