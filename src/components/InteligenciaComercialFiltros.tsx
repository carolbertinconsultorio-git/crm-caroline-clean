import type { ResultadoFiltroInteligencia } from '../utils/filtroInteligenciaComercial'
import {
  alternarResultadoFiltroInteligencia,
  type FiltrosInteligenciaComercial,
} from '../utils/filtroInteligenciaComercial'
import './InteligenciaComercialFiltros.css'

type InteligenciaComercialFiltrosProps = {
  filtros: FiltrosInteligenciaComercial
  onAlterarFiltros: (filtros: FiltrosInteligenciaComercial) => void
  aberto: boolean
  onAlternarAberto: () => void
  filtrosAtivos: boolean
}

const OPCOES_RESULTADO: { valor: ResultadoFiltroInteligencia; rotulo: string }[] = [
  { valor: 'NAO_RESPONDEU', rotulo: 'Não respondeu' },
  { valor: 'VAI_PENSAR', rotulo: 'Vai pensar' },
  { valor: 'SEM_INTERESSE', rotulo: 'Sem interesse' },
]

export default function InteligenciaComercialFiltros({
  filtros,
  onAlterarFiltros,
  aberto,
  onAlternarAberto,
  filtrosAtivos,
}: InteligenciaComercialFiltrosProps) {
  function atualizar(parcial: Partial<FiltrosInteligenciaComercial>) {
    onAlterarFiltros({ ...filtros, ...parcial })
  }

  return (
    <section className="inteligencia-comercial">
      <button
        type="button"
        className="inteligencia-comercial__toggle"
        aria-expanded={aberto}
        aria-controls="inteligencia-comercial-painel"
        onClick={onAlternarAberto}
      >
        <span className="inteligencia-comercial__toggle-titulo">
          🎯 Oportunidades e filtros avançados
        </span>
        {!aberto && filtrosAtivos && (
          <span className="inteligencia-comercial__indicador">Filtros avançados ativos</span>
        )}
        <span className="inteligencia-comercial__toggle-icone" aria-hidden="true">
          {aberto ? '▾' : '▸'}
        </span>
      </button>

      {aberto && (
        <div id="inteligencia-comercial-painel" className="inteligencia-comercial__lista">
          <label className="inteligencia-comercial__opcao">
            <input
              type="checkbox"
              className="inteligencia-comercial__checkbox"
              checked={filtros.nuncaReativar}
              onChange={(e) => atualizar({ nuncaReativar: e.target.checked })}
            />
            <span className="inteligencia-comercial__rotulo">Nunca tentamos reativar</span>
          </label>

          <label className="inteligencia-comercial__opcao">
            <input
              type="checkbox"
              className="inteligencia-comercial__checkbox"
              checked={filtros.campanhaAtiva}
              onChange={(e) => atualizar({ campanhaAtiva: e.target.checked })}
            />
            <span className="inteligencia-comercial__rotulo">Campanha ativa</span>
          </label>

          <label className="inteligencia-comercial__opcao">
            <input
              type="checkbox"
              className="inteligencia-comercial__checkbox"
              checked={filtros.ultimaTentativaMais90Dias}
              onChange={(e) => atualizar({ ultimaTentativaMais90Dias: e.target.checked })}
            />
            <span className="inteligencia-comercial__rotulo">Última tentativa &gt; 90 dias</span>
          </label>

          <fieldset className="inteligencia-comercial__grupo">
            <legend className="inteligencia-comercial__grupo-titulo">Último resultado</legend>
            <div className="inteligencia-comercial__sublista">
              {OPCOES_RESULTADO.map((opcao) => (
                <label key={opcao.valor} className="inteligencia-comercial__opcao">
                  <input
                    type="checkbox"
                    className="inteligencia-comercial__checkbox"
                    checked={filtros.resultados.includes(opcao.valor)}
                    onChange={(e) =>
                      atualizar({
                        resultados: alternarResultadoFiltroInteligencia(
                          filtros.resultados,
                          opcao.valor,
                          e.target.checked,
                        ),
                      })
                    }
                  />
                  <span className="inteligencia-comercial__rotulo">{opcao.rotulo}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </section>
  )
}
