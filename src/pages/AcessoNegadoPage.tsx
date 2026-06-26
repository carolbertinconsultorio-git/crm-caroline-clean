import './LoginPage.css'

type AcessoNegadoPageProps = {
  email: string | null
  onSair: () => void
}

export default function AcessoNegadoPage({ email, onSair }: AcessoNegadoPageProps) {
  return (
    <div className="auth-tela">
      <div className="auth-tela__cartao auth-tela--negado">
        <div className="auth-tela__marca" aria-hidden="true">
          C
        </div>
        <h1 className="auth-tela__titulo">Acesso negado</h1>
        <p className="auth-tela__texto">
          Seu e-mail foi reconhecido, mas ainda não possui autorização para acessar este
          CRM.
        </p>
        {email && (
          <p className="auth-tela__email-conectado">
            <span className="auth-tela__email-rotulo">E-mail conectado:</span>
            <span className="auth-tela__email">{email}</span>
          </p>
        )}
        <p className="auth-tela__texto">
          Se você acredita que isso é um engano, entre em contato com a administradora do
          sistema.
        </p>

        <div className="auth-tela__acoes">
          <button type="button" className="btn btn--secundario" onClick={onSair}>
            Entrar com outra conta
          </button>
          <button type="button" className="btn btn--secundario" onClick={onSair}>
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
