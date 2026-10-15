import React, { useState } from "react";
import { UserCheck, UserX, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardProfessorElegivel } from "./CardProfessorElegivel";
import { CardProfessorInelegivel } from "./CardProfessorInelegivel";
import { GradeSemanalProfessor } from "./GradeSemanalProfessor";
import type { BuscaProfessoresResultado, DiaSemana, HorarioAgendado } from "../types/busca";

export interface ListaResultadosProfessoresProps {
  resultado: BuscaProfessoresResultado | null;
  isLoading: boolean;
  erro: string | null;
  diasPesquisados?: DiaSemana[];
  duracaoAulaMinutos?: number;
  modoCatalogoGeral?: boolean;
  onTentarNovamente?: () => void;
}

export const ListaResultadosProfessores: React.FC<ListaResultadosProfessoresProps> = ({
  resultado,
  isLoading,
  erro,
  diasPesquisados = ["segunda", "quarta"],
  duracaoAulaMinutos = 60,
  modoCatalogoGeral = false,
  onTentarNovamente,
}) => {
  const [professorSelecionadoId, setProfessorSelecionadoId] = useState<number | null>(null);
  const [horariosSelecionados, setHorariosSelecionados] = useState<HorarioAgendado[]>([]);

  // Ajusta o estado de seleção durante a renderização quando o resultado mudar (padrão React 19 sem effect cascata)
  const [prevResultado, setPrevResultado] = useState(resultado);
  if (resultado !== prevResultado) {
    setPrevResultado(resultado);
    setHorariosSelecionados([]);
    setProfessorSelecionadoId(null);
  }

  const handleToggleHorario = (dia: DiaSemana, horario: string) => {
    setHorariosSelecionados((prev) => {
      const exists = prev.some((s) => s.dia === dia && s.horario === horario);
      if (exists) {
        return prev.filter((s) => !(s.dia === dia && s.horario === horario));
      }
      return [...prev, { dia, horario }];
    });
  };

  const handleRemoverHorario = (dia: DiaSemana, horario: string) => {
    setHorariosSelecionados((prev) =>
      prev.filter((s) => !(s.dia === dia && s.horario === horario))
    );
  };

  const handleLimparHorarios = () => {
    setHorariosSelecionados([]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="loading-state">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
              <div className="mt-4 h-6 w-full rounded bg-muted" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <Card className="border-destructive/40 bg-destructive/5" data-testid="error-state">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-destructive">Falha na consulta</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">{erro}</p>
          {onTentarNovamente && (
            <Button
              variant="outline"
              onClick={onTentarNovamente}
              className="mt-4 border-destructive/30 hover:bg-destructive/10 cursor-pointer"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!resultado) {
    return null;
  }

  const { elegiveis, naoElegiveis } = resultado;
  const total = elegiveis.length + naoElegiveis.length;

  if (total === 0) {
    return (
      <Card data-testid="empty-state">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
          <h3 className="text-base font-semibold">Nenhum professor cadastrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Não foram encontrados dados de professores na base.
          </p>
        </CardContent>
      </Card>
    );
  }

  const professorAtivo =
    elegiveis.find((p) => p.id === professorSelecionadoId) ?? elegiveis[0] ?? null;

  const diasAtivos = modoCatalogoGeral
    ? (["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"] as DiaSemana[])
    : diasPesquisados;

  return (
    <div className="space-y-10">
      {/* Passo 2: Professores Elegíveis e Grade Semanal */}
      <section aria-labelledby="secao-passo-2" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5">
              Passo 2
            </Badge>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              <h2 id="secao-passo-2" className="text-lg sm:text-xl font-bold text-foreground">
                Professores Elegíveis ({elegiveis.length})
              </h2>
              {modoCatalogoGeral && (
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                  Todos os Disponíveis
                </Badge>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {modoCatalogoGeral
              ? "Exibindo todos os professores disponíveis com grade em todas as datas de expediente"
              : "Ordenados por menor número de aulas na semana"}
          </span>
        </div>

        {elegiveis.length === 0 ? (
          <Card className="border-dashed bg-muted/20" data-testid="empty-elegiveis">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm font-medium text-foreground">
                Nenhum professor atendeu a todos os critérios da sua busca.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente ampliar a faixa de horário ou selecionar outros dias da semana no Passo 1 acima.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {elegiveis.map((prof) => (
                <CardProfessorElegivel
                  key={prof.id}
                  professor={prof}
                  isSelected={professorAtivo?.id === prof.id}
                  onSelect={() => {
                    setProfessorSelecionadoId(prof.id);
                    setHorariosSelecionados([]);
                  }}
                />
              ))}
            </div>

            {/* Grade Semanal Interativa do Professor Selecionado */}
            {professorAtivo && (
              <div className="pt-2" data-testid="grade-semanal-container">
                <GradeSemanalProfessor
                  professor={professorAtivo}
                  diasPesquisados={diasAtivos}
                  horariosSelecionados={horariosSelecionados}
                  duracaoAulaMinutos={duracaoAulaMinutos}
                  onToggleHorario={handleToggleHorario}
                  onRemoverHorario={handleRemoverHorario}
                  onLimparHorarios={handleLimparHorarios}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Passo 3: Professores Não Disponíveis */}
      {naoElegiveis.length > 0 && (
        <section aria-labelledby="secao-passo-3" className="space-y-4 pt-4 border-t border-border/40">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
            <div className="flex items-center gap-2.5">
              <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 border-amber-500/30">
                Passo 3
              </Badge>
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-amber-500" aria-hidden="true" />
                <h2 id="secao-passo-3" className="text-lg sm:text-xl font-bold text-foreground">
                  Professores Não Disponíveis ({naoElegiveis.length})
                </h2>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              Identificados com os motivos específicos da indisponibilidade
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {naoElegiveis.map((prof) => (
              <CardProfessorInelegivel key={prof.id} professor={prof} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
