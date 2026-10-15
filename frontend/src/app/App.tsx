import { useCallback, useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

import {
  buscarProfessores,
  obterTodosProfessores,
} from "../features/professores/services/professoresService";

import { BuscaProfessoresForm } from "../features/professores/components/BuscaProfessoresForm";
import { ListaResultadosProfessores } from "../features/professores/components/ListaResultadosProfessores";
import type {
  BuscaProfessoresFiltros,
  BuscaProfessoresResultado,
} from "../features/professores/types/busca";

import "./App.css";

function App() {
  const [resultado, setResultado] = useState<BuscaProfessoresResultado | null>(null);
  const [buscaLoading, setBuscaLoading] = useState(false);
  const [buscaErro, setBuscaErro] = useState<string | null>(null);
  const [ultimosFiltros, setUltimosFiltros] = useState<BuscaProfessoresFiltros | null>(null);
  const [modoCatalogoGeral, setModoCatalogoGeral] = useState(false);

  const handleBuscar = useCallback(async (filtros: BuscaProfessoresFiltros) => {
    setBuscaLoading(true);
    setBuscaErro(null);
    setModoCatalogoGeral(false);
    setUltimosFiltros(filtros);

    try {
      const data = await buscarProfessores(filtros);
      setResultado(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado ao consultar professores.";
      setBuscaErro(msg);
      setResultado(null);
    } finally {
      setBuscaLoading(false);
    }
  }, []);

  const handleLimparBusca = useCallback(async () => {
    setBuscaLoading(true);
    setBuscaErro(null);
    setModoCatalogoGeral(true);
    setUltimosFiltros(null);

    try {
      const data = await obterTodosProfessores();
      setResultado(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado ao consultar catálogo de professores.";
      setBuscaErro(msg);
      setResultado(null);
    } finally {
      setBuscaLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      const filtrosIniciais: BuscaProfessoresFiltros = {
        idioma: "Inglês",
        dias: ["segunda", "quarta"],
        inicioFaixa: "18:00",
        fimFaixa: "22:00",
        duracaoMinutos: 60,
      };

      if (isMounted) {
        setUltimosFiltros(filtrosIniciais);
        setBuscaLoading(true);
      }

      try {
        const data = await buscarProfessores(filtrosIniciais);
        if (isMounted) setResultado(data);
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Erro inesperado ao consultar professores.";
          setBuscaErro(msg);
        }
      } finally {
        if (isMounted) setBuscaLoading(false);
      }
    }

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased w-full overflow-x-hidden">
      {/* Background ambient gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

      <div className="relative mx-auto max-w-6xl px-3.5 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Encontre um Professor
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pesquise professores de idiomas por disponibilidade e grade de horários
              </p>
            </div>
          </div>
        </header>

        {/* Content Layout: Fluxo Vertical Contínuo em 3 Passos */}
        <main className="mt-8 space-y-10">
          {/* Passo 1: Formulário de Critérios de Busca */}
          <section aria-labelledby="passo-1-filtros">
            <BuscaProfessoresForm
              onBuscar={(f) => void handleBuscar(f)}
              onLimpar={() => void handleLimparBusca()}
              isLoading={buscaLoading}
            />
          </section>

          {/* Passo 2 e Passo 3: Resultados e Grade Semanal */}
          <ListaResultadosProfessores
            resultado={resultado}
            isLoading={buscaLoading}
            erro={buscaErro}
            modoCatalogoGeral={modoCatalogoGeral}
            diasPesquisados={modoCatalogoGeral ? [] : (ultimosFiltros?.dias ?? [])}
            duracaoAulaMinutos={ultimosFiltros?.duracaoMinutos ?? 60}
            onTentarNovamente={
              modoCatalogoGeral
                ? () => void handleLimparBusca()
                : ultimosFiltros
                  ? () => void handleBuscar(ultimosFiltros)
                  : undefined
            }
          />
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t pt-6 text-center text-xs text-muted-foreground">
          <span>Encontre um Professor · Desafio Técnico Full Stack · React, Vite, Tailwind CSS, .NET 8</span>
        </footer>
      </div>
    </div>
  );
}

export default App;