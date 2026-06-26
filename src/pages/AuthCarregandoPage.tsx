import './LoginPage.css'

export default function AuthCarregandoPage() {
  return (
    <div className="auth-tela" role="status" aria-live="polite">
      <div className="auth-tela__cartao">
        <p className="auth-tela__texto" style={{ marginBottom: 0 }}>
          Verificando sessão...
        </p>
      </div>
    </div>
  )
}
