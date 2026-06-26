import './LoginPage.css'

type LoginPageProps = {
  onEntrar: () => void
  entrando: boolean
  erro: string | null
}

export default function LoginPage({ onEntrar, entrando, erro }: LoginPageProps) {
  return (
    <div className="auth-tela">
      <div className="auth-tela__cartao">
        <div className="auth-tela__marca" aria-hidden="true">
          C
        </div>
        <h1 className="auth-tela__titulo">CRM Caroline</h1>
        <p className="auth-tela__texto">
          Entre com sua conta Google para acessar o consultório.
        </p>

        {erro && (
          <p className="auth-tela__erro" role="alert">
            {erro}
          </p>
        )}

        <div className="auth-tela__acoes">
          <button
            type="button"
            className="auth-tela__btn-google"
            onClick={onEntrar}
            disabled={entrando}
          >
            {entrando ? 'Entrando...' : 'Entrar com Google'}
          </button>
        </div>
      </div>
    </div>
  )
}
