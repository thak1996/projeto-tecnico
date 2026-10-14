import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Clock3,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react";

import {
  checkApiHealth,
  type ApiHealth,
} from "../services/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import "./App.css";

function App() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await checkApiHealth();

      setHealth(result);
      setLastChecked(new Date());
    } catch {
      setHealth(null);
      setError("Não foi possível estabelecer conexão com a API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  const isConnected = health !== null && error === null && !loading;

  const status = loading
    ? "checking"
    : isConnected
      ? "online"
      : "offline";

  const formattedTime = lastChecked
    ? lastChecked.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Aguardando verificação";

  return (
    <main className="dashboard">
      <div className="dashboard__ambient" aria-hidden="true" />

      <div className="dashboard__ambient dashboard__ambient--secondary" aria-hidden="true" />

      <div className="dashboard__container">
        <header className="dashboard__header">
          <div className="dashboard__brand">
            <div className="dashboard__brand-icon">
              <Activity size={22} aria-hidden="true" />
            </div>

            <div>
              <p className="dashboard__brand-name">
                Projeto Tecnico
              </p>
            </div>
          </div>

          <div className="dashboard__environment">
            <span className="dashboard__environment-dot" />
            Ambiente de desenvolvimento
          </div>
        </header>

        <section className="dashboard__content">
          <div className="dashboard__intro">
            <div className="dashboard__eyebrow">
              <ShieldCheck size={14} aria-hidden="true" />
              Painel de infraestrutura
            </div>

            <h1 className="dashboard__title">
              Status do sistema
            </h1>

            <p className="dashboard__description">
              Acompanhe a disponibilidade da API e verifique a comunicação
              entre a interface e o backend.
            </p>
          </div>

          <div className="dashboard__grid">
            <Card className="dashboard__card dashboard__health-card">
              <CardHeader className="dashboard__card-header">
                <div>
                  <CardDescription className="dashboard__card-description">
                    <Server size={15} aria-hidden="true" />
                    API principal
                  </CardDescription>

                  <CardTitle className="dashboard__card-title">
                    Saúde do serviço
                  </CardTitle>
                </div>

                <button
                  type="button"
                  onClick={() => void loadHealth()}
                  disabled={loading}
                  aria-label="Verificar conexão novamente"
                  className="dashboard__refresh-button"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "dashboard__spin" : ""}
                    aria-hidden="true"
                  />
                  <span>Atualizar</span>
                </button>
              </CardHeader>

              <CardContent className="dashboard__card-content">
                <div className="dashboard__status-row">
                  <div className={`dashboard__status-icon dashboard__status-icon--${status}`}>
                    {loading ? (
                      <RefreshCw
                        size={26}
                        className="dashboard__spin"
                        aria-hidden="true"
                      />
                    ) : isConnected ? (
                      <CheckCircle2 size={27} aria-hidden="true" />
                    ) : (
                      <CircleAlert size={27} aria-hidden="true" />
                    )}
                  </div>

                  <div className="dashboard__status-copy">
                    <p className="dashboard__status-title">
                      {loading
                        ? "Verificando conexão"
                        : isConnected
                          ? "Serviço operacional"
                          : "Falha na conexão"}
                    </p>

                    <p className="dashboard__status-description">
                      {loading
                        ? "Aguardando resposta do backend..."
                        : isConnected
                          ? "A API respondeu à solicitação."
                          : "Verifique a API e sua configuração de rede."}
                    </p>
                  </div>

                  <span className={`dashboard__status-badge dashboard__status-badge--${status}`}>
                    <span className="dashboard__status-badge-dot" />
                    {loading ? "Pendente" : isConnected ? "Online" : "Offline"}
                  </span>
                </div>

                {error && (
                  <div className="dashboard__error" role="alert">
                    <CircleAlert size={17} aria-hidden="true" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="dashboard__metrics">
                  <div className="dashboard__metric">
                    <span className="dashboard__metric-label">
                      Status retornado
                    </span>

                    <span className="dashboard__metric-value dashboard__metric-value--mono">
                      {loading ? "..." : health?.status ?? "Indisponível"}
                    </span>
                  </div>

                  <div className="dashboard__metric">
                    <span className="dashboard__metric-label">
                      Aplicação
                    </span>

                    <span className="dashboard__metric-value dashboard__metric-value--truncate">
                      {loading
                        ? "..."
                        : health?.application ?? "Indisponível"}
                    </span>
                  </div>
                </div>

                <div className="dashboard__last-checked">
                  <Clock3 size={14} aria-hidden="true" />
                  <span>Última verificação: {formattedTime}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard__card dashboard__overview-card">
              <CardHeader>
                <CardDescription className="dashboard__card-description">
                  Visão geral
                </CardDescription>

                <CardTitle className="dashboard__card-title">
                  Componentes do sistema
                </CardTitle>
              </CardHeader>

              <CardContent className="dashboard__overview-content">
                <div className="dashboard__component">
                  <div className="dashboard__component-icon dashboard__component-icon--frontend">
                    <Activity size={18} aria-hidden="true" />
                  </div>

                  <div className="dashboard__component-copy">
                    <p className="dashboard__component-name">Frontend</p>
                    <p className="dashboard__component-description">
                      React + TypeScript
                    </p>
                  </div>

                  <span className="dashboard__component-status dashboard__component-status--active">
                    Interface carregada
                  </span>
                </div>

                <div className="dashboard__component">
                  <div className="dashboard__component-icon dashboard__component-icon--api">
                    <Server size={18} aria-hidden="true" />
                  </div>

                  <div className="dashboard__component-copy">
                    <p className="dashboard__component-name">API .NET</p>
                    <p className="dashboard__component-description">
                      Serviço backend
                    </p>
                  </div>

                  <span className={`dashboard__component-status dashboard__component-status--${status}`}>
                    {loading
                      ? "Verificando"
                      : isConnected
                        ? "Conectada"
                        : "Sem conexão"}
                  </span>
                </div>

              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="dashboard__footer">
          <span>React · TypeScript · shadcn/ui · .NET</span>
        </footer>
      </div>
    </main>
  );
}

export default App;